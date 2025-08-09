import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server'
import { db } from '@/lib/db'
import { conversations, messages } from '@/drizzle/schemas'
import { and, eq, asc, desc } from 'drizzle-orm'
import { z } from 'zod'

export const chatRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx
    return await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: [desc(conversations.createdAt)],
    })
  }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx
      const { conversationId } = input

      // Verify the user owns the conversation
      const conversation = await db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId)
        ),
      })

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      return await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [asc(messages.createdAt)],
      })
    }),
})
