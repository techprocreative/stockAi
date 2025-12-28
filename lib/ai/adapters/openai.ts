import { Message, ChatOptions, AIResponse, AIProvider, AIAdapter } from './types'

export class OpenAIAdapter implements AIAdapter {
  constructor(private provider: AIProvider) {}

  async chat(messages: Message[], options?: ChatOptions): Promise<AIResponse> {
    const startTime = Date.now()

    const response = await fetch(`${this.provider.base_url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.provider.api_key_encrypted}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.provider.model_name,
        messages: messages,
        temperature: options?.temperature ?? this.provider.temperature,
        max_tokens: options?.maxTokens ?? this.provider.max_tokens,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const responseTime = Date.now() - startTime

    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      tokensUsed: data.usage?.total_tokens,
      responseTime,
    }
  }

  async chatStream(messages: Message[], options?: ChatOptions): Promise<ReadableStream> {
    const response = await fetch(`${this.provider.base_url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.provider.api_key_encrypted}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.provider.model_name,
        messages: messages,
        temperature: options?.temperature ?? this.provider.temperature,
        max_tokens: options?.maxTokens ?? this.provider.max_tokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    return response.body!
  }
}
