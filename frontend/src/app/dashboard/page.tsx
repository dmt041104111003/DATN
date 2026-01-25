"use client"

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Welcome to your traceability dashboard</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <p className="font-mono text-xs sm:text-sm mt-1 break-all overflow-x-auto">
                {user?.address || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-xs sm:text-sm mt-1 break-all overflow-x-auto">{user?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
