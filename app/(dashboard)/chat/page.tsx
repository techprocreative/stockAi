import { ChatInterface } from '@/components/chat/chat-interface'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat AI</h1>
        <p className="text-muted-foreground">
          Tanya apa saja tentang saham Indonesia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IndoStock AI Assistant</CardTitle>
          <CardDescription>
            Asisten AI yang membantu Anda memahami saham Indonesia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  )
}
