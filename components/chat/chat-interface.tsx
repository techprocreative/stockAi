'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlossaryHighlightedText } from '@/components/glossary/glossary-highlighted-text'
import { Send, Sparkles, TrendingUp, Brain } from 'lucide-react'

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

const exampleQuestions = [
  { icon: TrendingUp, text: 'Analisa saham BBRI dong', color: 'primary' },
  { icon: Brain, text: 'Apa itu PER dan PBV?', color: 'accent' },
  { icon: Sparkles, text: 'Saham banking mana yang bagus?', color: 'secondary' },
  { icon: TrendingUp, text: 'Gimana cara baca laporan keuangan?', color: 'primary' },
]

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

  const handleExampleClick = (text: string) => {
    setInput(text)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2">
        {messages.length === 0 ? (
          <div className="space-y-8 animate-slide-up">
            {/* Welcome Header */}
            <div className="border-brutal bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8 shadow-brutal">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 border-brutal bg-accent flex items-center justify-center shadow-brutal-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold">Selamat datang di Chat AI!</h2>
              </div>
              <p className="text-lg text-muted-foreground font-medium">
                Tanya apa saja tentang saham Indonesia. AI kami siap membantu analisa Anda.
              </p>
            </div>

            {/* Example Questions Grid */}
            <div>
              <h3 className="text-xl font-bold mb-4">Contoh Pertanyaan:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exampleQuestions.map((example, index) => {
                  const Icon = example.icon
                  return (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example.text)}
                      className={`
                        text-left p-6 border-brutal shadow-brutal-sm hover-lift
                        ${example.color === 'primary' ? 'bg-primary/5 hover:bg-primary/10' : ''}
                        ${example.color === 'accent' ? 'bg-accent/5 hover:bg-accent/10' : ''}
                        ${example.color === 'secondary' ? 'bg-secondary/5 hover:bg-secondary/10' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          w-10 h-10 flex items-center justify-center border-brutal shadow-brutal-sm
                          ${example.color === 'primary' ? 'bg-primary' : ''}
                          ${example.color === 'accent' ? 'bg-accent' : ''}
                          ${example.color === 'secondary' ? 'bg-secondary' : ''}
                        `}>
                          <Icon className={`h-5 w-5 ${example.color === 'primary' ? 'text-primary-foreground' : 'text-foreground'}`} />
                        </div>
                        <p className="font-bold flex-1">{example.text}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`
                  max-w-[80%] p-6 border-brutal shadow-brutal-sm
                  ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                  }
                `}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-border">
                    <div className="w-6 h-6 border-2 border-border bg-accent flex items-center justify-center">
                      <Brain className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wider">AI Assistant</span>
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  {message.role === 'assistant' ? (
                    <div className="whitespace-pre-wrap font-medium">
                      <GlossaryHighlightedText text={message.content} />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap font-bold">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {chatMutation.isPending && (
          <div className="flex justify-start animate-bounce-in">
            <div className="bg-card border-brutal p-6 shadow-brutal-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-border bg-accent flex items-center justify-center animate-pulse">
                  <Brain className="h-4 w-4" />
                </div>
                <p className="font-bold text-muted-foreground">AI sedang berpikir...</p>
              </div>
            </div>
          </div>
        )}

        {chatMutation.isError && (
          <div className="flex justify-center animate-bounce-in">
            <div className="border-brutal border-destructive bg-destructive/10 p-6 shadow-brutal-sm max-w-md">
              <p className="font-bold text-destructive">
                ❌ {chatMutation.error?.message || 'Terjadi kesalahan'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Brutalist design */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya tentang saham..."
            disabled={chatMutation.isPending}
            className="border-brutal shadow-brutal-sm h-14 text-lg font-medium pr-12 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </div>
        <Button
          type="submit"
          disabled={chatMutation.isPending || !input.trim()}
          className="border-brutal shadow-brutal hover-lift h-14 px-8 bg-primary hover:bg-primary/90 text-lg font-bold"
        >
          <Send className="h-5 w-5 mr-2" />
          Kirim
        </Button>
      </form>
    </div>
  )
}
