"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Smartphone, Radio } from "lucide-react"
import { useState } from "react"
import { useSensors } from "@/components/sensors-provider"

interface AddSensorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddSensorModal({ isOpen, onClose }: AddSensorModalProps) {
  const { addSensor } = useSensors()
  const [formData, setFormData] = useState({
    sensorId: "",
    sensorType: "mobile" as "mobile" | "static",
  })

  const handleAdd = () => {
    if (formData.sensorId.trim()) {
      addSensor({
        id: formData.sensorId.trim(),
        type: formData.sensorType,
        name: formData.sensorId.trim(),
        location: formData.sensorType === "mobile" ? "Mobile Unit" : "Fixed Location",
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.006 + (Math.random() - 0.5) * 0.1,
        isConnected: true,
      })
      setFormData({ sensorId: "", sensorType: "mobile" })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Sensor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sensorId">Sensor ID</Label>
            <Input
              id="sensorId"
              placeholder="Enter sensor ID (e.g., MOBILE_002)"
              value={formData.sensorId}
              onChange={(e) => setFormData((prev) => ({ ...prev, sensorId: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Sensor Type</Label>
            <RadioGroup
              value={formData.sensorType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, sensorType: value as "mobile" | "static" }))}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-secondary" />
                  Mobile Sensor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="static" id="static" />
                <Label htmlFor="static" className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" />
                  Static Sensor
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleAdd} className="flex-1" disabled={!formData.sensorId.trim()}>
              Add Sensor
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
