"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { trpc } from "@/lib/trpc/client"
import { AlertCircle, Plus, Edit, Trash2, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export default function IncidentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null)
  const [updateMessage, setUpdateMessage] = useState("")
  const [updateStatus, setUpdateStatus] = useState("")

  const { data: incidents, refetch } = trpc.incidents.list.useQuery()
  const { data: components } = trpc.components.list.useQuery()
  
  const createIncident = trpc.incidents.create.useMutation({
    onSuccess: () => {
      toast.success("Incident created successfully")
      setIsCreateOpen(false)
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to create incident: ${error.message}`)
    }
  })

  const updateIncident = trpc.incidents.update.useMutation({
    onSuccess: () => {
      toast.success("Incident updated successfully")
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to update incident: ${error.message}`)
    }
  })

  const deleteIncident = trpc.incidents.delete.useMutation({
    onSuccess: () => {
      toast.success("Incident deleted successfully")
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to delete incident: ${error.message}`)
    }
  })

  const addUpdate = trpc.incidents.addUpdate.useMutation({
    onSuccess: () => {
      toast.success("Update added successfully")
      setUpdateMessage("")
      setUpdateStatus("")
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to add update: ${error.message}`)
    }
  })

  const handleCreateIncident = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const componentIds = formData.getAll('components') as string[]
    
    createIncident.mutate({
      name: formData.get('name') as string,
      status: formData.get('status') as 'investigating' | 'identified' | 'monitoring' | 'resolved',
      impact: formData.get('impact') as 'none' | 'minor' | 'major' | 'critical',
      message: formData.get('message') as string,
      componentIds
    })
  }

  const handleAddUpdate = (incidentId: string) => {
    if (!updateMessage || !updateStatus) {
      toast.error("Please provide both status and message")
      return
    }

      addUpdate.mutate({
        incidentId,
        status: updateStatus as 'investigating' | 'identified' | 'monitoring' | 'resolved',
        message: updateMessage
      })  }

  const getStatusBadge = (status: string) => {
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

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'none':
        return <Badge variant="outline">None</Badge>
      case 'minor':
        return <Badge className="bg-yellow-500">Minor</Badge>
      case 'major':
        return <Badge className="bg-orange-500">Major</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge>{impact}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">Manage and track system incidents</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateIncident}>
              <DialogHeader>
                <DialogTitle>Create New Incident</DialogTitle>
                <DialogDescription>
                  Report a new incident affecting your services
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Incident Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Service degradation in API"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="investigating">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="identified">Identified</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="impact">Impact</Label>
                  <Select name="impact" defaultValue="minor">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="components">Affected Components</Label>
                  <Select name="components">
                    <SelectTrigger>
                      <SelectValue placeholder="Select components" />
                    </SelectTrigger>
                    <SelectContent>
                      {components?.map((component) => (
                        <SelectItem key={component.id} value={component.id}>
                          {component.displayName || component.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Initial Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="We are currently investigating reports of..."
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createIncident.isPending}>
                  Create Incident
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
          <CardDescription>Currently ongoing incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents?.filter(i => i.status !== 'resolved').map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{incident.name}</p>
                      {incident.components && incident.components.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Affects: {incident.components.map(c => c.component.displayName || c.component.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell>{getImpactBadge(incident.impact)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedIncident(incident.id)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Add Update</DialogTitle>
                            <DialogDescription>
                              Post an update for this incident
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label>Status</Label>
                              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="investigating">Investigating</SelectItem>
                                  <SelectItem value="identified">Identified</SelectItem>
                                  <SelectItem value="monitoring">Monitoring</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label>Message</Label>
                              <Textarea
                                value={updateMessage}
                                onChange={(e) => setUpdateMessage(e.target.value)}
                                placeholder="Update message..."
                                rows={4}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={() => handleAddUpdate(incident.id)}
                              disabled={addUpdate.isPending}
                            >
                              Add Update
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteIncident.mutate({ id: incident.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {incidents?.filter(i => i.status !== 'resolved').length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No active incidents</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resolved Incidents</CardTitle>
          <CardDescription>Previously resolved incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Resolved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents?.filter(i => i.status === 'resolved').map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <p className="font-medium">{incident.name}</p>
                  </TableCell>
                  <TableCell>{getImpactBadge(incident.impact)}</TableCell>
                  <TableCell className="text-sm">
                    {incident.resolvedAt && formatDistanceToNow(
                      new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {incident.resolvedAt && formatDistanceToNow(new Date(incident.resolvedAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}