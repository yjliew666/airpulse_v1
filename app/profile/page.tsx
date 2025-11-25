"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, User, Briefcase, Heart, Smartphone, Radio, Plus, Edit, LogOut } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { EditProfileModal } from "@/components/edit-profile-modal"
import { AddSensorModal } from "@/components/add-sensor-modal"
import { useSensors } from "@/components/sensors-provider"

interface UserProfile {
  username: string
  occupation: string
  healthConditions: string[]
  privacy: {
    shareData: boolean
    shareLocation: boolean
  }
}

export default function ProfilePage() {
  const { connectedSensors, addSensor, removeSensor } = useSensors()

  // Remove the local connectedSensors state and use the one from context
  // Update the profile state to remove connectedSensors
  const [profile, setProfile] = useState<UserProfile>({
    username: "Alex Chen",
    occupation: "Cyclist",
    healthConditions: ["Asthma"],
    privacy: {
      shareData: true,
      shareLocation: false,
    },
  })

  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddSensorModal, setShowAddSensorModal] = useState(false)

  const updatePrivacy = (key: keyof typeof profile.privacy, value: boolean) => {
    setProfile((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
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

        {/* Connected Sensors */}
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
            {connectedSensors.map((sensor) => (
              <div key={sensor.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {sensor.type === "mobile" ? (
                    <Smartphone className="h-4 w-4 text-secondary" />
                  ) : (
                    <Radio className="h-4 w-4 text-primary" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{sensor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sensor.id} • {sensor.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={sensor.isConnected ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"}
                  >
                    {sensor.isConnected ? "Active" : "Offline"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Last sync: {sensor.lastUpdate}</p>
                </div>
              </div>
            ))}
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
        onSave={setProfile}
      />

      <AddSensorModal isOpen={showAddSensorModal} onClose={() => setShowAddSensorModal(false)} />
    </div>
  )
}
