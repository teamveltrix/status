import { db, components, uptimeChecks, incidents } from "@/db";
import { NextResponse } from "next/server";
import { and, eq, isNotNull, ne } from "drizzle-orm";

const impactStatusMap = {
  critical: "down",
  major: "down",
  minor: "partial",
  none: "up",
} as const;

type Impact = keyof typeof impactStatusMap;

export async function GET() {
  try {
    const componentsToMonitor = await db.query.components.findMany({
      where: isNotNull(components.url),
    });

    const activeIncidents = await db.query.incidents.findMany({
      where: ne(incidents.status, "resolved"),
      with: {
        components: {
          with: {
            component: true,
          },
        },
      },
    });

    for (const component of componentsToMonitor) {
      if (!component.url) continue;

      let status: "up" | "down" | "partial" = "up";
      let responseTime = 0;

      const componentIncidents = activeIncidents.filter((incident) =>
        incident.components.some(
          (c) => c.componentId === component.id
        )
      );

      if (componentIncidents.length > 0) {
        // Find the most severe impact
        const mostSevereImpact = componentIncidents.reduce((maxImpact, inc) => {
          const impacts: Impact[] = ["critical", "major", "minor", "none"];
          return impacts.indexOf(inc.impact as Impact) < impacts.indexOf(maxImpact)
            ? (inc.impact as Impact)
            : maxImpact;
        }, "none" as Impact);
        
        status = impactStatusMap[mostSevereImpact] as "up" | "down" | "partial";

      } else {
        try {
          const startTime = Date.now();
          const res = await fetch(component.url);
          const endTime = Date.now();
          responseTime = endTime - startTime;
          status = res.ok ? "up" : "down";
        } catch (error) {
          status = "down";
        }
      }

      await db.insert(uptimeChecks).values({
        componentId: component.id,
        status,
        responseTime,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in uptime cron job:", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
