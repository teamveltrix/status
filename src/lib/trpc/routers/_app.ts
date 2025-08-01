import { createTRPCRouter } from '@/lib/trpc/init'
import { componentRouter } from '@/lib/trpc/routers/components'
import { incidentRouter } from '@/lib/trpc/routers/incidents'
import { maintenanceRouter } from '@/lib/trpc/routers/maintenance'

/**
 * Api Router definition
 */
export const appRouter = createTRPCRouter({
  components: componentRouter,
  incidents: incidentRouter,
  maintenance: maintenanceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
