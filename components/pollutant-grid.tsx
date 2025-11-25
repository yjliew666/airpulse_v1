"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface Pollutant {
  name: string
  value: number
  unit: string
  status: "Good" | "Moderate" | "Unhealthy"
  icon: string
}

export function PollutantGrid() {
  const [pollutants, setPollutants] = useState<Pollutant[]>([
    { name: "SO₂", value: 12, unit: "μg/m³", status: "Good", icon: "🌫️" },
    { name: "PM10", value: 28, unit: "μg/m³", status: "Good", icon: "💨" },
    { name: "PM2.5", value: 15, unit: "μg/m³", status: "Good", icon: "🌪️" },
    { name: "O₃", value: 45, unit: "μg/m³", status: "Moderate", icon: "☀️" },
    { name: "NO₂", value: 22, unit: "μg/m³", status: "Good", icon: "🚗" },
    { name: "CO", value: 0.8, unit: "mg/m³", status: "Good", icon: "🏭" },
    { name: "Mold", value: 3, unit: "spores/m³", status: "Good", icon: "🍄" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setPollutants((prev) =>
        prev.map((pollutant) => ({
          ...pollutant,
          value: Math.max(0, pollutant.value + (Math.random() - 0.5) * 5),
          status: Math.random() > 0.8 ? "Moderate" : "Good",
        })),
      )
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
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
                <Badge className={getStatusColor(pollutant.status)}>{pollutant.status}</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{pollutant.name}</h3>
                <p className="text-lg font-bold text-primary">{pollutant.value.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{pollutant.unit}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
