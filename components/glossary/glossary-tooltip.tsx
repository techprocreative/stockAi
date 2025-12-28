'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface GlossaryTooltipProps {
  term: string
  definition: string
  category?: string
  children: React.ReactNode
}

export function GlossaryTooltip({ term, definition, category, children }: GlossaryTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      })
      setIsVisible(true)
    }
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <span
        ref={triggerRef}
        className="cursor-help underline decoration-dotted decoration-primary-500 underline-offset-2 text-primary-600"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleMouseEnter}
      >
        {children}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 w-80 rounded-lg border border-border bg-background p-4 shadow-lg"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-foreground">{term}</h4>
              {category && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-600">
                  {category}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{definition}</p>
          </div>
        </div>
      )}
    </>
  )
}
