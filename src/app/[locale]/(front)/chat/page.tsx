'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { trpc } from '@/lib/trpc/client'
import { Conversation, Message } from '@/drizzle/schemas'
import { AuthGuardClient } from '@/components/auth'

const personas = [
  'Marketing Specialist',
  'Strategy Specialist',
  'AI Engineer Specialist',
]

export default function ChatPage() {
  const [persona, setPersona] = useState(personas[0])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { data: conversations, refetch: refetchConversations } =
    trpc.chat.getConversations.useQuery()
  const { data: dbMessages, refetch: refetchMessages } =
    trpc.chat.getMessages.useQuery(
      { conversationId: conversationId as string },
      { enabled: !!conversationId }
    )

  const [input, setInput] = useState('')
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onFinish: data => {
      // Get conversation ID from message metadata
      console.log('Message finished:', data)
      const metadata = data.message.metadata as { conversationId?: string }
      console.log('Message conv id:', metadata?.conversationId)
      if (metadata?.conversationId && !conversationId) {
        setConversationId(metadata.conversationId)
        refetchConversations()
        if (conversationId) {
          refetchMessages()
        }
      }
    },
  })

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    if (dbMessages) {
      setMessages(
        dbMessages.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          parts: [{ type: 'text', text: m.content }],
        }))
      )
    } else {
      setMessages([])
    }
  }, [dbMessages, setMessages])

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleConversationSelect = (id: string) => {
    setConversationId(id)
  }

  const handleNewChat = () => {
    setConversationId(null)
    setMessages([])
  }

  return (
    <AuthGuardClient requireAuth>
      <div className="grid h-[calc(100vh-264px)] w-full grid-cols-[300px_1fr]">
        <div className="flex h-[calc(100vh-264px)] flex-col border-r bg-gray-100/40 dark:bg-gray-800/40">
          <div className="flex h-[60px] items-center border-b px-6">
            <h2 className="text-lg font-semibold">Conversations</h2>
          </div>
          <div className="p-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleNewChat}
            >
              New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <nav className="grid gap-1 p-2">
              {conversations?.map((conv: Conversation) => (
                <Button
                  key={conv.id}
                  variant={conversationId === conv.id ? 'secondary' : 'ghost'}
                  className="justify-start"
                  onClick={() => handleConversationSelect(conv.id)}
                >
                  {conv.title}
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </div>
        <div className="flex h-[calc(100vh-264px)] flex-col">
          <header className="flex h-[60px] items-center justify-between border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
            <h2 className="text-lg font-semibold">
              {conversations?.find((c: Conversation) => c.id === conversationId)
                ?.title || 'New Chat'}
            </h2>
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a persona" />
              </SelectTrigger>
              <SelectContent>
                {personas.map(p => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </header>
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex items-start gap-4 ${
                    m.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {m.role !== 'user' && (
                    <Avatar>
                      <AvatarFallback>{persona?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <Card
                    className={
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }
                  >
                    <CardContent className="p-3">
                      {m.parts.map((part, i) => (
                        <span key={i}>
                          {part.type === 'text' ? part.text : ''}
                        </span>
                      ))}
                    </CardContent>
                  </Card>
                  {m.role === 'user' && (
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form
              onSubmit={e => {
                e.preventDefault()
                if (input.trim()) {
                  console.log('Sending message:', input, conversationId)
                  sendMessage(
                    { text: input },
                    {
                      body: {
                        persona,
                        conversationId,
                      },
                    }
                  )
                  setInput('')
                }
              }}
              className="flex items-center gap-4"
            >
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={status !== 'ready'}
              />
              <Button type="submit" disabled={status !== 'ready'}>
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuardClient>
  )
}
