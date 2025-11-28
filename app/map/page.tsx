"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Radio, Smartphone } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useAirData } from "@/components/data-content"

interface Sensor {
  id: string
  name: string
  location: string
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

// Shape of rows returned from /api/sensors?resource=devices
interface DeviceRow {
  id: number
  name: string
  location: string
  sensor_type: "mobile" | "static"
  created_at: string
}

export default function MapPage() {
  const { readings } = useAirData()

  const [devices, setDevices] = useState<DeviceRow[]>([])
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)

  // Fetch all devices from backend
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("/api/sensors?resource=devices")
        const json = await res.json()
        if (Array.isArray(json)) {
          setDevices(json)
        } else {
          console.error("Unexpected devices response:", json)
        }
      } catch (e) {
        console.error("Failed to fetch devices:", e)
      }
    }

    fetchDevices()
  }, [])

  // Build Sensor[] by joining devices + latest reading per device
  const sensors: Sensor[] = useMemo(() => {
    return devices.map((device) => {
      const deviceId = String(device.id)

      const deviceReadings = readings.filter((r) => String(r.device_id) === deviceId)
      const latestReading =
        deviceReadings.length > 0
          ? deviceReadings.reduce((latest, r) =>
              new Date(r.created_at) > new Date(latest.created_at) ? r : latest,
            deviceReadings[0])
          : null

      const pm25 = latestReading?.pm25 ?? 0
      const aqiValue = latestReading?.aqi ?? pm25 ?? 0

      // Map backend risk_level → simple 3-state status
      let status: Sensor["status"] = "Good"
      if (latestReading?.risk_level === "Mid") status = "Moderate"
      if (latestReading?.risk_level === "High") status = "Unhealthy"

      return {
        id: deviceId,
        name: device.name,
        location: device.location,
        type: device.sensor_type,
        lat: 0, // placeholder until you add real coordinates
        lng: 0,
        aqi: aqiValue,
        status,
        lastUpdate: latestReading
          ? new Date(latestReading.created_at).toLocaleTimeString()
          : "No data",
        pollutants: {
          PM25: pm25,
          PM10: 0,
          O3: 0,
          NO2: 0,
        },
      }
    })
  }, [devices, readings])

  const getLatestReadingForSensor = (sensorId: string) => {
    if (!readings || readings.length === 0) return null
    const deviceReadings = readings.filter((r) => String(r.device_id) === sensorId)
    if (deviceReadings.length === 0) return null
    return deviceReadings.reduce((latest, r) =>
      new Date(r.created_at) > new Date(latest.created_at) ? r : latest,
    deviceReadings[0])
  }

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
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
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
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=256&width=400')] bg-cover bg-center opacity-20" />

              {/* User Location */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse" />
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
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{sensor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ID: {sensor.id} • {sensor.location}
                      </span>
                    </div>
                  </div>
                  <Badge
                    style={{ backgroundColor: getStatusColor(sensor.status) }}
                    className="text-white"
                  >
                    AQI{" "}
                    {(() => {
                      const lr = getLatestReadingForSensor(sensor.id)
                      return lr?.aqi ?? sensor.aqi
                    })()}
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
                      <div>
                        <span className="text-muted-foreground">AQI (latest):</span>
                        <span className="ml-1 font-medium">
                          {(() => {
                            const lr = getLatestReadingForSensor(sensor.id)
                            return lr?.aqi ?? sensor.aqi
                          })()}
                        </span>
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
