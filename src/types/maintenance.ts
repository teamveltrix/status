import { z } from "zod";

export const MaintenanceSchema = z.object({
    name: z.string(),
    status: z.enum(['scheduled', 'in_progress', 'completed']).optional(),
    message: z.string(),
    scheduledFor: z.string(),
    scheduledUntil: z.string(),
    autoTransition: z.boolean().optional(),
    componentIds: z.array(z.string()).optional(),
})

export type Maintenance = z.infer<typeof MaintenanceSchema>