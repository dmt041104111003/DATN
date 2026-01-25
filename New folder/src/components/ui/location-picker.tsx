"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Icon } from "@/components/ui/icon"

const MapComponent = dynamic(
  () => import("./location-picker-map"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] rounded-lg border bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading map...</span>
        </div>
      </div>
    ),
  }
)

interface LocationPickerProps {
  value?: {
    location: string
    gpsCoordinates: string
  }
  onChange: (value: { location: string; gpsCoordinates: string }) => void
  label?: string
  required?: boolean
}

export function LocationPicker({ value, onChange, label = "Location", required }: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [tempLocation, setTempLocation] = useState(value?.location || "")
  const [tempCoords, setTempCoords] = useState(value?.gpsCoordinates || "")
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (open) {
      setTempLocation(value?.location || "")
      setTempCoords(value?.gpsCoordinates || "")
    }
  }, [open, value])

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setTempCoords(`${lat},${lng}`)
    setSearching(true)

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        { headers: { "Accept-Language": "vi" } }
      )
      const data = await res.json()
      
      const addr = data.address || {}
      const parts = [
        addr.road || addr.hamlet || addr.village,
        addr.suburb || addr.town || addr.city_district,
        addr.city || addr.state,
        addr.country,
      ].filter(Boolean)
      
      setTempLocation(parts.join(", ") || data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    } catch {
      setTempLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    } finally {
      setSearching(false)
    }
  }, [])

  const handleConfirm = () => {
    if (tempCoords) {
      onChange({
        location: tempLocation,
        gpsCoordinates: tempCoords,
      })
      setOpen(false)
    }
  }

  const handleClear = () => {
    onChange({ location: "", gpsCoordinates: "" })
    setTempLocation("")
    setTempCoords("")
  }

  const currentCoords = tempCoords ? tempCoords.split(",").map(Number) as [number, number] : undefined

  return (
    <div className="space-y-2">
      <Label>{label} {required && "*"}</Label>
      
      <div className="flex gap-2">
        <Input
          value={value?.location || ""}
          readOnly
          placeholder="Click to select on map..."
          className="bg-muted cursor-pointer"
          onClick={() => setOpen(true)}
        />
        {value?.location && (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear}>
            <Icon name="close" size="sm" />
          </Button>
        )}
        <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Icon name="location_on" size="sm" />
        </Button>
      </div>

      {value?.gpsCoordinates && (
        <p className="text-xs text-muted-foreground font-mono">
          GPS: {value.gpsCoordinates}
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="h-[350px] rounded-lg overflow-hidden">
              <MapComponent
                center={currentCoords || [16.0, 108.0]}
                marker={currentCoords}
                onMapClick={handleMapClick}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="location_on" size="sm" className="text-muted-foreground" />
                <span className="text-sm font-medium">Selected Location:</span>
                {searching && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <Input
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
                placeholder="Click on map to select location..."
              />
              {tempCoords && (
                <p className="text-xs text-muted-foreground font-mono">
                  Coordinates: {tempCoords}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!tempCoords}>
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
