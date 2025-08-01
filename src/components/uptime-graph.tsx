"use client";

import { StatusIndicator } from "./status-indicator";
import { cn } from "@/lib/utils";
import {
  subDays,
  startOfDay,
  format,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import {
  Tooltip,  
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
} from "./ui/tooltip";

interface UptimeGraphProps {
  componentName: string;
  data: {
    id: string;
    timestamp: Date;
    status: "up" | "down" | "partial";
    responseTime: number;
    componentId: string;
  }[];
  status:
    | "operational"
    | "degraded_performance"
    | "partial_outage"
    | "major_outage";
}

export function UptimeGraph({ componentName, data, status }: UptimeGraphProps) {
  const days = 90;
  const today = startOfDay(new Date());
  const last90Days = subDays(today, days - 1);

  const dateRange = eachDayOfInterval({
    start: last90Days,
    end: today,
  });

  const dataByDate = dateRange.map((date) => {
    const dayChecks = data.filter((d) =>
      isSameDay(new Date(d.timestamp), date)
    );

    let dayStatus: "up" | "down" | "partial" | "none" = "none";
    if (dayChecks.length > 0) {
      if (dayChecks.some((c) => c.status === "down")) {
        dayStatus = "down";
      } else if (dayChecks.some((c) => c.status === "partial")) {
        dayStatus = "partial";
      } else {
        dayStatus = "up";
      }
    }

    const uptime =
      dayChecks.length > 0
        ? (dayChecks.filter((c) => c.status === "up").length /
            dayChecks.length) *
          100
        : 100;

    return {
      date: format(date, "yyyy-MM-dd"),
      status: dayStatus,
      uptime: uptime,
    };
  });

  const dataMap = new Map(dataByDate.map((d) => [d.date, d]));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{componentName}</h3>
        <StatusIndicator status={status} showLabel />
      </div>
      <div className="flex items-center gap-0.5">
        {dateRange.map((date) => {
          const formattedDate = format(date, "yyyy-MM-dd");
          const dayData = dataMap.get(formattedDate);
          const dayStatus = dayData?.status ?? "none";
          const uptime = dayData?.uptime ?? 0;

          return (
            <TooltipProvider key={formattedDate}>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <div
                    className={cn(
                      "h-10 w-full rounded-sm transition-colors",
                      dayStatus === "up" && "bg-green-500",
                      dayStatus === "partial" && "bg-yellow-500",
                      dayStatus === "down" && "bg-red-500",
                      dayStatus === "none" && "bg-muted"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formattedDate}</p>
                  <p>{uptime.toFixed(2)}% uptime</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>{days} days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
