import { Message, ChatOptions, AIResponse, AIProvider, AIAdapter } from '../types'

export class PollinationsAdapter implements AIAdapter {
  constructor(private provider: AIProvider) {}

  async chat(messages: Message[], options?: ChatOptions): Promise<AIResponse> {
    const startTime = Date.now()

    const response = await fetch(`${this.provider.base_url}/openai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.provider.model_name,
        messages: messages,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.statusText}`)
    }

    const data = await response.json()
    const responseTime = Date.now() - startTime

    return {
      content: data.choices[0]?.message?.content || '',
      model: this.provider.model_name,
      tokensUsed: data.usage?.total_tokens,
      responseTime,
    }
  }

  async chatStream(messages: Message[], options?: ChatOptions): Promise<ReadableStream> {
    const response = await fetch(`${this.provider.base_url}/openai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.provider.model_name,
        messages: messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.statusText}`)
    }

    return response.body!
  }
}
