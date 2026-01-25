"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api/client'
import { ProductQuota } from '@/types/api'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [quota, setQuota] = useState<ProductQuota | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuota()
  }, [])

  const loadQuota = async () => {
    try {
      const data = await apiClient.products.getQuota()
      setQuota(data)
    } catch (err) {
      console.error('Failed to load quota:', err)
    } finally {
      setLoading(false)
    }
  }

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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Service Usage</CardTitle>
              <CardDescription>Your current plan and product quota</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/billing')} className="w-full sm:w-auto">
              Upgrade
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : quota ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Plan</label>
                <p className="mt-1 font-medium">{quota.tier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product Usage</label>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                    <span className="flex-shrink-0">Used</span>
                    <span className="font-medium break-words text-right">{quota.usedProducts} / {quota.maxProducts === null ? '∞' : quota.maxProducts}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: quota.maxProducts === null
                          ? '0%'
                          : `${Math.min(100, (quota.usedProducts / quota.maxProducts) * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Remaining: {typeof quota.remainingProducts === 'string' ? quota.remainingProducts : quota.remainingProducts}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to load quota</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
