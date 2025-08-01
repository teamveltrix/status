import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db, components, uptimeChecks } from '@/db'
import { gte, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { Component, ComponentSchema } from "@/types/component";

export const componentRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.query.components.findMany({
      orderBy: [components.position],
      with: {
        children: true,
        uptime: {
          where: gte(uptimeChecks.timestamp, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
          orderBy: [desc(uptimeChecks.timestamp)]
        }
      }
    }) as Component[]
  }),

  list: publicProcedure.query(async () => {
    return await db.query.components.findMany({
      orderBy: [components.position],
      with: {
        children: true,
        uptime: {
          where: gte(uptimeChecks.timestamp, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
          orderBy: [desc(uptimeChecks.timestamp)]
        }
      }
    }) as Component[]
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      displayName: z.string().optional(),
      status: z.enum(['operational', 'degraded_performance', 'partial_outage', 'major_outage']).optional(),
      position: z.number().optional(),
      isGroup: z.boolean().optional(),
      parentId: z.string().optional(),
      url: z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.insert(components).values({
        name: input.name,
        description: input.description,
        displayName: input.displayName,
        status: input.status || 'operational',
        position: input.position || 0,
        isGroup: input.isGroup || false,
        parentId: input.parentId,
        url: input.url,
      }).returning()
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      displayName: z.string().optional(),
      status: z.enum(['operational', 'degraded_performance', 'partial_outage', 'major_outage']).optional(),
      position: z.number().optional(),
      isGroup: z.boolean().optional(),
      parentId: z.string().optional(),
      url: z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {
        updatedAt: new Date()
      }
      
      if (input.name !== undefined) updateData.name = input.name
      if (input.description !== undefined) updateData.description = input.description
      if (input.displayName !== undefined) updateData.displayName = input.displayName
      if (input.status !== undefined) updateData.status = input.status
      if (input.position !== undefined) updateData.position = input.position
      if (input.isGroup !== undefined) updateData.isGroup = input.isGroup
      if (input.parentId !== undefined) updateData.parentId = input.parentId
      if (input.url !== undefined) updateData.url = input.url

      await db.update(components)
        .set(updateData)
        .where(eq(components.id, input.id))

      return await db.query.components.findFirst({
        where: eq(components.id, input.id)
      })
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input }) => {
      await db.delete(uptimeChecks).where(eq(uptimeChecks.componentId, input.id))
      await db.delete(components).where(eq(components.id, input.id))
      return { success: true }
    })
});
