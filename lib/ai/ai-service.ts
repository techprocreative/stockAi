import { createClient } from '@/lib/supabase/server'
import { Message, ChatOptions, AIResponse, AIProvider } from './types'
import { OpenAIAdapter } from './adapters/openai'
import { PollinationsAdapter } from './adapters/pollinations'

// Cache for active provider (5 minutes)
let cachedProvider: AIProvider | null = null
let cacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export class AIService {
  private static async getActiveProvider(): Promise<AIProvider> {
    const now = Date.now()

    // Return cached provider if still valid
    if (cachedProvider && (now - cacheTime) < CACHE_DURATION) {
      return cachedProvider
    }

    // Fetch active provider from database
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error || !data) {
      throw new Error('No active AI provider found')
    }

    // Update cache
    cachedProvider = data as AIProvider
    cacheTime = now

    return cachedProvider
  }

  static async chat(messages: Message[], options?: ChatOptions): Promise<AIResponse> {
    const provider = await this.getActiveProvider()
    const adapter = this.getAdapter(provider)

    try {
      return await adapter.chat(messages, options)
    } catch (error) {
      console.error('AI chat error:', error)
      throw error
    }
  }

  static async chatStream(messages: Message[], options?: ChatOptions): Promise<ReadableStream> {
    const provider = await this.getActiveProvider()
    const adapter = this.getAdapter(provider)

    try {
      return await adapter.chatStream(messages, options)
    } catch (error) {
      console.error('AI chat stream error:', error)
      throw error
    }
  }

  private static getAdapter(provider: AIProvider) {
    switch (provider.provider_type) {
      case 'openai':
        return new OpenAIAdapter(provider)
      case 'pollinations':
        return new PollinationsAdapter(provider)
      default:
        throw new Error(`Unsupported provider type: ${provider.provider_type}`)
    }
  }
}

export { type Message, type ChatOptions, type AIResponse }
