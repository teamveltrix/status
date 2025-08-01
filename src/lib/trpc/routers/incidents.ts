import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db, incidents, incidentComponents, incidentUpdates, components } from '@/db'
import { desc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { Incident } from "@/types/incident";

export const incidentRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.query.incidents.findMany({
      orderBy: [desc(incidents.createdAt)],
      with: {
        components: {
          with: {
            component: true
          }
        },
        updates: {
          orderBy: [desc(incidentUpdates.createdAt)]
        }
      }
    })
  }),

  list: publicProcedure
    .input(z.object({
      limit: z.number().optional()
    }).optional())
    .query(async ({ input }) => {
      return await db.query.incidents.findMany({
        orderBy: [desc(incidents.createdAt)],
        limit: input?.limit,
        with: {
          components: {
            with: {
              component: true
            }
          },
          updates: {
            orderBy: [desc(incidentUpdates.createdAt)]
          }
        }
      })
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
      impact: z.enum(['none', 'minor', 'major', 'critical']).optional(),
      message: z.string(),
      componentIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }:{ input: Incident }) => {
      const [incident] = await db.insert(incidents).values({
        name: input.name,
        status: input.status || 'investigating',
        impact: input.impact || 'none',
        message: input.message
      }).returning()

      if (input.componentIds && input.componentIds.length > 0) {
        await db.insert(incidentComponents).values(
          input.componentIds.map((componentId: string) => ({
            incidentId: incident.id,
            componentId
          }))
        )

        const statusMap = {
          none: 'operational',
          minor: 'degraded_performance',
          major: 'partial_outage',
          critical: 'major_outage'
        }

        await db.update(components)
          .set({
            status: statusMap[input.impact as keyof typeof statusMap] || 'operational',
            updatedAt: new Date()
          })
          .where(inArray(components.id, input.componentIds))
      }

      await db.insert(incidentUpdates).values({
        incidentId: incident.id,
        status: input.status || 'investigating',
        message: input.message || 'Initial incident report'
      })

      return await db.query.incidents.findFirst({
        where: eq(incidents.id, incident.id),
        with: {
          components: {
            with: {
              component: true
            }
          },
          updates: true
        }
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
      impact: z.enum(['none', 'minor', 'major', 'critical']).optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {
        updatedAt: new Date()
      }
      
      if (input.name) updateData.name = input.name
      if (input.status) updateData.status = input.status
      if (input.impact) updateData.impact = input.impact
      if (input.message) updateData.message = input.message
      
      if (input.status === 'resolved') {
        updateData.resolvedAt = new Date()
      }

      await db.update(incidents)
        .set(updateData)
        .where(eq(incidents.id, input.id))

      return await db.query.incidents.findFirst({
        where: eq(incidents.id, input.id),
        with: {
          components: {
            with: {
              component: true
            }
          },
          updates: true
        }
      })
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input }) => {
      await db.delete(incidentComponents).where(eq(incidentComponents.incidentId, input.id))
      await db.delete(incidentUpdates).where(eq(incidentUpdates.incidentId, input.id))
      await db.delete(incidents).where(eq(incidents.id, input.id))
      return { success: true }
    }),

  addUpdate: protectedProcedure
    .input(z.object({
      incidentId: z.string(),
      status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
      message: z.string()
    }))
    .mutation(async ({ input }) => {
      await db.insert(incidentUpdates).values({
        incidentId: input.incidentId,
        status: input.status,
        message: input.message
      })

      if (input.status === 'resolved') {
        await db.update(incidents)
          .set({
            status: 'resolved',
            resolvedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(incidents.id, input.incidentId))
      } else {
        await db.update(incidents)
          .set({
            status: input.status,
            updatedAt: new Date()
          })
          .where(eq(incidents.id, input.incidentId))
      }

      return await db.query.incidents.findFirst({
        where: eq(incidents.id, input.incidentId),
        with: {
          components: {
            with: {
              component: true
            }
          },
          updates: true
        }
      })
    })
});