"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { SiteHeader } from "@/components/header"
import { SiteFooter } from "@/components/footer"
import { batchRepository } from "@/lib/api/batch.repository"
import { JourneyFlow } from "@/components/trace/journey-flow"
import type { TraceBatchResult } from "@/types"

export default function TracePage() {
  const searchParams = useSearchParams()
  const [policyId, setPolicyId] = useState("")
  const [assetName, setAssetName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<TraceBatchResult | null>(null)

  useEffect(() => {
    const urlPolicyId = searchParams.get("policyId")
    const urlAssetName = searchParams.get("assetName")
    if (urlPolicyId) setPolicyId(urlPolicyId)
    if (urlAssetName) setAssetName(urlAssetName)
    if (urlPolicyId && urlAssetName) {
      handleSearch(urlPolicyId, urlAssetName)
    }
  }, [searchParams])

  const handleSearch = async (pid?: string, aname?: string) => {
    const searchPolicyId = pid || policyId
    const searchAssetName = aname || assetName

    if (!searchPolicyId.trim() || !searchAssetName.trim()) {
      setError("Please enter both Policy ID and Asset Name")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const data = await batchRepository.trace(searchPolicyId.trim(), searchAssetName.trim())
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product not found")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSearch()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Product Traceability
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter product information to view supply chain journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  placeholder="Policy ID"
                  className="flex-1 h-11 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Asset Name"
                  className="flex-1 h-11 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-6 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-lg">search</span>
                  {loading ? "Tracing..." : "Trace"}
                </button>
              </div>

              {error && (
                <div className="mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  <span className="material-icons text-sm">error</span>
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading && (
            <div className="max-w-5xl mx-auto">
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          )}

          {result && (
            <div className="max-w-6xl mx-auto">
              <JourneyFlow 
                roadmap={result.roadmap} 
                batch={result.batch} 
                product={result.product} 
                business={result.business}
                blockchain={result.blockchain} 
              />
            </div>
          )}

          {!loading && !result && (
            <div className="max-w-md mx-auto text-center py-16">
              <h3 className="font-semibold mb-2">Enter information to trace</h3>
              <p className="text-sm text-muted-foreground">
                Scan QR code or enter Policy ID and Asset Name
              </p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
