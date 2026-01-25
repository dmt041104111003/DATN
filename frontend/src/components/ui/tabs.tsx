"use client"

import { ReactNode, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .radio-inputs {
            position: relative;
            display: flex;
            border-radius: 0.5rem;
            background-color: #ffffff;
            box-sizing: border-box;
            font-size: 14px;
            width: 100%;
            padding: 1rem 1rem 0 1rem;
            gap: 0;
          }

          .radio-inputs .radio {
            flex: 1;
            display: flex;
          }

          .radio-inputs .radio input {
            display: none;
          }

          .radio-inputs .radio .name {
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            border: none;
            padding: 0.5rem 0.8rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            transform: translateY(0);
            color: #666;
            width: 100%;
          }

          .radio-inputs .radio input:checked + .name {
            background-color: #374151;
            color: #ffffff;
            font-weight: 600;
            transform: translateY(0);
          }
          .radio-inputs .radio input + .name:hover {
            color: #374151;
            transform: translateY(-1px);
          }
          .radio-inputs .radio input:checked + .name:hover {
            color: #ffffff;
            transform: translateY(0);
          }
        `
      }} />
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div className={className}>
          {children}
        </div>
      </TabsContext.Provider>
    </>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn("radio-inputs", className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs')
  }

  const { value: activeValue, onValueChange } = context
  const isActive = activeValue === value

  return (
    <label className="radio">
      <input
        type="radio"
        name="tabs"
        checked={isActive}
        onChange={() => onValueChange(value)}
      />
      <span className="name">
        {children}
      </span>
    </label>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsContent must be used within Tabs')
  }

  const { value: activeValue } = context
  if (activeValue !== value) {
    return null
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}
