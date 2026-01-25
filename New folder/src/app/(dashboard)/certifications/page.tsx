"use client"

import { useState } from "react"
import { useCertifications, useCreateCertification, useDeleteCertification } from "@/hooks/use-certifications"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { LoadingState } from "@/components/dashboard/loading-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { CertificationForm } from "@/components/certifications/certification-form"
import { CertificationList } from "@/components/certifications/certification-list"
import type { CreateCertificationInput } from "@/types"

export default function CertificationsPage() {
  const { data: certifications, isLoading, error, refetch } = useCertifications()
  const createCertification = useCreateCertification()
  const deleteCertification = useDeleteCertification()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateCertificationInput>({
    certName: "",
    issueDate: "",
    expiryDate: "",
    certHash: "",
  } as CreateCertificationInput)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.certName) {
      toast.error("Please enter certification name")
      return
    }

    if (!formData.issueDate) {
      toast.error("Please enter issue date")
      return
    }

    if (!formData.certHash) {
      toast.error("Please upload certificate document")
      return
    }

    try {
      await createCertification.mutateAsync(formData)
      toast.success("Certification created successfully")
      setFormData({ certName: "", issueDate: "", expiryDate: "", certHash: "" } as CreateCertificationInput)
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create certification")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certification?")) return

    try {
      await deleteCertification.mutateAsync(id)
      toast.success("Certification deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete certification")
    }
  }

  const handleAutoFill = () => {
    const sampleCertifications = [
      { certName: "VietGAP", yearsValid: 3 },
      { certName: "GlobalGAP", yearsValid: 3 },
      { certName: "ISO 22000", yearsValid: 3 },
      { certName: "HACCP", yearsValid: 2 },
      { certName: "Organic Certification", yearsValid: 1 },
      { certName: "Fair Trade", yearsValid: 2 },
      { certName: "Rainforest Alliance", yearsValid: 1 },
      { certName: "UTZ Certified", yearsValid: 1 },
    ]

    const randomCert = sampleCertifications[Math.floor(Math.random() * sampleCertifications.length)]
    
    // Calculate dates: issue date 6 months ago, expiry date based on validity period
    const today = new Date()
    const issueDate = new Date(today)
    issueDate.setMonth(issueDate.getMonth() - 6)
    
    const expiryDate = new Date(issueDate)
    expiryDate.setFullYear(expiryDate.getFullYear() + randomCert.yearsValid)

    // Format dates as YYYY-MM-DD for input type="date"
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }

    setFormData({
      certName: randomCert.certName,
      issueDate: formatDate(issueDate),
      expiryDate: formatDate(expiryDate),
      certHash: "", // File upload cannot be auto-filled
    })
    toast.success("Form auto-filled with sample data")
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader title="Certifications" description="Manage your certifications">
        <CertificationForm
          open={open}
          onOpenChange={setOpen}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          isPending={createCertification.isPending}
          onAutoFill={handleAutoFill}
        />
      </PageHeader>

      {!certifications?.length ? (
        <EmptyState
          icon="verified"
          message="No certifications yet"
          actionLabel="Add Certification"
          onAction={() => setOpen(true)}
        />
      ) : (
        <CertificationList
          certifications={certifications}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
