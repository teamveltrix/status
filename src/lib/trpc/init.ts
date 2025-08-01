import superjson from "superjson";
import { initTRPC, TRPCError } from '@trpc/server'
import { cache } from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * tRPC context
 */
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return {
    session,
  }
})

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
})

// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure

export const protectedProcedure = publicProcedure.use(async (opts) => {
  const { session } = opts.ctx;
  if (!session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
      ctx: {
          ...opts.ctx,
          user: session.user,
      },
  });
});
