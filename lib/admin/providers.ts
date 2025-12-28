import { createClient } from '@/lib/supabase/server'

export async function getProviders() {
  const supabase = await createClient()

  const { data: providers, error } = await supabase
    .from('ai_providers')
    .select('*')
    .order('priority', { ascending: true })

  if (error) {
    console.error('Error fetching providers:', error)
    return []
  }

  return providers || []
}

export async function getProviderById(id: string) {
  const supabase = await createClient()

  const { data: provider, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching provider:', error)
    return null
  }

  return provider
}
