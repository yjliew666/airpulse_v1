"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Radio, Smartphone } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSensors } from "@/components/sensors-provider"

interface Sensor {
  id: string
  type: "static" | "mobile"
  lat: number
  lng: number
  aqi: number
  status: "Good" | "Moderate" | "Unhealthy"
  lastUpdate: string
  pollutants: {
    PM25: number
    PM10: number
    O3: number
    NO2: number
  }
}

export default function MapPage() {
  const { sensors } = useSensors()
  const [selectedSensor, setSelectedSensor] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good":
        return "#AED581"
      case "Moderate":
        return "#FFB300"
      case "Unhealthy":
        return "#E57373"
      default:
        return "#9E9E9E"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Sensor Map</h1>
            <p className="text-primary-foreground/80 text-sm">Real-time locations</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Simplified Map View */}
        <Card className="shadow-soft">
          <CardContent className="p-0">
            <div className="relative h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=256&width=400')] bg-cover bg-center opacity-20"></div>

              {/* User Location */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-primary">
                  You
                </span>
              </div>

              {/* Sensor Markers */}
              {sensors.map((sensor, index) => (
                <button
                  key={sensor.id}
                  onClick={() => setSelectedSensor(sensor)}
                  className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 ${
                    selectedSensor?.id === sensor.id ? "scale-125 ring-2 ring-primary" : ""
                  }`}
                  style={{
                    backgroundColor: getStatusColor(sensor.status),
                    top: `${20 + index * 25}%`,
                    left: `${30 + index * 20}%`,
                  }}
                >
                  {sensor.type === "mobile" ? (
                    <Smartphone className="h-3 w-3 text-white m-auto mt-0.5" />
                  ) : (
                    <Radio className="h-3 w-3 text-white m-auto mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sensor List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Available Sensors</h2>
          {sensors.map((sensor) => (
            <Card
              key={sensor.id}
              className={`shadow-soft cursor-pointer transition-all ${
                selectedSensor?.id === sensor.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedSensor(sensor)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {sensor.type === "mobile" ? (
                      <Smartphone className="h-4 w-4 text-secondary" />
                    ) : (
                      <Radio className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-medium text-foreground">{sensor.id}</span>
                  </div>
                  <Badge style={{ backgroundColor: getStatusColor(sensor.status) }} className="text-white">
                    AQI {sensor.aqi}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-1 capitalize">{sensor.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-1">{sensor.status}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span>
                    <span className="ml-1">MQTT</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="ml-1">{sensor.lastUpdate}</span>
                  </div>
                </div>

                {selectedSensor?.id === sensor.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-sm mb-2">Current Readings</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        PM2.5: <span className="font-medium">{sensor.pollutants.PM25} μg/m³</span>
                      </div>
                      <div>
                        PM10: <span className="font-medium">{sensor.pollutants.PM10} μg/m³</span>
                      </div>
                      <div>
                        O₃: <span className="font-medium">{sensor.pollutants.O3} μg/m³</span>
                      </div>
                      <div>
                        NO₂: <span className="font-medium">{sensor.pollutants.NO2} μg/m³</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
