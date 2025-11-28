"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wind } from "lucide-react"
import { useEffect, useState } from "react"
import { useAirData } from "@/components/data-content"

interface AQIData {
  value: number
  status: string
  color: string
  location: string
}

export function AQICard() {
  const { latest } = useAirData()

  const [aqiData, setAqiData] = useState<AQIData>({
    value: 0,
    status: "No data",
    color: "bg-muted",
    location: "Unknown location",
  })

  // Use AQI fields returned from the API when available
  useEffect(() => {
    if (!latest) return

    const value = latest.aqi ?? 0
    const status = latest.aqi_category ?? (value > 0 ? "Unknown" : "No data")

    // Map category -> color
    let color = "bg-muted"
    if (status === "Good") color = "bg-accent"
    else if (status === "Moderate") color = "bg-warning"
    else if (status === "Unhealthy for Sensitive Groups") color = "bg-warning"
    else if (status === "Unhealthy") color = "bg-danger"
    else if (status === "Very Unhealthy" || status === "Hazardous") color = "bg-danger"

    const location = latest.devices?.location ?? latest.devices?.name ?? "Unknown location"

    setAqiData({
      value: value ?? 0,
      status,
      color,
      location,
    })
  }, [latest])

  const hasData = aqiData.value > 0 || aqiData.status !== "No data"

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
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
              hasData ? aqiData.color : "bg-muted"
            } text-white`}
          >
            <span className="text-2xl font-bold">
              {hasData ? aqiData.value : "--"}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {hasData ? (
                <>
                  AQI is {aqiData.value}, within the range of{" "}
                  <Badge
                    variant="outline"
                    className={`${aqiData.color} text-white border-0`}
                  >
                    {aqiData.status}
                  </Badge>
                </>
              ) : (
                "Waiting for sensor data…"
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              based on WHO guideline
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              📍 {aqiData.location}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
