import { z } from "zod";

export const ComponentSchema = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().optional(),
    description: z.string().optional(),
    displayName: z.string().optional(),
    status: z.enum(['operational', 'degraded_performance', 'partial_outage', 'major_outage']).optional(),
    position: z.number().optional(),
    isGroup: z.boolean().optional(),
    parentId: z.string().optional(),
    uptime: z.array(z.object({
      id: z.string(),
      timestamp: z.date(),
      status: z.enum(['up', 'down', 'partial']),
      responseTime: z.number(),
      componentId: z.string(),
    })).optional(),
})

export type Component = z.infer<typeof ComponentSchema>
export type ComponentWithChildren = Component & { children: ComponentWithChildren[] }