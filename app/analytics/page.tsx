"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BarChart3, Smartphone, Radio, MapPin, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AirDataProvider, useAirData } from "@/components/data-content"
import type { Sensor } from "@/components/sensors-provider"
import { WellnessReportSection } from "@/components/wellness-report-section"
import { PollutantTrendChart } from "@/components/pollutant-trend-chart"

export default function AnalyticsPage() {
  return (
    <AirDataProvider>
      <AnalyticsContent />
    </AirDataProvider>
  )
}

function AnalyticsContent() {
  const { readings } = useAirData()

  // All devices from backend (via /api/sensors?resource=devices)
  const [devices, setDevices] = useState<
    { id: string; name: string; location: string; sensor_type: "mobile" | "static"; created_at: string }[]
  >([])

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

  // Map devices + their latest reading into the Sensor shape used by analytics components
  const sensors: Sensor[] = useMemo(() => {
    return devices.map((device) => {
      // 🔍 all readings for this device_id
      const deviceReadings = readings.filter((r) => String(r.device_id) === device.id)

      const latestReading =
        deviceReadings.length > 0
          ? deviceReadings.reduce((latest, r) =>
              new Date(r.created_at) > new Date(latest.created_at) ? r : latest,
            deviceReadings[0])
          : null

      const pm25 = latestReading?.pm25 ?? 0
      const co = latestReading?.co ?? 0
      const voc = latestReading?.voc ?? 0

      // Prefer the AQI value computed/stored in the readings table
      const aqiValue = latestReading?.aqi ?? pm25 ?? 0

      let status: Sensor["status"] = "Good"
      if (aqiValue > 100) status = "Unhealthy"
      else if (aqiValue > 50) status = "Moderate"

      return {
        id: device.id,
        type: device.sensor_type,
        name: device.name,
        location: device.location,
        lat: 0,
        lng: 0,
        aqi: aqiValue,
        status,
        lastUpdate: latestReading ? new Date(latestReading.created_at).toLocaleTimeString() : "No data",
        isConnected: !!latestReading,
        pollutants: {
          SO2: 0,
          PM10: 0,
          PM25: pm25,
          O3: 0,
          NO2: 0,
          CO: co,
          VOC: voc,
        },
      }
    })
  }, [devices, readings])

  const [sensorType, setSensorType] = useState<"static" | "mobile">("static")
  const [selectedSensorId, setSelectedSensorId] = useState<string>("")

  // Filter sensors by type
  const filteredSensors = sensors.filter((sensor) => sensor.type === sensorType)

  // Currently selected sensor
  const selectedSensor =
    selectedSensorId ? sensors.find((s) => s.id === selectedSensorId) : filteredSensors[0]

  // ✅ All readings that belong to the selected device_id
  const selectedSensorReadings = useMemo(
    () =>
      selectedSensor
        ? readings.filter((r) => String(r.device_id) === selectedSensor.id)
        : [],
    [selectedSensor, readings]
  )

  // Update selected sensor when switching types
  const handleTypeChange = (type: "static" | "mobile") => {
    setSensorType(type)
    const newFilteredSensors = sensors.filter((sensor) => sensor.type === type)
    if (newFilteredSensors.length > 0) {
      setSelectedSensorId(newFilteredSensors[0].id)
    } else {
      setSelectedSensorId("")
    }
  }

  // Only pollutants that actually have readings from Supabase
  const pollutantList = ["PM2.5", "CO", "VOC"]

  const getPollutantValue = (pollutant: string) => {
    if (!selectedSensor) return 0
    const mapping: { [key: string]: keyof typeof selectedSensor.pollutants } = {
      "PM2.5": "PM25",
      CO: "CO",
      VOC: "VOC",
    }
    return selectedSensor.pollutants[mapping[pollutant]] || 0
  }

  const getRiskLevel = (value: number, pollutant: string) => {
    // Simplified risk assessment based on pollutant levels
    const thresholds: { [key: string]: { moderate: number; high: number } } = {
      "PM2.5": { moderate: 25, high: 50 },
      CO: { moderate: 1.0, high: 2.0 },
      VOC: { moderate: 200, high: 400 },
    }

    const threshold = thresholds[pollutant]
    if (!threshold) return "Low"

    if (value >= threshold.high) return "High"
    if (value >= threshold.moderate) return "Mid"
    return "Low"
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
            <h1 className="text-xl font-bold">Live Analytics</h1>
            <p className="text-primary-foreground/80 text-sm">24-hour trends</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Sensor Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={sensorType === "static" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange("static")}
            className="flex items-center gap-2"
          >
            <Radio className="h-4 w-4" />
            Static Sensors ({sensors.filter((s) => s.type === "static").length})
          </Button>
          <Button
            variant={sensorType === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange("mobile")}
            className="flex items-center gap-2"
          >
            <Smartphone className="h-4 w-4" />
            Mobile Sensors ({sensors.filter((s) => s.type === "mobile").length})
          </Button>
        </div>

        {/* Sensor Selection */}
        {filteredSensors.length > 0 ? (
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select Sensor</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedSensorId} onValueChange={setSelectedSensorId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a sensor" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSensors.map((sensor) => (
                    <SelectItem key={sensor.id} value={sensor.id}>
                      <div className="flex items-center gap-2 w-full">
                        {sensor.type === "mobile" ? (
                          <Smartphone className="h-4 w-4 text-secondary" />
                        ) : (
                          <Radio className="h-4 w-4 text-primary" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sensor.name}</span>
                            {sensor.isConnected ? (
                              <Wifi className="h-3 w-3 text-accent" />
                            ) : (
                              <WifiOff className="h-3 w-3 text-danger" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {sensor.location} • AQI {sensor.aqi}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Sensor Info */}
              {selectedSensor && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{selectedSensor.name}</h3>
                      <Badge
                        className={
                          selectedSensor.status === "Good"
                            ? "bg-accent text-accent-foreground"
                            : selectedSensor.status === "Moderate"
                              ? "bg-warning text-warning-foreground"
                              : "bg-danger text-danger-foreground"
                        }
                      >
                        AQI {selectedSensor.aqi}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {selectedSensor.isConnected ? (
                        <>
                          <Wifi className="h-3 w-3 text-accent" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3 w-3 text-danger" />
                          <span>Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedSensor.location} • Last update:{" "}
                    {selectedSensorReadings.length > 0
                      ? new Date(
                          selectedSensorReadings[selectedSensorReadings.length - 1].created_at
                        ).toLocaleTimeString()
                      : "No data"}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No {sensorType} sensors available</p>
            </CardContent>
          </Card>
        )}

        {/* Wellness Report Section */}
        <WellnessReportSection selectedSensor={selectedSensor} />

        {/* Pollutant Trends Section */}
        {selectedSensor && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Pollutant Trends (24 Hours)</h2>
              <div className="text-sm text-muted-foreground">
                Last updated:{" "}
                {selectedSensorReadings.length > 0
                  ? new Date(
                      selectedSensorReadings[selectedSensorReadings.length - 1].created_at
                    ).toLocaleTimeString()
                  : "No data"}
              </div>
            </div>

            {pollutantList.map((pollutant) => {
              const value = getPollutantValue(pollutant)
              const riskLevel = getRiskLevel(value, pollutant)

              return (
                <Card key={pollutant} className="shadow-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        {pollutant} Trend
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            riskLevel === "Low"
                              ? "bg-accent text-accent-foreground border-accent"
                              : riskLevel === "Mid"
                                ? "bg-warning text-warning-foreground border-warning"
                                : "bg-danger text-danger-foreground border-danger"
                          }
                        >
                          {riskLevel} Risk
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Current:{" "}
                        <span className="font-semibold text-foreground">
                          {value.toFixed(1)}{" "}
                          {pollutant === "CO" ? "mg/m³" : pollutant === "Mold" ? "spores/m³" : "μg/m³"}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Sensor: <span className="font-medium text-foreground">{selectedSensor.name}</span>
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PollutantTrendChart
                      pollutant={pollutant}
                      sensorId={selectedSensor.id}
                      sensorType={selectedSensor.type}
                      currentValue={value}
                      riskLevel={riskLevel}
                    />
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Sensor ID: {selectedSensor.id}</span>
                        <span>Location: {selectedSensor.location}</span>
                        <span>
                          Updated:{" "}
                          {selectedSensorReadings.length > 0
                            ? new Date(
                                selectedSensorReadings[selectedSensorReadings.length - 1].created_at
                              ).toLocaleTimeString()
                            : "No data"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
