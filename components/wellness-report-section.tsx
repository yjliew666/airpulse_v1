"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, CalendarIcon, FileSpreadsheet, FileImage } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Sensor } from "@/components/sensors-provider"

interface WellnessReportSectionProps {
  selectedSensor: Sensor | undefined
}

type TimeRange = "today" | "7days" | "month" | "custom"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export function WellnessReportSection({ selectedSensor }: WellnessReportSectionProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7days")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const generateWellnessData = () => {
    // Mock wellness report data
    return {
      sensor: selectedSensor,
      timeRange,
      dateRange,
      pollutantHistory: {
        PM25: { avg: 18.5, max: 35.2, min: 8.1, trend: "improving" },
        PM10: { avg: 32.1, max: 58.7, min: 15.3, trend: "stable" },
        O3: { avg: 45.8, max: 78.9, min: 22.1, trend: "worsening" },
        NO2: { avg: 28.3, max: 42.1, min: 12.8, trend: "improving" },
        SO2: { avg: 15.2, max: 28.5, min: 6.7, trend: "stable" },
        CO: { avg: 0.9, max: 1.8, min: 0.3, trend: "improving" },
      },
      riskLevels: {
        overall: "Mid",
        respiratory: "Mid",
        cardiovascular: "Low",
        allergic: "High",
      },
      recommendations: [
        "Limit outdoor activities during peak pollution hours (7-9 AM, 5-7 PM)",
        "Use N95 masks when cycling in high-traffic areas",
        "Keep rescue inhaler accessible during moderate AQI days",
        "Consider indoor air purifiers for bedroom and workspace",
        "Monitor pollen levels alongside air quality data",
      ],
      protectiveActions: [
        "Wore protective mask: 12 days",
        "Avoided outdoor exercise: 3 days",
        "Used air purifier: 15 days",
        "Took prescribed medication: 7 days",
        "Stayed indoors during alerts: 2 days",
      ],
      exposureScore: 68, // Out of 100
      healthImpact: "Moderate exposure with manageable health risks",
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showSuccessMessage(`${filename} downloaded successfully!`)
    } catch (error) {
      console.error("Download failed:", error)
      showErrorMessage("Download failed. Please try again.")
    }
  }

  const downloadCSV = async () => {
    setIsGenerating(true)

    try {
      // Simulate report generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const data = generateWellnessData()

      // Create CSV content
      const csvContent = [
        "AirPulse Wellness Report - CSV Format",
        `Generated: ${new Date().toLocaleString()}`,
        `Sensor: ${data.sensor?.name || "N/A"} (${data.sensor?.id || "N/A"})`,
        `Time Range: ${getTimeRangeLabel(timeRange)}`,
        "",
        "POLLUTANT EXPOSURE HISTORY",
        "Pollutant,Average,Maximum,Minimum,Trend",
        ...Object.entries(data.pollutantHistory).map(
          ([pollutant, values]) => `${pollutant},${values.avg},${values.max},${values.min},${values.trend}`,
        ),
        "",
        "AI-PREDICTED RISK LEVELS",
        "Risk Category,Level",
        ...Object.entries(data.riskLevels).map(([category, level]) => `${category},${level}`),
        "",
        "PERSONALIZED RECOMMENDATIONS",
        ...data.recommendations.map((rec, index) => `${index + 1}. ${rec}`),
        "",
        "PROTECTIVE ACTIONS SUMMARY",
        ...data.protectiveActions.map((action, index) => `${index + 1}. ${action}`),
        "",
        `Overall Exposure Score: ${data.exposureScore}/100`,
        `Health Impact Assessment: ${data.healthImpact}`,
      ].join("\n")

      const filename = `airpulse-wellness-report-${format(new Date(), "yyyy-MM-dd")}.csv`
      downloadFile(csvContent, filename, "text/csv;charset=utf-8;")
    } catch (error) {
      console.error("CSV generation failed:", error)
      showErrorMessage("Failed to generate CSV report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = async () => {
    setIsGenerating(true)

    try {
      // Simulate report generation delay
      await new Promise((resolve) => setTimeout(resolve, 2500))

      const data = generateWellnessData()

      // Create a comprehensive PDF-like content
      const pdfContent = `
AirPulse Wellness Report - PDF Format
=====================================

Generated: ${new Date().toLocaleString()}
Sensor: ${data.sensor?.name || "N/A"} (${data.sensor?.id || "N/A"})
Time Range: ${getTimeRangeLabel(timeRange)}
User Profile: Cyclist with Asthma

EXECUTIVE SUMMARY
=================
Overall Exposure Score: ${data.exposureScore}/100
Health Impact: ${data.healthImpact}

POLLUTANT EXPOSURE HISTORY
==========================
${Object.entries(data.pollutantHistory)
  .map(
    ([pollutant, values]) =>
      `${pollutant.padEnd(8)} | Avg: ${values.avg.toString().padEnd(6)} | Max: ${values.max.toString().padEnd(6)} | Min: ${values.min.toString().padEnd(6)} | Trend: ${values.trend}`,
  )
  .join("\n")}

AI-PREDICTED RISK LEVELS
========================
${Object.entries(data.riskLevels)
  .map(([category, level]) => `${category.padEnd(15)}: ${level}`)
  .join("\n")}

PERSONALIZED RECOMMENDATIONS
============================
${data.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join("\n")}

PROTECTIVE ACTIONS SUMMARY
==========================
${data.protectiveActions.map((action, index) => `${index + 1}. ${action}`).join("\n")}

HEALTH INSIGHTS
===============
Based on your profile as a cyclist with asthma, this report shows your air quality exposure patterns and provides actionable recommendations to minimize health risks.

Report generated by AirPulse AI Health Analytics
© 2024 AirPulse - Real-time Air Quality Monitoring
      `

      const filename = `airpulse-wellness-report-${format(new Date(), "yyyy-MM-dd")}.txt`
      downloadFile(pdfContent, filename, "text/plain;charset=utf-8;")
    } catch (error) {
      console.error("PDF generation failed:", error)
      showErrorMessage("Failed to generate PDF report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Success/Error message functions
  const showSuccessMessage = (message: string) => {
    const successDiv = document.createElement("div")
    successDiv.className =
      "fixed top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-soft z-50 animate-in slide-in-from-right-2"
    successDiv.textContent = message
    document.body.appendChild(successDiv)

    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv)
      }
    }, 3000)
  }

  const showErrorMessage = (message: string) => {
    const errorDiv = document.createElement("div")
    errorDiv.className =
      "fixed top-4 right-4 bg-danger text-danger-foreground px-4 py-2 rounded-lg shadow-soft z-50 animate-in slide-in-from-right-2"
    errorDiv.textContent = message
    document.body.appendChild(errorDiv)

    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv)
      }
    }, 3000)
  }

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case "today":
        return "Today"
      case "7days":
        return "Last 7 Days"
      case "month":
        return "This Month"
      case "custom":
        return "Custom Range"
      default:
        return "Last 7 Days"
    }
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-secondary" />
          Download Wellness Report
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate comprehensive health and exposure reports based on your air quality data
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sensor Info */}
        {selectedSensor && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {selectedSensor.type === "mobile" ? "📱 Mobile" : "📡 Static"}
              </Badge>
              <span className="font-medium text-foreground">{selectedSensor.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">{selectedSensor.location}</p>
          </div>
        )}

        {/* Time Range Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Select Time Range</h4>
          <div className="grid grid-cols-2 gap-2">
            {(["today", "7days", "month", "custom"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="justify-start"
              >
                {getTimeRangeLabel(range)}
              </Button>
            ))}
          </div>

          {/* Custom Date Range */}
          {timeRange === "custom" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Select custom date range:</p>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateRange.to && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        {/* Report Content Preview */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Report Includes:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Pollutant exposure history and trends
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              AI-predicted respiratory risk levels
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              Personalized recommendations history
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              Summary of protective actions taken
            </div>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            onClick={downloadCSV}
            disabled={isGenerating || !selectedSensor}
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-soft flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Download as CSV"}
            {isGenerating && <Download className="h-4 w-4 animate-bounce" />}
          </Button>

          <Button
            onClick={downloadPDF}
            disabled={isGenerating || !selectedSensor}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-soft flex items-center gap-2"
          >
            <FileImage className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Download as PDF"}
            {isGenerating && <Download className="h-4 w-4 animate-bounce" />}
          </Button>
        </div>

        {!selectedSensor && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Please select a sensor to generate wellness reports
          </p>
        )}
      </CardContent>
    </Card>
  )
}
