import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { google } from '@ai-sdk/google'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { conversations, messages, promptTemplates } from '@/drizzle/schemas'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { id } from 'zod/v4/locales'

export const maxDuration = 30

const chatRequestSchema = z.object({
  persona: z.string(),
  conversationId: z.string().optional().or(z.null()),
  id: z.string(),
  messages: z.array(z.custom<UIMessage>()),
  trigger: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const json = await req.json()
    const validation = chatRequestSchema.safeParse(json)

    console.log('🔍 new request:', json)

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.flatten() }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    const {
      messages: chatMessages,
      persona,
      conversationId: convId,
    } = validation.data

    let conversationId = convId

    // Get the persona's system prompt
    const personaTemplate = await db.query.promptTemplates.findFirst({
      where: eq(promptTemplates.name, persona),
    })

    if (!personaTemplate) {
      return new Response(JSON.stringify({ error: 'Persona not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('🔍 Found persona template:', personaTemplate.id)

    // Create a new conversation if no ID is provided
    if (!conversationId) {
      const newConversation = await db
        .insert(conversations)
        .values({
          userId,
          title: `Chat with ${persona}`,
          model: 'gemini-2.5-flash-lite',
        })
        .returning()
      if (!newConversation[0]) {
        return new Response(
          JSON.stringify({ error: 'Could not create conversation' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      conversationId = newConversation[0].id
    }

    const lastUserMessage = chatMessages[chatMessages.length - 1]

    // Save user message to the database
    const userTextContent = lastUserMessage?.parts
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join('')

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID is missing' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    const userMessage: typeof messages.$inferInsert = {
      conversationId,
      role: 'user',
      content: userTextContent || '',
    }
    await db.insert(messages).values(userMessage)

    const startTime = Date.now()

    const result = await streamText({
      model: google('gemini-2.5-flash-lite'),
      system: personaTemplate.prompt,
      messages: convertToModelMessages(chatMessages),
      onFinish: async ({ text, usage }) => {
        const latency = Date.now() - startTime
        console.log('🔍 usage object:', usage)
        // Save assistant message to the database
        await db.insert(messages).values({
          conversationId,
          role: 'assistant',
          content: text,
          tokens: (usage as any).totalTokens,
          model: 'gemini-2.5-flash-lite',
          latency,
        })

        // Update conversation metadata
        await db
          .update(conversations)
          .set({
            lastMessageAt: new Date(),
            messageCount: sql`${conversations.messageCount} + 2`, // user + assistant
            totalTokens: sql`${conversations.totalTokens} + ${(usage as any).totalTokens}`,
          })
          .where(eq(conversations.id, conversationId))
      },
    })

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === 'start') {
          return {
            conversationId: conversationId,
            createdAt: Date.now(),
          }
        }
        return null
      },
    })
  } catch (error) {
    console.error('[CHAT_API_ERROR]', error)
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
