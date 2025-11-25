"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { useEffect, useState } from "react"

export function SyncIndicator() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastSync, setLastSync] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional connection issues
      const connected = Math.random() > 0.1
      setIsConnected(connected)
      if (connected) {
        setLastSync(new Date())
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-right">
      <Badge
        variant="outline"
        className={`${isConnected ? "bg-accent text-accent-foreground border-accent" : "bg-danger text-danger-foreground border-danger"} mb-1`}
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
      <p className="text-xs text-primary-foreground/70">Last sync: {lastSync.toLocaleTimeString()}</p>
    </div>
  )
}
