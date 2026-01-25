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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ stepName: string; startTime: string; endTime?: string; location?: string }>()

  const onSubmit = async (data: { stepName: string; startTime: string; endTime?: string; location?: string }) => {
    setLoading(true)
    try {
      await apiClient.productionProcesses.create({ ...data, productId })
      setOpen(false)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create process')
    } finally {
      setLoading(false)
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
            {loading && <LoadingOverlay />}
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Process Step</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                <div className="grid gap-2">
                  <Label>Step Name</Label>
                  <Input {...register('stepName', { required: true })} placeholder="e.g. Harvesting, Processing, Packaging" disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <Label>Start Time</Label>
                  <Input type="datetime-local" {...register('startTime', { required: true })} disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <Label>End Time (Optional)</Label>
                  <Input type="datetime-local" {...register('endTime')} disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <Label>Location (Optional)</Label>
                  <Input {...register('location')} placeholder="e.g. Factory A, Warehouse B" disabled={loading} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Add'}</Button>
              </DialogFooter>
            </form>
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
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(process.id)} className="w-full text-destructive hover:text-destructive">Delete</Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
