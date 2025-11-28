"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useAirData } from "@/components/data-content"

type Status = "Good" | "Moderate" | "Unhealthy"

interface Pollutant {
  name: string
  value: number
  unit: string
  status: Status
  icon: string
}

export function PollutantGrid() {
  const { latest } = useAirData()

  const [pollutants, setPollutants] = useState<Pollutant[]>([
    { name: "PM2.5", value: 0, unit: "μg/m³", status: "Good", icon: "🌪️" },
    { name: "VOC", value: 0, unit: "ppm", status: "Good", icon: "🧪" },
    { name: "CO", value: 0, unit: "ppm", status: "Good", icon: "🏭" },
    // you can add more static/placeholder ones if you have more sensors later:
    // { name: "PM10", value: 0, unit: "μg/m³", status: "Good", icon: "💨" },
    // { name: "O₃", value: 0, unit: "μg/m³", status: "Good", icon: "☀️" },
    // { name: "NO₂", value: 0, unit: "μg/m³", status: "Good", icon: "🚗" },
  ])

  // Helper to derive status from value
  const computeStatus = (name: string, value: number): Status => {
    // You can tweak these thresholds based on real AQI standards
    switch (name) {
      case "PM2.5":
        if (value <= 12) return "Good"
        if (value <= 35.4) return "Moderate"
        return "Unhealthy"
      case "VOC":
        if (value <= 0.3) return "Good"
        if (value <= 0.9) return "Moderate"
        return "Unhealthy"
      case "CO":
        if (value <= 4.4) return "Good"
        if (value <= 9.4) return "Moderate"
        return "Unhealthy"
      default:
        return "Good"
    }
  }

  useEffect(() => {
    if (!latest) return

    setPollutants((prev) =>
      prev.map((pollutant) => {
        let newValue = pollutant.value

        if (pollutant.name === "PM2.5" && typeof latest.pm25 === "number") {
          newValue = latest.pm25
        } else if (pollutant.name === "VOC" && typeof latest.voc === "number") {
          newValue = latest.voc
        } else if (pollutant.name === "CO" && typeof latest.co === "number") {
          newValue = latest.co
        }

        const newStatus = computeStatus(pollutant.name, newValue)

        return {
          ...pollutant,
          value: newValue,
          status: newStatus,
        }
      }),
    )
  }, [latest])

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Good":
        return "bg-accent text-accent-foreground"
      case "Moderate":
        return "bg-warning text-warning-foreground"
      case "Unhealthy":
        return "bg-danger text-danger-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-foreground">Pollutant Levels</h2>
      <div className="grid grid-cols-2 gap-3">
        {pollutants.map((pollutant) => (
          <Card key={pollutant.name} className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{pollutant.icon}</span>
                <Badge className={getStatusColor(pollutant.status)}>
                  {pollutant.status}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{pollutant.name}</h3>
                <p className="text-lg font-bold text-primary">
                  {pollutant.value.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">{pollutant.unit}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
