"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface PollutantTrendChartProps {
  pollutant: string
  sensorId: string
  sensorType: "static" | "mobile"
  currentValue: number
  riskLevel: "Low" | "Mid" | "High"
}

interface DataPoint {
  time: string
  value: number
  timestamp: number
}

export function PollutantTrendChart({
  pollutant,
  sensorId,
  sensorType,
  currentValue,
  riskLevel,
}: PollutantTrendChartProps) {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    // Generate 24 hours of realistic data
    const generateTrendData = () => {
      const points: DataPoint[] = []
      const now = Date.now()

      // Base values for different pollutants
      const pollutantBases: { [key: string]: number } = {
        "PM2.5": 18,
        PM10: 32,
        "O₃": 45,
        "NO₂": 25,
        "SO₂": 12,
        CO: 0.8,
        Mold: 3,
      }

      const baseValue = pollutantBases[pollutant] || 25
      const sensorMultiplier = (Number.parseInt(sensorId.split("_")[1]) || 1) * 0.2

      for (let i = 23; i >= 0; i--) {
        const timestamp = now - i * 60 * 60 * 1000
        const date = new Date(timestamp)
        const hour = date.getHours()

        // Create realistic patterns
        let multiplier = 1

        // Rush hour peaks (7-9 AM, 5-7 PM)
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
          multiplier = 1.4
        }
        // Night reduction (10 PM - 6 AM)
        else if (hour >= 22 || hour <= 6) {
          multiplier = 0.6
        }

        // Add some randomness and sensor-specific variation
        const variation = (Math.random() - 0.5) * 10
        const sensorVariation = Math.sin(i / 6 + sensorMultiplier) * 8

        const finalValue = Math.max(1, baseValue * multiplier + variation + sensorVariation)

        points.push({
          time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          value: Number(finalValue.toFixed(1)),
          timestamp,
        })
      }

      return points
    }

    setData(generateTrendData())

    // Update data every 30 seconds
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)]
        const lastValue = prevData[prevData.length - 1]?.value || currentValue
        const variation = (Math.random() - 0.5) * 6
        const newValue = Math.max(1, lastValue + variation)

        newData.push({
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          value: Number(newValue.toFixed(1)),
          timestamp: Date.now(),
        })

        return newData
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [pollutant, sensorId, currentValue])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      let riskColor = "bg-accent text-accent-foreground"
      let risk = "Low"

      // Determine risk based on value
      const thresholds: { [key: string]: { moderate: number; high: number } } = {
        "PM2.5": { moderate: 25, high: 50 },
        PM10: { moderate: 50, high: 100 },
        "O₃": { moderate: 60, high: 120 },
        "NO₂": { moderate: 40, high: 80 },
        "SO₂": { moderate: 20, high: 50 },
        CO: { moderate: 1.0, high: 2.0 },
        Mold: { moderate: 5, high: 10 },
      }

      const threshold = thresholds[pollutant]
      if (threshold) {
        if (value >= threshold.high) {
          risk = "High"
          riskColor = "bg-danger text-danger-foreground"
        } else if (value >= threshold.moderate) {
          risk = "Mid"
          riskColor = "bg-warning text-warning-foreground"
        }
      }

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{`Time: ${label}`}</p>
          <p className="text-sm text-primary mb-2">
            {`${pollutant}: ${value} ${pollutant === "CO" ? "mg/m³" : pollutant === "Mold" ? "spores/m³" : "μg/m³"}`}
          </p>
          <Badge className={`${riskColor} text-xs`}>{risk} Risk</Badge>
        </div>
      )
    }
    return null
  }

  // Calculate statistics
  const average = data.length > 0 ? data.reduce((sum, point) => sum + point.value, 0) / data.length : 0
  const maximum = data.length > 0 ? Math.max(...data.map((point) => point.value)) : 0
  const minimum = data.length > 0 ? Math.min(...data.map((point) => point.value)) : 0

  // Get risk color for the line
  const getLineColor = () => {
    switch (riskLevel) {
      case "High":
        return "#E57373"
      case "Mid":
        return "#FFB300"
      case "Low":
        return "#AED581"
      default:
        return "#4FC3F7"
    }
  }

  return (
    <div className="space-y-4">
      {/* Health Risk Tag */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Health Risk Level:</span>
        <Badge
          className={
            riskLevel === "Low"
              ? "bg-accent text-accent-foreground"
              : riskLevel === "Mid"
                ? "bg-warning text-warning-foreground"
                : "bg-danger text-danger-foreground"
          }
        >
          {riskLevel}
        </Badge>
      </div>

      {/* Line Chart */}
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="time" stroke="#6B7280" fontSize={11} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis stroke="#6B7280" fontSize={11} tick={{ fontSize: 11 }} domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getLineColor()}
              strokeWidth={3}
              dot={{ fill: getLineColor(), strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                fill: getLineColor(),
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Average</p>
          <p className="text-sm font-semibold text-foreground">{average.toFixed(1)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Maximum</p>
          <p className="text-sm font-semibold text-foreground">{maximum.toFixed(1)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Minimum</p>
          <p className="text-sm font-semibold text-foreground">{minimum.toFixed(1)}</p>
        </div>
      </div>
    </div>
  )
}
