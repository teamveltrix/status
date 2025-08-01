"use client"

import { cn } from "@/lib/utils"

export const STATUS_STYLES = {
  operational: {
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Operational",
  },
  degraded_performance: {
    color: "text-yellow-600",
    bg: "bg-yellow-100", 
    label: "Degraded Performance",
    shadow: "shadow-yellow-200"
  },
  partial_outage: {
    color: "text-orange-600",
    bg: "bg-orange-100",
    label: "Partial Outage",
  },
  major_outage: {
    color: "text-red-600",
    bg: "bg-red-100",
    label: "Major Outage",
  }
} as const

interface StatusIndicatorProps {
  status: keyof typeof STATUS_STYLES
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function StatusIndicator({ 
  status, 
  size = "md", 
  showLabel = false,
  className 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  }
  
  const style = STATUS_STYLES[status]
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className={cn("text-sm font-medium", style.color)}>
          {style.label}
        </span>
      )}
    </div>
  )
}