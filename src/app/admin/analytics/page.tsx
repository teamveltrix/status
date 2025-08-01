"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { trpc } from "@/lib/trpc/client"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Activity, AlertCircle, Clock, TrendingUp, Users, Calendar } from "lucide-react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { useState } from "react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  
  const { data: components } = trpc.components.list.useQuery()
  const { data: incidents } = trpc.incidents.getAll.useQuery()
  const { data: maintenances } = trpc.maintenance.getAll.useQuery()

  const getDateRange = () => {
    const end = new Date()
    let start = new Date()
    
    switch (timeRange) {
      case "24h":
        start = subDays(end, 1)
        break
      case "7d":
        start = subDays(end, 7)
        break
      case "30d":
        start = subDays(end, 30)
        break
      case "90d":
        start = subDays(end, 90)
        break
    }
    
    return { start, end }
  }

  const { start, end } = getDateRange()

  const incidentsInRange = incidents?.filter(i => 
    new Date(i.createdAt) >= start && new Date(i.createdAt) <= end
  ) || []

  const maintenancesInRange = maintenances?.filter(m => 
    new Date(m.scheduledFor) >= start && new Date(m.scheduledFor) <= end
  ) || []

  const statusDistribution = components?.reduce((acc, component) => {
    const status = component.status
    if (status) {
      acc[status] = (acc[status] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

  const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: getStatusColor(status)
  }))

  const incidentsByDay = Array.from({ length: timeRange === "24h" ? 24 : parseInt(timeRange) }, (_, i) => {
    const date = timeRange === "24h" 
      ? new Date(end.getTime() - (23 - i) * 60 * 60 * 1000)
      : subDays(end, parseInt(timeRange) - i - 1)
    
    const dayIncidents = incidentsInRange.filter(incident => {
      const incidentDate = new Date(incident.createdAt)
      if (timeRange === "24h") {
        return incidentDate.getHours() === date.getHours() && 
               incidentDate.toDateString() === date.toDateString()
      }
      return incidentDate.toDateString() === date.toDateString()
    })

    return {
      date: timeRange === "24h" ? format(date, 'HH:mm') : format(date, 'MMM dd'),
      incidents: dayIncidents.length,
      resolved: dayIncidents.filter(i => i.status === 'resolved').length
    }
  })

  const avgResolutionTime = incidentsInRange
    .filter(i => i.status === 'resolved' && i.resolvedAt)
    .reduce((acc, incident) => {
      const duration = new Date(incident.resolvedAt!).getTime() - new Date(incident.createdAt).getTime()
      return acc + duration
    }, 0) / (incidentsInRange.filter(i => i.status === 'resolved').length || 1)

  const impactDistribution = incidentsInRange.reduce((acc, incident) => {
    acc[incident.impact] = (acc[incident.impact] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const impactData = Object.entries(impactDistribution).map(([impact, count]) => ({
    name: impact.charAt(0).toUpperCase() + impact.slice(1),
    value: count,
    color: getImpactColor(impact)
  }))

  function getStatusColor(status: string) {
    switch (status) {
      case 'operational': return '#10b981'
      case 'degraded_performance': return '#f59e0b'
      case 'partial_outage': return '#f97316'
      case 'major_outage': return '#ef4444'
      default: return '#6b7280'
    }
  }

  function getImpactColor(impact: string) {
    switch (impact) {
      case 'none': return '#10b981'
      case 'minor': return '#f59e0b'
      case 'major': return '#f97316'
      case 'critical': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Monitor your system performance and incidents</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentsInRange.length}</div>
            <p className="text-xs text-muted-foreground">
              {incidentsInRange.filter(i => i.status !== 'resolved').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgResolutionTime ? `${Math.round(avgResolutionTime / (1000 * 60 * 60))}h` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on resolved incidents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {components ? `${Math.round((statusDistribution.operational || 0) / components.length * 100)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Components operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Maintenance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenancesInRange.length}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="status">Component Status</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Trends</CardTitle>
              <CardDescription>Number of incidents over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={incidentsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="incidents" 
                    stroke="#ef4444" 
                    name="Total Incidents"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10b981" 
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Status Distribution</CardTitle>
              <CardDescription>Current status of all components</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Impact Distribution</CardTitle>
              <CardDescription>Breakdown of incidents by impact level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={impactData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {impactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}