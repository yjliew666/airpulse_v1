"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"

interface TrendChartProps {
  pollutant: string
  sensorId: string
  sensorType: "static" | "mobile"
}

interface DataPoint {
  time: string
  value: number
}

export function TrendChart({ pollutant, sensorId, sensorType }: TrendChartProps) {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    // Generate 24 hours of mock data specific to the sensor
    const generateData = () => {
      const points: DataPoint[] = []
      const now = new Date()

      // Use sensor ID to create consistent but different data patterns
      const sensorSeed = sensorId.split("_")[1] ? Number.parseInt(sensorId.split("_")[1]) : 1
      const baseMultiplier = sensorSeed * 0.3

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        const baseValue = sensorType === "mobile" ? Math.random() * 50 + 10 : Math.random() * 80 + 20
        const variation = Math.sin(i / 4 + baseMultiplier) * 10 + Math.random() * 20
        const sensorVariation = baseMultiplier * 5 // Different sensors have different base levels

        points.push({
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          value: Math.max(0, baseValue + variation + sensorVariation),
        })
      }

      return points
    }

    setData(generateData())

    // Update data every 30 seconds with sensor-specific variations
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)]
        const lastValue = prev[prev.length - 1]?.value || 30
        const sensorSeed = sensorId.split("_")[1] ? Number.parseInt(sensorId.split("_")[1]) : 1
        const sensorVariation = (sensorSeed % 3) * 2 // Different sensors have different variation patterns
        const newValue = Math.max(0, lastValue + (Math.random() - 0.5) * 10 + sensorVariation)

        newData.push({
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          value: newValue,
        })

        return newData
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [pollutant, sensorId, sensorType])

  const chartConfig = {
    value: {
      label: pollutant,
      color: "#4FC3F7",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey="time" stroke="#757575" fontSize={10} interval="preserveStartEnd" />
          <YAxis stroke="#757575" fontSize={10} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4FC3F7"
            strokeWidth={2}
            dot={{ fill: "#4FC3F7", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: "#4FC3F7" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
