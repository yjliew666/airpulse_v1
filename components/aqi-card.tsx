"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wind } from "lucide-react"
import { useEffect, useState } from "react"

interface AQIData {
  value: number
  status: string
  color: string
  location: string
}

export function AQICard() {
  const [aqiData, setAqiData] = useState<AQIData>({
    value: 42,
    status: "Good",
    color: "bg-accent",
    location: "Downtown Sensor #1",
  })

  useEffect(() => {
    // Simulate real-time AQI updates
    const interval = setInterval(() => {
      const value = Math.floor(Math.random() * 150) + 10
      let status = "Good"
      let color = "bg-accent"

      if (value > 100) {
        status = "Unhealthy"
        color = "bg-danger"
      } else if (value > 50) {
        status = "Moderate"
        color = "bg-warning"
      }

      setAqiData({
        value,
        status,
        color,
        location: "Downtown Sensor #1",
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wind className="h-5 w-5 text-primary" />
          Current Air Quality
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${aqiData.color} text-white`}>
            <span className="text-2xl font-bold">{aqiData.value}</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              AQI is {aqiData.value}, within the range of{" "}
              <Badge variant="outline" className={`${aqiData.color} text-white border-0`}>
                {aqiData.status}
              </Badge>
            </p>
            <p className="text-sm text-muted-foreground mt-1">based on WHO guideline</p>
            <p className="text-xs text-muted-foreground mt-2">📍 {aqiData.location}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
