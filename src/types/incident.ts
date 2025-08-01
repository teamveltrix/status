import { z } from "zod";

export const IncidentSchema = z.object({
    name: z.string(),
    status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
    impact: z.enum(['none', 'minor', 'major', 'critical']).optional(),
    message: z.string(),
    componentIds: z.array(z.string()).optional(),
})

export type Incident = z.infer<typeof IncidentSchema>