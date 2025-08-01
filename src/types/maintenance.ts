import { z } from "zod";

export const MaintenanceSchema = z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['scheduled', 'in_progress', 'completed']).optional(),
    message: z.string(),
    scheduledFor: z.date(),
    scheduledUntil: z.date(),
    autoTransition: z.boolean().optional(),
    componentIds: z.array(z.string()).optional(),
    completedAt: z.date().optional(),
})

export type Maintenance = z.infer<typeof MaintenanceSchema>

export const CreateMaintenanceSchema = MaintenanceSchema.omit({ id: true }).extend({
    scheduledFor: z.string(),
    scheduledUntil: z.string(),
    completedAt: z.string().optional(),
});
export type CreateMaintenance = z.infer<typeof CreateMaintenanceSchema>