import { createClient } from '@/lib/supabase/server'

interface GetUsersParams {
  page?: number
  search?: string
  tier?: string
  level?: string
  limit?: number
}

export async function getUsers({
  page = 1,
  search = '',
  tier = '',
  level = '',
  limit = 50,
}: GetUsersParams = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*, chat_sessions(count)', { count: 'exact' })

  // Apply search filter
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`)
  }

  // Apply tier filter
  if (tier) {
    query = query.eq('subscription_tier', tier)
  }

  // Apply level filter
  if (level) {
    query = query.eq('user_level', level)
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: users, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching users:', error)
    return { users: [], count: 0, totalPages: 0 }
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    users: users || [],
    count: count || 0,
    totalPages,
  }
}

export async function getUserById(userId: string) {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('profiles')
    .select(`
      *,
      chat_sessions(count),
      watchlists(count),
      alerts(count)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  // Get recent chat sessions
  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('id, title, message_count, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    ...user,
    recentSessions: sessions || [],
  }
}
