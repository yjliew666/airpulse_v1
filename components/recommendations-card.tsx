"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useAirData } from "@/components/data-content"

interface Recommendation {
  riskLevel: "Low" | "Mid" | "High"
  dos: string[]
  donts: string[]
  activities: string[]
  protectiveActions: string[]
}

export function RecommendationsCard() {
  const { latest } = useAirData()

  const [recommendation, setRecommendation] = useState<Recommendation>({
    riskLevel: "Low",
    dos: ["Continue outdoor activities", "Keep windows open for ventilation", "Take regular walks"],
    donts: ["Don't worry about air quality today", "No need for masks outdoors"],
    activities: ["Jogging", "Cycling", "Outdoor sports"],
    protectiveActions: ["Stay hydrated", "Monitor air quality updates"],
  })

  // Decide risk level based on latest readings
  const computeRisk = () => {
    if (!latest) return "Low" as const

    // Prefer risk level computed by backend if available
    if (latest.risk_level) {
      const rl = latest.risk_level
      if (rl === "High") return "High" as const
      if (rl === "Mid") return "Mid" as const
      return "Low" as const
    }

    const pm25 = typeof latest.pm25 === "number" ? latest.pm25 : 0
    const voc = typeof latest.voc === "number" ? latest.voc : 0
    const co = typeof latest.co === "number" ? latest.co : 0

    // Very simple heuristic – fallback if backend doesn't provide risk_level
    let score = 0

    // PM2.5 weight
    if (pm25 > 35.4) score += 2
    else if (pm25 > 12) score += 1

    // VOC weight
    if (voc > 0.9) score += 2
    else if (voc > 0.3) score += 1

    // CO weight
    if (co > 9.4) score += 2
    else if (co > 4.4) score += 1

    if (score >= 3) return "High" as const
    if (score >= 1) return "Mid" as const
    return "Low" as const
  }

  useEffect(() => {
    const newRisk = computeRisk()

    let newRecommendation: Recommendation

    if (newRisk === "High") {
      newRecommendation = {
        riskLevel: "High",
        dos: [
          "Stay indoors as much as possible",
          "Use air purifiers with HEPA filters",
          "Keep windows and doors closed",
        ],
        donts: [
          "Avoid outdoor exercise",
          "Don't open windows during peak pollution hours",
          "Avoid prolonged outdoor exposure",
        ],
        activities: ["Indoor yoga", "Home workouts", "Reading", "Meditation"],
        protectiveActions: [
          "Wear N95 masks outdoors",
          "Use inhaler if prescribed",
          "Monitor symptoms closely",
          "Check AQI before going out",
        ],
      }
    } else if (newRisk === "Mid") {
      newRecommendation = {
        riskLevel: "Mid",
        dos: [
          "Limit outdoor activities to shorter durations",
          "Wear masks during commute or cycling",
          "Check AQI regularly before going out",
        ],
        donts: [
          "Avoid intense outdoor exercise",
          "Don't ignore coughing or breathing discomfort",
        ],
        activities: ["Light walking", "Indoor activities", "Short outdoor tasks in lower AQI hours"],
        protectiveActions: [
          "Carry rescue inhaler if you have asthma",
          "Stay hydrated",
          "Keep windows partially closed during bad hours",
        ],
      }
    } else {
      newRecommendation = {
        riskLevel: "Low",
        dos: [
          "Enjoy outdoor activities",
          "Keep windows open for fresh air",
          "Take regular walks or cycle",
        ],
        donts: ["Don't worry too much about air quality today", "No need for masks in most areas"],
        activities: ["Jogging", "Cycling", "Outdoor sports", "Picnics"],
        protectiveActions: ["Stay hydrated", "Glance at AQI updates if you are sensitive"],
      }
    }

    setRecommendation(newRecommendation)
  }, [latest]) // re-run whenever latest sensor data changes

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-accent text-accent-foreground"
      case "Mid":
        return "bg-warning text-warning-foreground"
      case "High":
        return "bg-danger text-danger-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-danger" />
          Personalized Recommendations
        </CardTitle>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Based on: Live air quality & profile (Asthma, Cyclist)
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Risk Level:</span>
          <Badge className={getRiskColor(recommendation.riskLevel)}>
            {recommendation.riskLevel}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-accent" />
              {"Do's"}
            </h4>
            <ul className="space-y-1">
              {recommendation.dos.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-1">
              <XCircle className="h-4 w-4 text-danger" />
              {"Don'ts"}
            </h4>
            <ul className="space-y-1">
              {recommendation.donts.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-danger mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm text-foreground mb-2">Recommended Activities</h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.activities.map((activity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {activity}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-foreground mb-2">Protective Actions</h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.protectiveActions.map((action, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-secondary/10 text-secondary"
                >
                  {action}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
