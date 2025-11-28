"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  User,
  Briefcase,
  Heart,
  Smartphone,
  Radio,
  Plus,
  Edit,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { EditProfileModal, UserProfile } from "@/components/edit-profile-modal"
import { AddSensorModal } from "@/components/add-sensor-modal"
import { useAirData } from "@/components/data-content"

// Shape of rows returned from /api/sensors?resource=devices
interface DeviceRow {
  id: number
  name: string
  location: string
  sensor_type: "mobile" | "static"
  created_at: string
}

export default function ProfilePage() {
  const { readings } = useAirData()

  // ✅ Use the UserProfile type from edit-profile-modal
  const [profile, setProfile] = useState<UserProfile>({
    username: "Alex Chen",
    occupation: "Cyclist",
    healthConditions: ["Asthma"],
    privacy: {
      shareData: true,
      shareLocation: false,
    },
    // Must match ConnectedSensorSummary[]: { id, type, lastSync }
    connectedSensors: [
      // can start empty; example:
      // { id: "1", type: "mobile", lastSync: "No data" }
    ],
  })

  const [devices, setDevices] = useState<DeviceRow[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddSensorModal, setShowAddSensorModal] = useState(false)

  // Fetch all devices from backend (devices table)
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

  const updatePrivacy = (key: keyof typeof profile.privacy, value: boolean) => {
    setProfile((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
  }

  const getLatestReadingForDevice = (deviceId: number) => {
    if (!readings || readings.length === 0) return null
    const idStr = String(deviceId)
    const deviceReadings = readings.filter((r) => String(r.device_id) === idStr)
    if (deviceReadings.length === 0) return null
    return deviceReadings.reduce((latest, r) =>
      new Date(r.created_at) > new Date(latest.created_at) ? r : latest,
    deviceReadings[0])
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
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-primary-foreground/80 text-sm">Manage your account</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{profile.username}</h3>
                <p className="text-sm text-muted-foreground">Username</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Occupation:</span>
              <Badge variant="outline">{profile.occupation}</Badge>
            </div>

            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-danger mt-1" />
              <div>
                <span className="text-sm text-muted-foreground">Health Conditions:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.healthConditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="bg-danger/10 text-danger">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={() => setShowEditModal(true)} className="w-full" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Connected Sensors (from devices table) */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-secondary" />
                Connected Sensors
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddSensorModal(true)}
                className="bg-secondary hover:bg-secondary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {devices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sensors registered yet.</p>
            ) : (
              devices.map((device) => {
                const latest = getLatestReadingForDevice(device.id)
                const isConnected = !!latest
                const lastUpdate = latest
                  ? new Date(latest.created_at).toLocaleTimeString()
                  : "No data"

                return (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {device.sensor_type === "mobile" ? (
                        <Smartphone className="h-4 w-4 text-secondary" />
                      ) : (
                        <Radio className="h-4 w-4 text-primary" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{device.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {device.id} • {device.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={isConnected ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"}
                      >
                        {isConnected ? "Active" : "Offline"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last sync: {lastUpdate}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Share Data</p>
                <p className="text-sm text-muted-foreground">Allow sharing of air quality data</p>
              </div>
              <Switch
                checked={profile.privacy.shareData}
                onCheckedChange={(checked) => updatePrivacy("shareData", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Share Location</p>
                <p className="text-sm text-muted-foreground">Allow sharing of location data</p>
              </div>
              <Switch
                checked={profile.privacy.shareLocation}
                onCheckedChange={(checked) => updatePrivacy("shareLocation", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-danger border-danger hover:bg-danger hover:text-white bg-transparent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={(updated) => setProfile(updated)}  // ✅ matches (profile: UserProfile) => void
      />

      <AddSensorModal
        isOpen={showAddSensorModal}
        onClose={() => setShowAddSensorModal(false)}
      />
    </div>
  )
}
