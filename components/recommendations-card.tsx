"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface Recommendation {
  riskLevel: "Low" | "Mid" | "High"
  dos: string[]
  donts: string[]
  activities: string[]
  protectiveActions: string[]
}

export function RecommendationsCard() {
  const [recommendation, setRecommendation] = useState<Recommendation>({
    riskLevel: "Low",
    dos: ["Continue outdoor activities", "Keep windows open for ventilation", "Take regular walks"],
    donts: ["Don't worry about air quality today", "No need for masks outdoors"],
    activities: ["Jogging", "Cycling", "Outdoor sports"],
    protectiveActions: ["Stay hydrated", "Monitor air quality updates"],
  })

  useEffect(() => {
    // Simulate AI-based recommendations based on user profile and AQI
    const interval = setInterval(() => {
      const riskLevels: ("Low" | "Mid" | "High")[] = ["Low", "Mid", "High"]
      const newRisk = riskLevels[Math.floor(Math.random() * 3)]

      let newRecommendation: Recommendation

      if (newRisk === "High") {
        newRecommendation = {
          riskLevel: "High",
          dos: ["Stay indoors as much as possible", "Use air purifiers", "Keep windows closed"],
          donts: ["Avoid outdoor exercise", "Don't open windows", "Avoid prolonged outdoor exposure"],
          activities: ["Indoor yoga", "Home workouts", "Reading"],
          protectiveActions: ["Wear N95 masks outdoors", "Use inhaler if prescribed", "Monitor symptoms"],
        }
      } else if (newRisk === "Mid") {
        newRecommendation = {
          riskLevel: "Mid",
          dos: ["Limit outdoor activities", "Wear masks during commute", "Check AQI regularly"],
          donts: ["Avoid intense outdoor exercise", "Don't ignore respiratory symptoms"],
          activities: ["Light walking", "Indoor activities", "Short outdoor tasks"],
          protectiveActions: ["Carry rescue inhaler", "Stay hydrated", "Monitor breathing"],
        }
      } else {
        newRecommendation = {
          riskLevel: "Low",
          dos: ["Enjoy outdoor activities", "Keep windows open", "Take regular walks"],
          donts: ["Don't worry about air quality", "No need for masks"],
          activities: ["Jogging", "Cycling", "Outdoor sports"],
          protectiveActions: ["Stay hydrated", "Monitor updates"],
        }
      }

      setRecommendation(newRecommendation)
    }, 12000)

    return () => clearInterval(interval)
  }, [])

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
