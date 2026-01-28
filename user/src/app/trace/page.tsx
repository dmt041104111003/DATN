"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TracePage() {
  const router = useRouter()
  const [policyId, setPolicyId] = useState('')
  const [assetName, setAssetName] = useState('')
  const [error, setError] = useState('')

  const handleTrace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!policyId.trim() || !assetName.trim()) {
      setError('Please enter both Policy ID and Asset Name')
      return
    }

    setError('')
    router.push(`/trace/${encodeURIComponent(policyId)}/${encodeURIComponent(assetName)}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">Trace Product</h1>
            <p className="text-muted-foreground">
              Enter the Policy ID and Asset Name to verify product authenticity and trace its origin
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrace} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="policyId">Policy ID</Label>
                  <Input
                    id="policyId"
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                    placeholder="Enter Policy ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetName">Asset Name</Label>
                  <Input
                    id="assetName"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="Enter Asset Name"
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Trace Product
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
