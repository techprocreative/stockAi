import { NextRequest, NextResponse } from 'next/server'
import { GlossaryService } from '@/lib/glossary/glossary-service'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const terms = await GlossaryService.detectTermsInText(text)

    return NextResponse.json({ terms })
  } catch (error) {
    console.error('Glossary detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect terms' },
      { status: 500 }
    )
  }
}
