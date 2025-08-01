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
import { Checkbox } from "@/components/ui/checkbox"
import { trpc } from "@/lib/trpc/client"
import { Calendar, Clock, Plus, Edit, Trash2, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function MaintenancePage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [updateMessage, setUpdateMessage] = useState("")
  const [updateStatus, setUpdateStatus] = useState("")

  const { data: maintenances, refetch } = trpc.maintenance.getAll.useQuery()
  const { data: components } = trpc.components.list.useQuery()
  
  const createMaintenance = trpc.maintenance.create.useMutation({
    onSuccess: () => {
      toast.success("Maintenance scheduled successfully")
      setIsCreateOpen(false)
      setSelectedComponents([])
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to schedule maintenance: ${error.message}`)
    }
  })

  const handleCreateMaintenance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    createMaintenance.mutate({
      name: formData.get('name') as string,
      status: formData.get('status') as 'scheduled' | 'in_progress' | 'completed',
      message: formData.get('message') as string,
      scheduledFor: formData.get('scheduledFor') as string,
      scheduledUntil: formData.get('scheduledUntil') as string,
      autoTransition: formData.get('autoTransition') === 'on',
      componentIds: selectedComponents
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />Scheduled</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const toggleComponent = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId) 
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Maintenance</h1>
          <p className="text-muted-foreground">Plan and manage maintenance windows</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateMaintenance}>
              <DialogHeader>
                <DialogTitle>Schedule New Maintenance</DialogTitle>
                <DialogDescription>
                  Plan a maintenance window for your services
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Maintenance Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Database upgrade"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select name="status" defaultValue="scheduled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="scheduledFor">Start Time</Label>
                    <Input
                      id="scheduledFor"
                      name="scheduledFor"
                      type="datetime-local"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="scheduledUntil">End Time</Label>
                    <Input
                      id="scheduledUntil"
                      name="scheduledUntil"
                      type="datetime-local"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Affected Components</Label>
                  <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                    {components?.map((component) => (
                      <div key={component.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={component.id}
                          checked={selectedComponents.includes(component.id)}
                          onCheckedChange={() => toggleComponent(component.id)}
                        />
                        <Label
                          htmlFor={component.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {component.displayName || component.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoTransition" name="autoTransition" defaultChecked />
                  <Label htmlFor="autoTransition" className="text-sm font-normal">
                    Automatically transition to "In Progress" at start time
                  </Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Initial Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="We will be performing scheduled maintenance..."
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMaintenance.isPending}>
                  Schedule Maintenance
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance</CardTitle>
          <CardDescription>Scheduled maintenance windows</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Maintenance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenances?.filter(m => m.status !== 'completed').map((maintenance) => (
                <TableRow key={maintenance.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{maintenance.name}</p>
                      {maintenance.componentIds && Array.isArray(maintenance.componentIds) && maintenance.componentIds.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {maintenance.componentIds.length} component{maintenance.componentIds.length > 1 ? 's' : ''} affected
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(maintenance.status ?? 'scheduled')}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(maintenance.scheduledFor), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(maintenance.scheduledFor), 'h:mm a')}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {Math.round((new Date(maintenance.scheduledUntil).getTime() - new Date(maintenance.scheduledFor).getTime()) / (1000 * 60))} min
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {maintenances?.filter(m => m.status !== 'completed').length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No scheduled maintenance</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Maintenance</CardTitle>
          <CardDescription>Completed maintenance windows</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Maintenance</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenances?.filter(m => m.status === 'completed').map((maintenance) => (
                <TableRow key={maintenance.id}>
                  <TableCell>
                    <p className="font-medium">{maintenance.name}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {maintenance.completedAt && format(new Date(maintenance.completedAt), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {Math.round((new Date(maintenance.scheduledUntil).getTime() - new Date(maintenance.scheduledFor).getTime()) / (1000 * 60))} min
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