"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import { useAQIData } from "@/lib/use-aqi-data"
import { useMemo } from "react"

interface Recommendation {
  riskLevel: "Low" | "Mid" | "High"
  dos: string[]
  donts: string[]
  activities: string[]
  protectiveActions: string[]
  advisedExposureTime: string
}

export function RecommendationsCard() {
  const { aqiData } = useAQIData()

  const recommendation = useMemo<Recommendation>(() => {
    const aqi = aqiData.value

    // Good (0-50)
    if (aqi <= 50) {
      return {
        riskLevel: "Low",
        dos: ["Continue outdoor activities", "Keep windows open for ventilation", "Take regular walks"],
        donts: ["Don't worry about air quality today", "No need for masks outdoors"],
        activities: ["Jogging", "Cycling", "Outdoor sports", "Picnics"],
        protectiveActions: ["Stay hydrated", "Monitor air quality updates"],
        advisedExposureTime: "Unlimited outdoor time with normal precautions",
      }
    }
    // Moderate (51-100)
    else if (aqi <= 100) {
      return {
        riskLevel: "Mid",
        dos: [
          "Reduce prolonged outdoor exertion",
          "Take breaks during outdoor activities",
          "Monitor symptoms if sensitive",
          "Keep inhaler accessible",
        ],
        donts: [
          "Don't exercise near busy roads",
          "Avoid outdoor activities during peak hours",
          "Don't ignore respiratory symptoms",
        ],
        activities: ["Light walking", "Indoor cycling", "Yoga", "Swimming (indoor)"],
        protectiveActions: [
          "Consider wearing mask during cycling",
          "Close windows during peak hours",
          "Use air purifier indoors",
        ],
        advisedExposureTime: "Limit to 2-3 hours of moderate outdoor activity",
      }
    }
    // Unhealthy (101-150)
    else if (aqi <= 150) {
      return {
        riskLevel: "High",
        dos: [
          "Stay indoors as much as possible",
          "Use air purifier at home",
          "Keep inhaler nearby at all times",
          "Monitor symptoms closely",
        ],
        donts: [
          "Avoid all outdoor exercise",
          "Don't open windows",
          "Avoid cycling outdoors",
          "Don't ignore any breathing difficulties",
        ],
        activities: ["Indoor exercises", "Stretching", "Light yoga (indoor)", "Reading"],
        protectiveActions: [
          "Wear N95 mask if going outside",
          "Keep all windows closed",
          "Use HEPA air purifier",
          "Have emergency inhaler ready",
        ],
        advisedExposureTime: "Minimize outdoor exposure - max 30 minutes with mask",
      }
    }
    // Very Unhealthy (151+)
    else {
      return {
        riskLevel: "High",
        dos: ["Stay indoors with air purifier running", "Keep emergency contacts ready", "Monitor health continuously"],
        donts: [
          "Do not go outside unless absolutely necessary",
          "Avoid any physical exertion",
          "Don't open windows or doors",
        ],
        activities: ["Rest", "Light indoor activities only", "Meditation"],
        protectiveActions: [
          "Use N95/P100 mask if must go outside",
          "Seal windows and doors",
          "Run air purifier continuously",
          "Contact doctor if symptoms worsen",
        ],
        advisedExposureTime: "Avoid outdoor exposure - stay indoors",
      }
    }
  }, [aqiData.value])

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
          <span className="text-sm text-muted-foreground">Based on: Asthma, Cyclist</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Risk Level:</span>
          <Badge className={getRiskColor(recommendation.riskLevel)}>{recommendation.riskLevel}</Badge>
        </div>

        <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-secondary" />
            <h4 className="font-medium text-sm text-foreground">Advised Exposure Time</h4>
          </div>
          <p className="text-sm text-foreground font-medium">{recommendation.advisedExposureTime}</p>
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
                <Badge key={index} variant="outline" className="text-xs bg-secondary/10 text-secondary">
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
