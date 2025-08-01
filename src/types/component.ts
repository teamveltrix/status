import { z } from "zod";

export const ComponentSchema = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    displayName: z.string().optional().nullable(),
    status: z.enum(['operational', 'degraded_performance', 'partial_outage', 'major_outage']).optional().nullable(),
    position: z.number().optional().nullable(),
    isGroup: z.boolean().optional().nullable(),
    parentId: z.string().optional().nullable(),
    uptime: z.array(z.object({
      id: z.string(),
      timestamp: z.date(),
      status: z.enum(['up', 'down', 'partial']),
      responseTime: z.number(),
      componentId: z.string(),
    })).optional().nullable(),
})

export type Component = z.infer<typeof ComponentSchema>
export type ComponentWithChildren = Component & { children: ComponentWithChildren[] }