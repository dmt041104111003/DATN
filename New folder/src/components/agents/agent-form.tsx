"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { LocationPicker } from "@/components/ui/location-picker"
import { userRepository, type AgentUserInfo } from "@/lib/api/user.repository"
import type { CreateAgentInput } from "@/types"

interface AgentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CreateAgentInput
  onFormChange: (data: CreateAgentInput) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
}

export function AgentForm({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isPending,
}: AgentFormProps) {
  const [fetchingUser, setFetchingUser] = useState(false)
  const [userInfo, setUserInfo] = useState<{ id: string; address: string; name: string | null; role: string | null } | null>(null)
  const [userError, setUserError] = useState("")

  useEffect(() => {
    if (!formData.address || formData.address.length < 10) {
      setUserInfo(null)
      setUserError("")
      return
    }

    const timer = setTimeout(async () => {
      setFetchingUser(true)
      setUserError("")

      try {
        const user = await userRepository.findByAddress(formData.address)
        if (user) {
          setUserInfo({
            id: user.id,
            address: user.address,
            name: user.name,
            role: user.role,
          })
          setUserError("")
        } else {
          setUserInfo(null)
          setUserError("")
        }
      } catch (err) {
        setUserInfo(null)
        setUserError(err instanceof Error ? err.message : "Failed to fetch user info")
      } finally {
        setFetchingUser(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.address])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setUserInfo(null)
      setUserError("")
    }
    onOpenChange(isOpen)
  }

  const isValid = !userError && formData.address && formData.address.length >= 10 && formData.location && formData.gpsCoordinates

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Icon name="add" size="sm" className="mr-2" />
          Add Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Add a new distribution agent. They will be able to receive shipments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Wallet Address *</Label>
            <div className="relative">
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => onFormChange({ ...formData, address: e.target.value })}
                placeholder="addr1..."
                required
              />
              {fetchingUser && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {userError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <Icon name="error" size="sm" />
                {userError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={userInfo?.name || ""}
              disabled
              className="bg-muted"
              placeholder={userInfo ? (userInfo.name || "No name set") : "Auto-fill from wallet"}
            />
            <p className="text-xs text-muted-foreground">
              Fetched from user profile
            </p>
          </div>

          <LocationPicker
            label="Location"
            required
            value={{
              location: formData.location || "",
              gpsCoordinates: formData.gpsCoordinates || "",
            }}
            onChange={({ location, gpsCoordinates }) => 
              onFormChange({ ...formData, location, gpsCoordinates })
            }
          />
          <p className="text-xs text-muted-foreground">
            Agent chỉ có thể confirm shipment khi ở trong khu vực này
          </p>

          <DialogFooter>
            <Button type="submit" disabled={isPending || !isValid}>
              {isPending ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
