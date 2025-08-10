import { authRouter } from './routers/auth'
import { chatRouter } from './routers/chat'
import { paymentsRouter } from './routers/payments'
import { systemRouter } from './routers/system'
import { usersRouter } from './routers/users'
import { createTRPCRouter } from './server'

/**
 * Main tRPC router
 * Groups all sub-routers
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  payments: paymentsRouter,
  system: systemRouter,
  chat: chatRouter,
})

// Export type definitions for client-side type inference
export type AppRouter = typeof appRouter
