import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db, scheduledMaintenances, maintenanceUpdates } from '@/db'
import { asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { Maintenance, MaintenanceSchema, CreateMaintenanceSchema, CreateMaintenance } from "@/types/maintenance";

export const maintenanceRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.query.scheduledMaintenances.findMany({
      orderBy: [asc(scheduledMaintenances.scheduledFor)],
      with: {
        updates: {
          orderBy: [desc(maintenanceUpdates.createdAt)]
        }
      }
    }) as Maintenance[]
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
      }) as Maintenance[]
    }),

  create: protectedProcedure
    .input(CreateMaintenanceSchema)
    .mutation(async ({ input }: { input: CreateMaintenance }) => {
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
