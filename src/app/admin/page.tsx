"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { trpc } from "@/lib/trpc/client"
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Activity, Users, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function AdminDashboard() {
  const { data: components } = trpc.components.list.useQuery()
  const { data: incidents } = trpc.incidents.list.useQuery({ limit: 5 })
  const { data: maintenances } = trpc.maintenance.list.useQuery({ limit: 5 })

  const operationalCount = components?.filter(c => c.status === 'operational').length || 0
  const degradedCount = components?.filter(c => c.status === 'degraded_performance').length || 0
  const partialOutageCount = components?.filter(c => c.status === 'partial_outage').length || 0
  const majorOutageCount = components?.filter(c => c.status === 'major_outage').length || 0

  const activeIncidents = incidents?.filter(i => i.status !== 'resolved').length || 0
  const scheduledMaintenances = maintenances?.filter(m => m.status === 'scheduled').length || 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded_performance':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'partial_outage':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'major_outage':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getIncidentBadge = (status: string) => {
    switch (status) {
      case 'investigating':
        return <Badge variant="destructive">Investigating</Badge>
      case 'identified':
        return <Badge variant="destructive">Identified</Badge>
      case 'monitoring':
        return <Badge className="bg-yellow-500">Monitoring</Badge>
      case 'resolved':
        return <Badge variant="secondary">Resolved</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your status page</p>
      </div>

      {(activeIncidents > 0 || scheduledMaintenances > 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {activeIncidents > 0 && (
              <span>{activeIncidents} active incident{activeIncidents > 1 ? 's' : ''}</span>
            )}
            {activeIncidents > 0 && scheduledMaintenances > 0 && <span> and </span>}
            {scheduledMaintenances > 0 && (
              <span>{scheduledMaintenances} scheduled maintenance{scheduledMaintenances > 1 ? 's' : ''}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationalCount}</div>
            <p className="text-xs text-muted-foreground">components working normally</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Degraded</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{degradedCount}</div>
            <p className="text-xs text-muted-foreground">performance issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial Outage</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partialOutageCount}</div>
            <p className="text-xs text-muted-foreground">components affected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Major Outage</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{majorOutageCount}</div>
            <p className="text-xs text-muted-foreground">critical issues</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Latest incidents and their status</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/incidents">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {incidents && incidents.length > 0 ? (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="flex items-start justify-between space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{incident.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {getIncidentBadge(incident.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent incidents</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Scheduled Maintenance</CardTitle>
              <CardDescription>Upcoming maintenance windows</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/maintenance">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {maintenances && maintenances.length > 0 ? (
              <div className="space-y-4">
                {maintenances.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-start justify-between space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{maintenance.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Scheduled for {new Date(maintenance.scheduledFor).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {maintenance.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No scheduled maintenance</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Component Status</CardTitle>
          <CardDescription>Current status of all system components</CardDescription>
        </CardHeader>
        <CardContent>
          {components && components.length > 0 ? (
            <div className="space-y-2">
              {components.map((component) => (
                <div key={component.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(component.status ?? 'operational')}
                    <div>
                      <p className="text-sm font-medium">{component.displayName || component.name}</p>
                      {component.description && (
                        <p className="text-xs text-muted-foreground">{component.description}</p>
                      )}
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/components/${component.id}`}>Manage</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">No components configured</p>
              <Button asChild>
                <Link href="/admin/components/new">Add Component</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
