// Types for AI service
export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface AIResponse {
  content: string
  model?: string
  tokensUsed?: number
  responseTime?: number
}

export interface AIProvider {
  id: string
  provider_name: string
  provider_type: 'openai' | 'pollinations'
  base_url: string
  api_key_encrypted: string
  model_name: string
  is_active: boolean
  priority: number
  rate_limit: number
  max_tokens: number
  temperature: number
  supports_streaming: boolean
}

export interface AIAdapter {
  chat(messages: Message[], options?: ChatOptions): Promise<AIResponse>
  chatStream(messages: Message[], options?: ChatOptions): Promise<ReadableStream>
}
