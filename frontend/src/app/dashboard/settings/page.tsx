"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your wallet address and account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
              <p className="mt-1 font-mono text-xs sm:text-sm break-all overflow-x-auto">{user?.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="mt-1 font-mono text-xs sm:text-sm break-all overflow-x-auto">{user?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
