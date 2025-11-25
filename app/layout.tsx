import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { SensorsProvider } from "@/components/sensors-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AirPulse - Real-time Air Quality Monitoring",
  description: "Monitor air quality in real time with AI-powered health predictions and personalized recommendations",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <SensorsProvider>
          <main className="pb-20">{children}</main>
          <Navigation />
        </SensorsProvider>
      </body>
    </html>
  )
}
