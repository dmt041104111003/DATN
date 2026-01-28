"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { setGlobalConfirm } from '@/lib/utils/confirm'

interface ConfirmContextType {
  confirm: (message: string) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((msg: string): Promise<boolean> => {
    return new Promise((res) => {
      setMessage(msg)
      setResolve(() => res)
      setOpen(true)
    })
  }, [])

  useEffect(() => {
    setGlobalConfirm(confirm)
    return () => setGlobalConfirm(null)
  }, [confirm])

  const handleConfirm = () => {
    if (resolve) {
      resolve(true)
      setResolve(null)
    }
    setOpen(false)
  }

  const handleCancel = () => {
    if (resolve) {
      resolve(false)
      setResolve(null)
    }
    setOpen(false)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCancel()
        }
      }}>
        <DialogContent className="max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>Confirmation</DialogTitle>
          </DialogHeader>
          <div className="px-4 sm:px-6 py-4 min-w-0">
            <p className="text-sm text-muted-foreground whitespace-pre-line break-words">
              {message}
            </p>
          </div>
          <DialogFooter className="flex-shrink-0 gap-2 flex-wrap sm:flex-nowrap">
            <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-initial">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1 sm:flex-initial">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context
}
