"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabaseClient"
import { useAirData } from "@/components/data-content"

export function SyncIndicator() {
  const [isConnected, setIsConnected] = useState(false)
  const { latest } = useAirData()

  useEffect(() => {
    // Open a realtime channel to monitor connectivity and updates on the readings table
    const channel = supabaseClient
      .channel("realtime:sync-indicator")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "readings" },
        () => {
          // Any successful change means we are receiving live data
          setIsConnected(true)
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsConnected(false)
        }
      })

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [])

  return (
    <div className="text-right">
      <Badge
        variant="outline"
        className={`${
          isConnected
            ? "bg-accent text-accent-foreground border-accent"
            : "bg-danger text-danger-foreground border-danger"
        } mb-1`}
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 mr-1" />
            Connected
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </>
        )}
      </Badge>
      <p className="text-xs text-primary-foreground/70">
        Last sync:{" "}
        {latest ? new Date(latest.created_at).toLocaleTimeString() : "—"}
      </p>
    </div>
  )
}
