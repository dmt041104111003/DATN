"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Feedback } from '@/types/api'
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

export function ProductFeedbacks({ productId, feedbacks, onRefresh }: { productId: string; feedbacks: Feedback[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ content: string; rating?: number }>()

  const onSubmit = async (data: { content: string; rating?: number }) => {
    try {
      await apiClient.feedbacks.create({ ...data, productId, rating: data.rating || 0 })
      setOpen(false)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create feedback')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback?')) return
    try {
      await apiClient.feedbacks.remove(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Feedbacks</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Feedback</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Content</Label>
                  <Input {...register('content', { required: true })} placeholder="Enter feedback content..." />
                </div>
                <div className="grid gap-2">
                  <Label>Rating (Optional, 0-5)</Label>
                  <Input type="number" min="0" max="5" {...register('rating', { valueAsNumber: true })} placeholder="0-5" />
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
          {feedbacks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedbacks</p>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm break-words">{feedback.content}</p>
                  {feedback.rating !== undefined && (
                    <p className="text-xs text-muted-foreground">Rating: {feedback.rating}/5</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(feedback.id)} className="w-full sm:w-auto shrink-0">Delete</Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
