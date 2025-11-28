"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState } from "react"

// 👇 Export this so ProfilePage can import it
export interface UserProfile {
  username: string
  occupation: string
  healthConditions: string[]
  connectedSensors: Array<{
    id: string
    type: "mobile" | "static"
    lastSync: string
  }>
  privacy: {
    shareData: boolean
    shareLocation: boolean
  }
}

// Local form state shape
interface EditFormState {
  username: string
  occupation: string
  healthConditions: string[]
  newCondition: string
}

export interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  onSave: (profile: UserProfile) => void
}

export function EditProfileModal({ isOpen, onClose, profile, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState<EditFormState>({
    username: profile.username,
    occupation: profile.occupation,
    healthConditions: profile.healthConditions,
    newCondition: "",
  })

  const occupations: string[] = [
    "Cyclist",
    "Runner",
    "Farmer",
    "Construction Worker",
    "Office Worker",
    "Student",
    "Other",
  ]

  const commonConditions: string[] = ["Asthma", "COPD", "Allergies", "Heart Disease", "None"]

  const handleSave = () => {
    onSave({
      ...profile,
      username: formData.username,
      occupation: formData.occupation,
      healthConditions: formData.healthConditions,
    })
    onClose()
  }

  const addHealthCondition = (condition: string) => {
    if (!formData.healthConditions.includes(condition)) {
      setFormData((prev: EditFormState) => ({
        ...prev,
        healthConditions: [...prev.healthConditions, condition],
      }))
    }
  }

  const removeHealthCondition = (condition: string) => {
    setFormData((prev: EditFormState) => ({
      ...prev,
      healthConditions: prev.healthConditions.filter((c: string) => c !== condition),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev: EditFormState) => ({ ...prev, username: e.target.value }))
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label>Occupation</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {occupations.map((occupation: string) => (
                <Button
                  key={occupation}
                  variant={formData.occupation === occupation ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFormData((prev: EditFormState) => ({ ...prev, occupation }))
                  }
                >
                  {occupation}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Health Conditions</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {formData.healthConditions.map((condition: string) => (
                <Badge
                  key={condition}
                  variant="outline"
                  className="bg-danger/10 text-danger"
                >
                  {condition}
                  <button
                    onClick={() => removeHealthCondition(condition)}
                    className="ml-1 hover:text-danger/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {commonConditions
                .filter((condition: string) => !formData.healthConditions.includes(condition))
                .map((condition: string) => (
                  <Button
                    key={condition}
                    variant="outline"
                    size="sm"
                    onClick={() => addHealthCondition(condition)}
                  >
                    + {condition}
                  </Button>
                ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
