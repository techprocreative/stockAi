'use client'

import { useEffect, useState } from 'react'
import { GlossaryTooltip } from './glossary-tooltip'

interface GlossaryTerm {
  term: string
  definition: string
  category: string
}

interface GlossaryHighlightedTextProps {
  text: string
}

export function GlossaryHighlightedText({ text }: GlossaryHighlightedTextProps) {
  const [highlightedContent, setHighlightedContent] = useState<React.ReactNode>(text)

  useEffect(() => {
    const detectAndHighlight = async () => {
      try {
        // Fetch detected terms from API
        const response = await fetch('/api/glossary/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          setHighlightedContent(text)
          return
        }

        const { terms } = await response.json() as { terms: GlossaryTerm[] }

        if (!terms || terms.length === 0) {
          setHighlightedContent(text)
          return
        }

        // Build content with tooltips
        const content = buildContentWithTooltips(text, terms)
        setHighlightedContent(content)
      } catch (error) {
        console.error('Failed to detect glossary terms:', error)
        setHighlightedContent(text)
      }
    }

    detectAndHighlight()
  }, [text])

  return <>{highlightedContent}</>
}

function buildContentWithTooltips(text: string, terms: GlossaryTerm[]): React.ReactNode {
  // Sort terms by length (longest first) to avoid partial replacements
  const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length)

  // Track positions that have been replaced
  const segments: Array<{ start: number; end: number; term?: GlossaryTerm; text: string }> = []

  let remainingText = text
  let offset = 0

  // Find all term occurrences
  for (const term of sortedTerms) {
    const regex = new RegExp(`\\b(${escapeRegex(term.term)})\\b`, 'gi')
    let match

    while ((match = regex.exec(text)) !== null) {
      const start = match.index
      const end = start + match[0].length

      // Check if this position overlaps with an existing segment
      const overlaps = segments.some(
        (seg) => (start >= seg.start && start < seg.end) || (end > seg.start && end <= seg.end)
      )

      if (!overlaps) {
        segments.push({
          start,
          end,
          term,
          text: match[0],
        })
      }
    }
  }

  // Sort segments by position
  segments.sort((a, b) => a.start - b.start)

  // Build the final content
  const content: React.ReactNode[] = []
  let currentPos = 0

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    // Add text before this segment
    if (currentPos < segment.start) {
      content.push(text.substring(currentPos, segment.start))
    }

    // Add the tooltip
    if (segment.term) {
      content.push(
        <GlossaryTooltip
          key={`${segment.start}-${segment.end}`}
          term={segment.term.term}
          definition={segment.term.definition}
          category={segment.term.category}
        >
          {segment.text}
        </GlossaryTooltip>
      )
    }

    currentPos = segment.end
  }

  // Add remaining text
  if (currentPos < text.length) {
    content.push(text.substring(currentPos))
  }

  return content.length > 0 ? content : text
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
