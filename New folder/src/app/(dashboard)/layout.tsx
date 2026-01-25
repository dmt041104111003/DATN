"use client"

import { useLayoutEffect, useState, useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { useAuthStore } from "@/stores/auth.store"
import { userRepository } from "@/lib/api/user.repository"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Icon } from "@/components/ui/icon"
import type { UserRole } from "@/types"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, walletId, setUser, logout } = useAuthStore()
  const [isAuth, setIsAuth] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState<UserRole | null>(null)
  const [saving, setSaving] = useState(false)
  const hasCheckedAuth = useRef(false)

  useLayoutEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      if (user) {
        if (!user.name || !user.role) setShowSetupDialog(true)
        if (isMounted) setIsAuth(true)
        return
      }

      if (!hasCheckedAuth.current) {
        hasCheckedAuth.current = true
        try {
          const userData = await userRepository.getMe()
          if (!isMounted) return
          
          setUser(userData, undefined)
          if (!userData.name || !userData.role) setShowSetupDialog(true)
          setIsAuth(true)
        } catch (error) {
          if (!isMounted) return
          logout()
          window.location.replace("/login")
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [user, setUser, logout])

  useEffect(() => {
    if (user) {
      if (!user.name || !user.role) {
        setShowSetupDialog(true)
      } else {
        setShowSetupDialog(false)
      }
    }
  }, [user]) 
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }
    if (!role) {
      toast.error("Please select your role")
      return
    }

    setSaving(true)
    try {
      const updatedUser = await userRepository.updateMe({ name: name.trim(), role })
      setUser(updatedUser, walletId || undefined)
      setShowSetupDialog(false)
      toast.success("Profile saved!")
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (!isAuth) return null

  if (showSetupDialog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Welcome to HSupply!</h1>
            <p className="text-muted-foreground">Please complete your profile to continue.</p>
          </div>

          <div className="bg-card border rounded-xl p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <Label>Select Your Role</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("MANUFACTURER")}
                  className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:border-primary/50 ${
                    role === "MANUFACTURER" 
                      ? "border-primary bg-primary/5" 
                      : "border-border"
                  }`}
                >
                  <div className={`rounded-full p-3 ${role === "MANUFACTURER" ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon name="factory" size="lg" className={role === "MANUFACTURER" ? "text-primary" : ""} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Manufacturer</p>
                    <p className="text-xs text-muted-foreground">Create products & batches</p>
                  </div>
                  {role === "MANUFACTURER" && (
                    <div className="absolute right-2 top-2">
                      <Icon name="check_circle" size="sm" className="text-primary" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("AGENT")}
                  className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:border-primary/50 ${
                    role === "AGENT" 
                      ? "border-primary bg-primary/5" 
                      : "border-border"
                  }`}
                >
                  <div className={`rounded-full p-3 ${role === "AGENT" ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon name="storefront" size="lg" className={role === "AGENT" ? "text-primary" : ""} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Agent</p>
                    <p className="text-xs text-muted-foreground">Distribute & sell products</p>
                  </div>
                  {role === "AGENT" && (
                    <div className="absolute right-2 top-2">
                      <Icon name="check_circle" size="sm" className="text-primary" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving || !name.trim() || !role} className="w-full">
              {saving ? "Saving..." : "Get Started"}
            </Button>

            <button
              type="button"
              onClick={() => {
                logout()
                window.location.replace("/login")
              }}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="logout" size="sm" />
              Log out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
