import 'server-only' // <-- ensure this file cannot be imported from the client

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cache } from 'react'
import { createCallerFactory, createTRPCContext } from '@/lib/trpc/init'
import { makeQueryClient } from './query-client'
import { appRouter } from '@/lib/trpc/routers/_app'

export const getQueryClient = cache(makeQueryClient)
export const caller = createCallerFactory(appRouter)(createTRPCContext)

/**
 * Server-Side 向けの tRPC client.
 */
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
)
