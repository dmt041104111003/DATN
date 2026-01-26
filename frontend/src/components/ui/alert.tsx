"use client"

import { ReactNode } from 'react'
import { Alert as HeroUIAlert } from '@heroui/alert'
import { cn } from '@/lib/utils'

interface AlertProps {
  title?: string
  description?: string
  children?: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
  onClose?: () => void
}

export function Alert({ title, description, children, variant = 'default', className, onClose }: AlertProps) {
  const colorMap: Record<typeof variant, 'default' | 'success' | 'warning' | 'danger'> = {
    default: 'default',
    success: 'success',
    warning: 'warning',
    error: 'danger',
  }

  return (
    <HeroUIAlert
      title={title}
      description={description}
      color={colorMap[variant]}
      variant="flat"
      isClosable={!!onClose}
      onClose={onClose}
      className={cn(className)}
    >
      {children}
    </HeroUIAlert>
  )
}
