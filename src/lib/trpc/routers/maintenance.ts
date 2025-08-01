import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db, scheduledMaintenances, maintenanceUpdates } from '@/db'
import { asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { Maintenance } from "@/types/maintenance";

export const maintenanceRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.query.scheduledMaintenances.findMany({
      orderBy: [asc(scheduledMaintenances.scheduledFor)],
      with: {
        updates: {
          orderBy: [desc(maintenanceUpdates.createdAt)]
        }
      }
    })
  }),

  list: publicProcedure
    .input(z.object({
      limit: z.number().optional()
    }).optional())
    .query(async ({ input }) => {
      return await db.query.scheduledMaintenances.findMany({
        orderBy: [asc(scheduledMaintenances.scheduledFor)],
        limit: input?.limit,
        with: {
          updates: {
            orderBy: [desc(maintenanceUpdates.createdAt)]
          }
        }
      })
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      status: z.enum(['scheduled', 'in_progress', 'completed']).optional(),
      message: z.string(),
      scheduledFor: z.string(),
      scheduledUntil: z.string(),
      autoTransition: z.boolean().optional(),
      componentIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }: { input: Maintenance }) => {
      const [maintenance] = await db.insert(scheduledMaintenances).values({
        name: input.name,
        status: input.status || 'scheduled',
        message: input.message,
        scheduledFor: new Date(input.scheduledFor),
        scheduledUntil: new Date(input.scheduledUntil),
        autoTransition: input.autoTransition ?? true,
        components: input.componentIds || []
      }).returning()

      await db.insert(maintenanceUpdates).values({
        maintenanceId: maintenance.id,
        status: 'scheduled',
        message: input.message || 'Maintenance scheduled'
      })

      return await db.query.scheduledMaintenances.findFirst({
        where: eq(scheduledMaintenances.id, maintenance.id),
        with: {
          updates: true
        }
      })
    }),
});
