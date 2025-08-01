"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc/client";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Component, ComponentWithChildren } from "@/types/component";

export default function ComponentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(
    null
  );
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: components, refetch } = trpc.components.list.useQuery();

  const nestedComponents = useMemo(() => {
    if (!components) return [];

    const componentMap: Map<string, ComponentWithChildren> = new Map(
      components.map((c: Component) => [c.id, { ...c, children: [] }])
    );

    const roots: ComponentWithChildren[] = [];

    for (const component of componentMap.values()) {
      if (component.parentId && componentMap.has(component.parentId)) {
        const parent = componentMap.get(component.parentId)!;
        parent.children.push(component);
      } else {
        roots.push(component);
      }
    }

    return roots;
  }, [components]);

  const createComponent = trpc.components.create.useMutation({
    onSuccess: () => {
      toast.success("Component created successfully");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create component: ${error.message}`);
    },
  });

  const updateComponent = trpc.components.update?.useMutation({
    onSuccess: () => {
      toast.success("Component updated successfully");
      setIsEditOpen(false);
      setEditingComponent(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update component: ${error.message}`);
    },
  });

  const deleteComponent = trpc.components.delete?.useMutation({
    onSuccess: () => {
      toast.success("Component deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete component: ${error.message}`);
    },
  });

  const handleCreateComponent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createComponent.mutate({
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as
        | "operational"
        | "degraded_performance"
        | "partial_outage"
        | "major_outage",
      isGroup: formData.get("isGroup") === "on",
      parentId:
        formData.get("parentId") === "none"
          ? undefined
          : (formData.get("parentId") as string) || undefined,
      url: formData.get("url") as string,
    });
  };

  const handleUpdateComponent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingComponent || !updateComponent) return;

    const formData = new FormData(e.currentTarget);

    updateComponent.mutate({
      id: editingComponent.id,
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as
        | "operational"
        | "degraded_performance"
        | "partial_outage"
        | "major_outage",
      isGroup: formData.get("isGroup") === "on",
      parentId:
        formData.get("parentId") === "none"
          ? undefined
          : (formData.get("parentId") as string) || undefined,
      url: formData.get("url") as string,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded_performance":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "partial_outage":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "major_outage":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500">Operational</Badge>;
      case "degraded_performance":
        return <Badge className="bg-yellow-500">Degraded</Badge>;
      case "partial_outage":
        return <Badge className="bg-orange-500">Partial Outage</Badge>;
      case "major_outage":
        return <Badge variant="destructive">Major Outage</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const openEditDialog = (component: Component) => {
    setEditingComponent(component);
    setIsEditOpen(true);
  };

  const ComponentRow = ({
    component,
    level,
  }: {
    component: ComponentWithChildren;
    level: number;
  }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isGroup = component.isGroup;

    return (
      <>
        <TableRow>
          <TableCell style={{ paddingLeft: `${1 + level * 1.5}rem` }}>
            <div className="flex items-center gap-2">
              {isGroup ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-8 shrink-0" />
              )}
              <div className="flex items-center space-x-3">
                {getStatusIcon(component.status || "operational")}
                <div>
                  <p className="font-medium">
                    {component.displayName || component.name}
                  </p>
                  {component.description && (
                    <p className="text-sm text-muted-foreground">
                      {component.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            {getStatusBadge(component.status || "operational")}
          </TableCell>
          <TableCell>
            <Badge variant="outline">{isGroup ? "Group" : "Component"}</Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <span className="text-sm">{component.position}</span>
              <Button variant="ghost" size="sm">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(component)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteComponent?.mutate({ id: component.id })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {isGroup &&
          isOpen &&
          component.children.map((child) => (
            <ComponentRow key={child.id} component={child} level={level + 1} />
          ))}
      </>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Components</h1>
            <p className="text-muted-foreground">
              Manage your system components and their status
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleCreateComponent}>
                <DialogHeader>
                  <DialogTitle>Add New Component</DialogTitle>
                  <DialogDescription>
                    Create a new component to monitor
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Component Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="api-server"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      placeholder="API Server"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Main API server handling all requests"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      name="url"
                      placeholder="https://api.example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Initial Status</Label>
                    <Select name="status" defaultValue="operational">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="degraded_performance">
                          Degraded Performance
                        </SelectItem>
                        <SelectItem value="partial_outage">
                          Partial Outage
                        </SelectItem>
                        <SelectItem value="major_outage">
                          Major Outage
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isGroup" name="isGroup" />
                    <Label htmlFor="isGroup" className="text-sm font-normal">
                      This is a component group
                    </Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="parentId">
                      Parent Component (Optional)
                    </Label>
                    <Select name="parentId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent component" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {components
                          ?.filter((c: Component) => c.isGroup)
                          .map((component: Component) => (
                            <SelectItem key={component.id} value={component.id}>
                              {component.displayName || component.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createComponent.isPending}>
                    Create Component
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Components</CardTitle>
            <CardDescription>
              All monitored components and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nestedComponents.map((component) => (
                  <ComponentRow
                    key={component.id}
                    component={component}
                    level={0}
                  />
                ))}
              </TableBody>
            </Table>
            {components?.length === 0 && (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No components configured
                </p>
                <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                  Add Your First Component
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleUpdateComponent}>
            <DialogHeader>
              <DialogTitle>Edit Component</DialogTitle>
              <DialogDescription>Update component details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Component Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingComponent?.name}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-displayName">Display Name</Label>
                <Input
                  id="edit-displayName"
                  name="displayName"
                  defaultValue={editingComponent?.displayName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingComponent?.description}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-url">URL</Label>
                <Input
                  id="edit-url"
                  name="url"
                  defaultValue={editingComponent?.url}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="status" defaultValue={editingComponent?.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="degraded_performance">
                      Degraded Performance
                    </SelectItem>
                    <SelectItem value="partial_outage">
                      Partial Outage
                    </SelectItem>
                    <SelectItem value="major_outage">Major Outage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isGroup"
                  name="isGroup"
                  defaultChecked={editingComponent?.isGroup}
                />
                <Label htmlFor="edit-isGroup" className="text-sm font-normal">
                  This is a component group
                </Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-parentId">Parent Component</Label>
                <Select
                  name="parentId"
                  defaultValue={editingComponent?.parentId || "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent component" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {components
                      ?.filter(
                        (c: Component) =>
                          c.isGroup && c.id !== editingComponent?.id
                      )
                      .map((component: Component) => (
                        <SelectItem key={component.id} value={component.id}>
                          {component.displayName || component.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateComponent?.isPending}>
                Update Component
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
