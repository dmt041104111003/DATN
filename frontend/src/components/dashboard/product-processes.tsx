"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { ProductionProcess } from '@/types/api'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'

export function ProductProcesses({ productId, processes, onRefresh }: { productId: string; processes: ProductionProcess[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ stepName: string; startTime: string; endTime?: string; location?: string }>()

  const onSubmit = async (data: { stepName: string; startTime: string; endTime?: string; location?: string }) => {
    try {
      await apiClient.productionProcesses.create({ ...data, productId })
      setOpen(false)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create process')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this process?')) return
    try {
      await apiClient.productionProcesses.remove(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Production Processes</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Process Step</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Step Name</Label>
                  <Input {...register('stepName', { required: true })} placeholder="e.g. Harvesting, Processing, Packaging" />
                </div>
                <div className="grid gap-2">
                  <Label>Start Time</Label>
                  <Input type="datetime-local" {...register('startTime', { required: true })} />
                </div>
                <div className="grid gap-2">
                  <Label>End Time (Optional)</Label>
                  <Input type="datetime-local" {...register('endTime')} />
                </div>
                <div className="grid gap-2">
                  <Label>Location (Optional)</Label>
                  <Input {...register('location')} placeholder="e.g. Factory A, Warehouse B" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {processes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No processes</p>
          ) : (
            processes.map((process) => (
              <div key={process.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{process.stepName}</p>
                  <p className="text-xs text-muted-foreground break-words">
                    {new Date(process.startTime).toLocaleString()}
                    {process.endTime && ` - ${new Date(process.endTime).toLocaleString()}`}
                    {process.location && ` | ${process.location}`}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(process.id)} className="w-full sm:w-auto shrink-0">Delete</Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
