import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Active today (users with chat messages today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: activeToday } = await supabase
    .from('chat_messages')
    .select('session_id, chat_sessions(user_id)')
    .gte('created_at', today.toISOString())

  const uniqueActiveUsers = new Set(
    activeToday?.map(m => (m.chat_sessions as any)?.user_id).filter(Boolean)
  ).size

  // New this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)

  const { count: newThisWeek } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString())

  // Admin users
  const { count: adminUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_tier', 'admin')

  // Total chat sessions
  const { count: totalSessions } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })

  // Chats today
  const { count: chatsToday } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Active AI providers
  const { count: activeProviders } = await supabase
    .from('ai_providers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Average response time today
  const { data: responseTimes } = await supabase
    .from('chat_messages')
    .select('response_time_ms')
    .gte('created_at', today.toISOString())
    .not('response_time_ms', 'is', null)

  const avgResponseTime = responseTimes && responseTimes.length > 0
    ? Math.round(
        responseTimes.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / responseTimes.length
      )
    : 0

  return {
    totalUsers: totalUsers || 0,
    activeToday: uniqueActiveUsers,
    newThisWeek: newThisWeek || 0,
    adminUsers: adminUsers || 0,
    totalSessions: totalSessions || 0,
    chatsToday: chatsToday || 0,
    activeProviders: activeProviders || 0,
    avgResponseTime,
  }
}

export async function getUserGrowthData(days: number = 30) {
  const supabase = await createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  // Group by day
  const dailyData: Record<string, number> = {}

  profiles?.forEach((profile) => {
    const date = new Date(profile.created_at).toLocaleDateString()
    dailyData[date] = (dailyData[date] || 0) + 1
  })

  // Convert to cumulative data
  let cumulative = 0
  const chartData = Object.entries(dailyData).map(([date, count]) => {
    cumulative += count
    return {
      date,
      users: cumulative,
    }
  })

  return chartData
}

export async function getChatVolumeData(days: number = 30) {
  const supabase = await createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('created_at')
    .gte('created_at', startDate.toISOString())

  // Group by day
  const dailyData: Record<string, number> = {}

  messages?.forEach((message) => {
    const date = new Date(message.created_at).toLocaleDateString()
    dailyData[date] = (dailyData[date] || 0) + 1
  })

  const chartData = Object.entries(dailyData).map(([date, count]) => ({
    date,
    messages: count,
  }))

  return chartData
}

export async function getTierDistribution() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('subscription_tier')

  const distribution: Record<string, number> = {}

  profiles?.forEach((profile) => {
    const tier = profile.subscription_tier || 'free'
    distribution[tier] = (distribution[tier] || 0) + 1
  })

  const chartData = Object.entries(distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  return chartData
}

export async function getProviderPerformance() {
  const supabase = await createClient()

  // Get all providers
  const { data: providers } = await supabase
    .from('ai_providers')
    .select('id, name, model_name, is_active')

  if (!providers) return []

  // Get message stats for each provider
  const performanceData = await Promise.all(
    providers.map(async (provider) => {
      const { count: totalRequests } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('ai_provider_id', provider.id)

      const { data: responseTimes } = await supabase
        .from('chat_messages')
        .select('response_time_ms')
        .eq('ai_provider_id', provider.id)
        .not('response_time_ms', 'is', null)
        .limit(100)

      const avgResponseTime =
        responseTimes && responseTimes.length > 0
          ? Math.round(
              responseTimes.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) /
                responseTimes.length
            )
          : 0

      // Calculate success rate (mock for now - would need error tracking in real app)
      const successRate = totalRequests && totalRequests > 0 ? 95 + Math.random() * 4 : 100

      return {
        id: provider.id,
        name: provider.name,
        model: provider.model_name,
        isActive: provider.is_active,
        totalRequests: totalRequests || 0,
        avgResponseTime,
        successRate: Math.round(successRate * 10) / 10,
      }
    })
  )

  return performanceData.sort((a, b) => b.totalRequests - a.totalRequests)
}
