"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { LoadingOverlay } from '@/components/ui/loading'

export function ProductProcesses({ productId, processes, onRefresh }: { productId: string; processes: ProductionProcess[]; onRefresh: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewingProcess, setViewingProcess] = useState<ProductionProcess | null>(null)
  const [editing, setEditing] = useState<ProductionProcess | null>(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{ stepName: string; startTime: string; endTime?: string; location?: string }>()

  const onSubmit = async (data: { stepName: string; startTime: string; endTime?: string; location?: string }) => {
    setLoading(true)
    try {
      if (editing) {
        await apiClient.productionProcesses.update(editing.id, data)
      } else {
        await apiClient.productionProcesses.create({ ...data, productId })
      }
      setOpen(false)
      setEditing(null)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save process')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (process: ProductionProcess) => {
    setEditing(process)
    setValue('stepName', process.stepName)
    const startTime = new Date(process.startTime)
    setValue('startTime', startTime.toISOString().slice(0, 16))
    if (process.endTime) {
      const endTime = new Date(process.endTime)
      setValue('endTime', endTime.toISOString().slice(0, 16))
    } else {
      setValue('endTime', '')
    }
    setValue('location', process.location || '')
    setOpen(true)
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

  const handleCreate = () => {
    setEditing(null)
    reset()
    setOpen(true)
  }

  const handleView = (process: ProductionProcess) => {
    setViewingProcess(process)
    setViewOpen(true)
  }

  const startTime = watch('startTime')
  const endTime = watch('endTime')

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Production Processes</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            {loading && <LoadingOverlay />}
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Process Step</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                <div className="grid gap-2">
                  <Label>Step Name *</Label>
                  <Input 
                    {...register('stepName', { required: 'Please enter step name' })} 
                    placeholder="e.g. Harvesting, Processing, Packaging" 
                    disabled={loading}
                  />
                  {errors.stepName && (
                    <p className="text-sm text-destructive">{errors.stepName.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Start Time *</Label>
                  <Input 
                    type="datetime-local" 
                    {...register('startTime', { required: 'Vui lòng chọn thời gian bắt đầu' })} 
                    disabled={loading}
                  />
                  {errors.startTime && (
                    <p className="text-sm text-destructive">{errors.startTime.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>End Time (Optional)</Label>
                  <Input 
                    type="datetime-local" 
                    {...register('endTime', {
                      validate: (value) => {
                        if (!value) return true
                        if (!startTime) return true
                        if (new Date(value) <= new Date(startTime)) {
                          return 'End time must be after start time'
                        }
                        return true
                      }
                    })} 
                    disabled={loading}
                  />
                  {errors.endTime && (
                    <p className="text-sm text-destructive">{errors.endTime.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Location (Optional)</Label>
                  <Input {...register('location')} placeholder="e.g. Factory A, Warehouse B" disabled={loading} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setOpen(false)
                  setEditing(null)
                  reset()
                }} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Processing...' : editing ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingProcess?.stepName || 'Process Details'}</DialogTitle>
              <DialogDescription>
                View production process information
              </DialogDescription>
            </DialogHeader>
            {viewingProcess && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Step Name</Label>
                  <p className="text-sm">{viewingProcess.stepName}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Start Time</Label>
                  <p className="text-sm">{new Date(viewingProcess.startTime).toLocaleString()}</p>
                </div>
                {viewingProcess.endTime && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">End Time</Label>
                    <p className="text-sm">{new Date(viewingProcess.endTime).toLocaleString()}</p>
                  </div>
                )}
                {viewingProcess.location && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm">{viewingProcess.location}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Created At</Label>
                  <p className="text-sm">{new Date(viewingProcess.createdAt).toLocaleString()}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Updated At</Label>
                  <p className="text-sm">{new Date(viewingProcess.updatedAt).toLocaleString()}</p>
                </div>
                {viewingProcess.endTime && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm">
                      {Math.round((new Date(viewingProcess.endTime).getTime() - new Date(viewingProcess.startTime).getTime()) / (1000 * 60 * 60))} hours
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {processes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No processes</p>
        ) : (
          <>
            <div className="hidden md:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Step Name</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processes.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">{process.stepName}</TableCell>
                      <TableCell>{new Date(process.startTime).toLocaleString()}</TableCell>
                      <TableCell>{process.endTime ? new Date(process.endTime).toLocaleString() : '-'}</TableCell>
                      <TableCell>{process.location || '-'}</TableCell>
                      <TableCell className="text-right">
                        <ActionsDropdown
                          onView={() => handleView(process)}
                          onEdit={() => handleEdit(process)}
                          onDelete={() => handleDelete(process.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-2">
              {processes.map((process) => (
                <div key={process.id} className="flex flex-col gap-2 p-2 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{process.stepName}</p>
                    <p className="text-xs text-muted-foreground break-words">
                      {new Date(process.startTime).toLocaleString()}
                      {process.endTime && ` - ${new Date(process.endTime).toLocaleString()}`}
                      {process.location && ` | ${process.location}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleView(process)} className="flex-1">View</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(process)} className="flex-1">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(process.id)} className="flex-1 text-destructive hover:text-destructive">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
