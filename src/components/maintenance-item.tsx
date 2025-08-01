"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"

interface MaintenanceUpdate {
  id: string
  status: string
  message: string
  createdAt: Date
}

interface ScheduledMaintenance {
  id: string
  name: string
  status: "scheduled" | "in_progress" | "completed"
  message?: string | null
  scheduledFor: Date
  scheduledUntil: Date
  updates: MaintenanceUpdate[]
}

interface MaintenanceItemProps {
  maintenance: ScheduledMaintenance
}

const MAINTENANCE_STATUS = {
  scheduled: {
    label: "Scheduled",
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  in_progress: {
    label: "In Progress",
    color: "text-yellow-600", 
    bg: "bg-yellow-100"
  },
  completed: {
    label: "Completed",
    color: "text-green-600",
    bg: "bg-green-100"
  }
}

export function MaintenanceItem({ maintenance }: MaintenanceItemProps) {
  const status = MAINTENANCE_STATUS[maintenance.status]
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{maintenance.name}</CardTitle>
          <Badge className={`${status.bg} ${status.color} border-0`}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(maintenance.scheduledFor, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {format(maintenance.scheduledFor, "HH:mm")} - 
              {format(maintenance.scheduledUntil, "HH:mm")}
            </span>
          </div>
        </div>
        
        {maintenance.message && (
          <p className="text-sm text-muted-foreground">{maintenance.message}</p>
        )}
        
        {maintenance.updates.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Updates</h4>
            <div className="space-y-2">
              {maintenance.updates.map((update) => (
                <div key={update.id} className="text-sm">
                  <span className="text-muted-foreground">
                    {format(update.createdAt, "MMM d, HH:mm")}
                  </span>
                  <p className="text-muted-foreground">{update.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}