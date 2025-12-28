import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIService, Message } from '@/lib/ai/ai-service'
import { buildSystemPrompt, buildStockContext } from '@/lib/ai/prompt-builder'
import { StockDataFetcher } from '@/lib/data/stock-fetcher'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check rate limit
    if (profile.daily_chat_count >= profile.chat_limit) {
      return NextResponse.json(
        { error: 'Daily chat limit reached' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { messages, sessionId, stockCode } = body as {
      messages: Message[]
      sessionId?: string
      stockCode?: string
    }

    // Build context
    let stockContext = ''
    if (stockCode) {
      const stockData = await StockDataFetcher.getStockData(stockCode, supabase)
      if (stockData) {
        stockContext = buildStockContext(stockData)
      }
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt({
      userLevel: profile.user_level,
      tradingStyle: profile.trading_style,
      stockContext,
    })

    // Prepare messages with system prompt
    const aiMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    // Call AI service
    const response = await AIService.chat(aiMessages)

    // Save chat message
    if (sessionId) {
      await supabase.from('chat_messages').insert([
        {
          session_id: sessionId,
          role: 'user',
          content: messages[messages.length - 1].content,
        },
        {
          session_id: sessionId,
          role: 'assistant',
          content: response.content,
          model_used: response.model,
          tokens_used: response.tokensUsed,
          response_time_ms: response.responseTime,
        },
      ])

      // Update session message count
      await supabase
        .from('chat_sessions')
        .update({
          message_count: supabase.raw('message_count + 2'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
    }

    // Increment daily chat count
    await supabase
      .from('profiles')
      .update({
        daily_chat_count: profile.daily_chat_count + 1,
      })
      .eq('id', user.id)

    return NextResponse.json({
      content: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      remainingChats: profile.chat_limit - profile.daily_chat_count - 1,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
