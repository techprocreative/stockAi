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
