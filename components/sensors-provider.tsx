"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Sensor {
  id: string
  type: "static" | "mobile"
  name: string
  location: string
  lat: number
  lng: number
  aqi: number
  status: "Good" | "Moderate" | "Unhealthy"
  lastUpdate: string
  isConnected: boolean
  pollutants: {
    SO2: number
    PM10: number
    PM25: number
    O3: number
    NO2: number
    CO: number
    VOC: number
    Mold?: number
  }
}

interface SensorsContextType {
  sensors: Sensor[]
  connectedSensors: Sensor[]
  addSensor: (sensor: Omit<Sensor, "aqi" | "status" | "lastUpdate" | "pollutants">) => void
  removeSensor: (sensorId: string) => void
  updateSensorConnection: (sensorId: string, isConnected: boolean) => void
}

const SensorsContext = createContext<SensorsContextType | undefined>(undefined)

export function SensorsProvider({ children }: { children: React.ReactNode }) {
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: "STATIC_001",
      type: "static",
      name: "Downtown Station",
      location: "Downtown District",
      lat: 40.7128,
      lng: -74.006,
      aqi: 45,
      status: "Good",
      lastUpdate: "2 min ago",
      isConnected: true,
      pollutants: { SO2: 12, PM10: 28, PM25: 15, O3: 45, NO2: 22, CO: 0.8, VOC: 200 },
    },
    {
      id: "STATIC_002",
      type: "static",
      name: "Central Park Station",
      location: "Central Park Area",
      lat: 40.7589,
      lng: -73.9851,
      aqi: 78,
      status: "Moderate",
      lastUpdate: "1 min ago",
      isConnected: true,
      pollutants: { SO2: 25, PM10: 45, PM25: 28, O3: 78, NO2: 35, CO: 1.2, VOC: 260 },
    },
    {
      id: "STATIC_003",
      type: "static",
      name: "Industrial Zone",
      location: "Industrial District",
      lat: 40.7282,
      lng: -74.0776,
      aqi: 95,
      status: "Moderate",
      lastUpdate: "3 min ago",
      isConnected: true,
      pollutants: { SO2: 35, PM10: 52, PM25: 32, O3: 65, NO2: 45, CO: 1.5, VOC: 300 },
    },
    {
      id: "MOBILE_001",
      type: "mobile",
      name: "Personal Sensor",
      location: "Your Location",
      lat: 40.7505,
      lng: -73.9934,
      aqi: 32,
      status: "Good",
      lastUpdate: "30 sec ago",
      isConnected: true,
      pollutants: { SO2: 8, PM10: 18, PM25: 12, O3: 32, NO2: 15, CO: 0.6, VOC: 180, Mold: 3 },
    },
    {
      id: "MOBILE_002",
      type: "mobile",
      name: "Bike Sensor",
      location: "Mobile Unit",
      lat: 40.7614,
      lng: -73.9776,
      aqi: 58,
      status: "Moderate",
      lastUpdate: "1 min ago",
      isConnected: false,
      pollutants: { SO2: 18, PM10: 32, PM25: 22, O3: 48, NO2: 28, CO: 0.9, VOC: 220, Mold: 5 },
    },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prevSensors) =>
        prevSensors.map((sensor) => {
          if (!sensor.isConnected) return sensor

          const variation = (Math.random() - 0.5) * 10
          const newAqi = Math.max(10, Math.min(150, sensor.aqi + variation))

          let status: "Good" | "Moderate" | "Unhealthy" = "Good"
          if (newAqi > 100) status = "Unhealthy"
          else if (newAqi > 50) status = "Moderate"

          return {
            ...sensor,
            aqi: Math.round(newAqi),
            status,
            lastUpdate: "Just now",
            pollutants: {
              ...sensor.pollutants,
              SO2: Math.max(0, sensor.pollutants.SO2 + (Math.random() - 0.5) * 3),
              PM10: Math.max(0, sensor.pollutants.PM10 + (Math.random() - 0.5) * 5),
              PM25: Math.max(0, sensor.pollutants.PM25 + (Math.random() - 0.5) * 4),
              O3: Math.max(0, sensor.pollutants.O3 + (Math.random() - 0.5) * 6),
              NO2: Math.max(0, sensor.pollutants.NO2 + (Math.random() - 0.5) * 4),
              CO: Math.max(0, sensor.pollutants.CO + (Math.random() - 0.5) * 0.2),
              VOC: Math.max(0, sensor.pollutants.VOC + (Math.random() - 0.5) * 10),
              ...(sensor.pollutants.Mold && {
                Mold: Math.max(0, sensor.pollutants.Mold + (Math.random() - 0.5) * 1),
              }),
            },
          }
        }),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const connectedSensors = sensors.filter((sensor) => sensor.isConnected)

  const addSensor = (newSensor: Omit<Sensor, "aqi" | "status" | "lastUpdate" | "pollutants">) => {
    const sensor: Sensor = {
      ...newSensor,
      aqi: Math.floor(Math.random() * 100) + 10,
      status: "Good",
      lastUpdate: "Just now",
      pollutants: {
        SO2: Math.random() * 30,
        PM10: Math.random() * 50,
        PM25: Math.random() * 35,
        O3: Math.random() * 80,
        NO2: Math.random() * 40,
        CO: Math.random() * 2,
        VOC: Math.random() * 300,
        ...(newSensor.type === "mobile" && { Mold: Math.random() * 10 }),
      },
    }
    setSensors((prev) => [...prev, sensor])
  }

  const removeSensor = (sensorId: string) => {
    setSensors((prev) => prev.filter((sensor) => sensor.id !== sensorId))
  }

  const updateSensorConnection = (sensorId: string, isConnected: boolean) => {
    setSensors((prev) => prev.map((sensor) => (sensor.id === sensorId ? { ...sensor, isConnected } : sensor)))
  }

  return (
    <SensorsContext.Provider
      value={{
        sensors,
        connectedSensors,
        addSensor,
        removeSensor,
        updateSensorConnection,
      }}
    >
      {children}
    </SensorsContext.Provider>
  )
}

export function useSensors() {
  const context = useContext(SensorsContext)
  if (context === undefined) {
    throw new Error("useSensors must be used within a SensorsProvider")
  }
  return context
}
