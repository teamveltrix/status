"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export const INCIDENT_STATUS = {
  investigating: {
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    label: "Investigating"
  },
  identified: {
    color: "text-orange-600", 
    bg: "bg-orange-100",
    label: "Identified"
  },
  monitoring: {
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "Monitoring"
  },
  resolved: {
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Resolved"
  }
} as const

export const IMPACT_STYLES = {
  none: {
    color: "text-green-600",
    bg: "bg-green-100",
    label: "None"
  },
  minor: {
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    label: "Minor"
  },
  major: {
    color: "text-orange-600",
    bg: "bg-orange-100", 
    label: "Major"
  },
  critical: {
    color: "text-red-600",
    bg: "bg-red-100",
    label: "Critical"
  }
} as const

interface IncidentUpdate {
  id: string
  status: string
  message: string
  createdAt: Date
}

interface Incident {
  id: string
  name: string
  status: keyof typeof INCIDENT_STATUS
  impact: keyof typeof IMPACT_STYLES
  message?: string | null
  createdAt: Date
  resolvedAt?: Date | null
  updates: IncidentUpdate[]
  components: Array<{
    component: {
      name: string
      displayName?: string | null
    }
  }>
}

interface IncidentItemProps {
  incident: Incident
  showUpdates?: boolean
}

export function IncidentItem({ incident, showUpdates = true }: IncidentItemProps) {
  const statusStyle = INCIDENT_STATUS[incident.status]
  const impactStyle = IMPACT_STYLES[incident.impact]
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{incident.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{format(incident.createdAt, "MMM d, yyyy HH:mm")}</span>
              {incident.resolvedAt && (
                <>
                  <span>-</span>
                  <span>{format(incident.resolvedAt, "MMM d, yyyy HH:mm")}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={cn(statusStyle.bg, statusStyle.color, "border-0")}>
              {statusStyle.label}
            </Badge>
            <Badge className={cn(impactStyle.bg, impactStyle.color, "border-0")}>
              {impactStyle.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {incident.components.length > 0 && (
          <div className="mb-3">
            <span className="text-sm font-medium text-muted-foreground">Affected components: </span>
            <span className="text-sm text-muted-foreground">
              {incident.components.map(c => c.component.displayName || c.component.name).join(", ")}
            </span>
          </div>
        )}
        
        {incident.message && (
          <p className="text-sm text-muted-foreground mb-4">{incident.message}</p>
        )}
        
        {showUpdates && incident.updates.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Updates</h4>
            <div className="space-y-3">
              {incident.updates.map((update) => (
                <div key={update.id} className="border-l-2 border-border pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        INCIDENT_STATUS[update.status as keyof typeof INCIDENT_STATUS]?.color
                      )}
                    >
                      {INCIDENT_STATUS[update.status as keyof typeof INCIDENT_STATUS]?.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(update.createdAt, "MMM d, HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{update.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}