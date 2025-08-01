"use client";

import { useMemo, useState } from "react";
import { IncidentItem } from "@/components/incident-item";
import { MaintenanceItem } from "@/components/maintenance-item";
import { UptimeGraph } from "@/components/uptime-graph";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Component, ComponentWithChildren } from "@/types/component";


const ComponentGroup = ({ component }: { component: ComponentWithChildren }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!component.isGroup) {
    return (
      <UptimeGraph
        key={component.id}
        componentName={component.displayName || component.name}
        data={component.uptime || []}
        status={component.status || 'operational'}
      />
    );
  }

  return (
    <section>
      <button
        className="flex items-center gap-2 mb-4 w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
        <h2 className="text-xl font-semibold">
          {component.displayName || component.name}
        </h2>
      </button>
      {isOpen && (
        <div className="space-y-6 pl-7">
          {component.children.map((child) => (
            <ComponentGroup key={child.id} component={child} />
          ))}
        </div>
      )}
    </section>
  );
};


export default function StatusPage() {
  const {
    data: incidents,
    isLoading: incidentsLoading,
    error: incidentsError,
  } = trpc.incidents.getAll.useQuery();
  const {
    data: components,
    isLoading: componentsLoading,
    error: componentsError,
  } = trpc.components.getAll.useQuery();
  const {
    data: maintenances,
    isLoading: maintenancesLoading,
    error: maintenancesError,
  } = trpc.maintenance.getAll.useQuery();

  const nestedComponents = useMemo(() => {
    if (!components) return [];

    const componentMap: Map<string, ComponentWithChildren> = new Map(
      components.map((c): [string, ComponentWithChildren] => [c.id, { ...c, children: [] }])
    );
    
    const roots: ComponentWithChildren[] = [];

    for (const component of componentMap.values()) {
      if (component.parentId && componentMap.has(component.parentId)) {
        const parent = componentMap.get(component.parentId)!
        parent.children.push(component);
      } else {
        roots.push(component);
      }
    }

    const sortItems = (items: ComponentWithChildren[]) => {
      items.sort((a, b) => {
        const nameA = (a.displayName || a.name || "").toLowerCase();
        const nameB = (b.displayName || b.name || "").toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      items.forEach(item => {
        if (item.children.length > 0) {
          sortItems(item.children);
        }
      });
    };

    sortItems(roots);
    
    return roots;
  }, [components]);


  if (incidentsLoading || componentsLoading || maintenancesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (incidentsError || componentsError || maintenancesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="mt-4 text-muted-foreground">
            Error loading status:{" "}
            {incidentsError?.message ||
              componentsError?.message ||
              maintenancesError?.message}
          </p>
        </div>
      </div>
    );
  }

  // Calculate overall status
  const hasIssues =
    components && components.some((c: any) => c.status !== "operational");
  const hasMajorIssues =
    components && components.some((c: any) => c.status === "major_outage");

  const overallStatus = hasMajorIssues
    ? {
        icon: XCircle,
        color: "text-red-100",
        bg: "bg-red-500/50",
        text: "Some systems are experiencing issues",
      }
    : hasIssues
    ? {
        icon: AlertCircle,
        color: "text-yellow-100",
        bg: "bg-yellow-500/50",
        text: "Some systems are experiencing degraded performance",
      }
    : {
        icon: CheckCircle,
        color: "text-green-100",
        bg: "bg-green-500/50",
        text: "All Systems Operational",
      };

  return (
    <div>
      {/* Header */}
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Veltrix Status</h1>
        <p className="mt-2 text-muted-foreground">
          Current status and incident history
        </p>
      </header>

      {/* Overall Status Banner */}
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className={`${overallStatus.bg} rounded-xl`}>
          <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <overallStatus.icon
                className={`h-6 w-6 ${overallStatus.color}`}
              />
              <span className={`text-lg font-medium ${overallStatus.color}`}>
                {overallStatus.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Active Incidents */}
        {incidents &&
          incidents.filter((i: any) => i.status !== "resolved").slice(0, 5)
            .length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Active Incidents</h2>
              <div className="space-y-4">
                {incidents
                  .filter((i: any) => i.status !== "resolved")
                  .slice(0, 5)
                  .map((incident: any) => (
                    <IncidentItem key={incident.id} incident={incident} />
                  ))}
              </div>
            </section>
          )}

        {/* Scheduled Maintenance */}
        {maintenances &&
          maintenances.filter((m: any) => m.status !== "completed").slice(0, 5)
            .length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Scheduled Maintenance
              </h2>
              <div className="space-y-4">
                {maintenances
                  .filter((m: any) => m.status !== "completed")
                  .slice(0, 5)
                  .map((maintenance: any) => (
                    <MaintenanceItem
                      key={maintenance.id}
                      maintenance={maintenance}
                    />
                  ))}
              </div>
            </section>
          )}

        {/* Uptime History */}
        <div className="space-y-8">
          {nestedComponents.map((component) => (
            <ComponentGroup key={component.id} component={component} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Veltrix. All rights reserved.</p>
            <p className="mt-2">
              Powered by Prodfind CMS •
              <a href="/admin" className="ml-2 text-primary hover:underline">
                Admin
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
