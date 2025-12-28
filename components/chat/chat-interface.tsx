'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GlossaryHighlightedText } from '@/components/glossary/glossary-highlighted-text'
import { Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  content: string
  model?: string
  tokensUsed?: number
  remainingChats?: number
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      return response.json() as Promise<ChatResponse>
    },
    onSuccess: (data, userMessage) => {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: data.content },
      ])
      setInput('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || chatMutation.isPending) return
    chatMutation.mutate(input)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Selamat datang di Chat AI!</CardTitle>
              <CardDescription>
                Tanya apa saja tentang saham Indonesia. Contoh:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Analisa saham BBRI dong</li>
                <li>Apa itu PER dan PBV?</li>
                <li>Saham banking mana yang bagus?</li>
                <li>Gimana cara baca laporan keuangan?</li>
              </ul>
            </CardContent>
          </Card>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'assistant' ? (
                  <p className="text-sm whitespace-pre-wrap">
                    <GlossaryHighlightedText text={message.content} />
                  </p>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))
        )}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <p className="text-sm text-muted-foreground">Mengetik...</p>
            </div>
          </div>
        )}

        {chatMutation.isError && (
          <div className="flex justify-center">
            <Card className="border-danger-500">
              <CardContent className="py-2">
                <p className="text-sm text-danger-500">
                  {chatMutation.error?.message || 'Terjadi kesalahan'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya tentang saham..."
          disabled={chatMutation.isPending}
          className="flex-1"
        />
        <Button type="submit" disabled={chatMutation.isPending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
