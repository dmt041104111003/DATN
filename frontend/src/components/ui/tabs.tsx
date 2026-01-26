"use client"

import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react'
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
          .tabs-list {
            position: relative;
            display: flex;
            gap: 1.5rem;
            width: 100%;
            padding: 0;
            border-bottom: 1px solid #e4e4e7;
            border-radius: 0;
          }

          .tabs-trigger {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            max-width: fit-content;
            height: 3rem;
            padding: 0 0.5rem;
            cursor: pointer;
            background: transparent;
            border: none;
            color: #71717a;
            font-size: 0.875rem;
            font-weight: 400;
            transition: color 0.2s ease;
            outline: none;
          }

          .tabs-trigger:hover {
            color: #3d405b;
          }

          .tabs-trigger[data-disabled="true"] {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
          }

          .tabs-trigger[data-selected="true"] {
            color: #3d405b;
            font-weight: 500;
          }

          .tabs-cursor {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 2px;
            background-color: #3d405b;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 2px 2px 0 0;
          }
        `
      }} />
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div className={cn("flex w-full flex-col", className)}>
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
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsList must be used within Tabs')
  }

  const { value: activeValue } = context
  const listRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const [cursorStyle, setCursorStyle] = useState({ width: 0, left: 0 })

  useEffect(() => {
    const updateCursor = () => {
      if (!listRef.current || !cursorRef.current) return

      const activeTrigger = listRef.current.querySelector(`.tabs-trigger[data-selected="true"]`) as HTMLElement
      if (!activeTrigger) return

      const listRect = listRef.current.getBoundingClientRect()
      const triggerRect = activeTrigger.getBoundingClientRect()
      const left = triggerRect.left - listRect.left
      const width = triggerRect.width

      setCursorStyle({ width, left })
    }

    updateCursor()
    
    const resizeObserver = new ResizeObserver(updateCursor)
    if (listRef.current) {
      resizeObserver.observe(listRef.current)
    }

    window.addEventListener('resize', updateCursor)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateCursor)
    }
  }, [activeValue, children])
  
  return (
    <div ref={listRef} className={cn("tabs-list", className)}>
      {children}
      <span 
        ref={cursorRef}
        className="tabs-cursor"
        style={{
          width: `${cursorStyle.width}px`,
          transform: `translateX(${cursorStyle.left}px)`,
        }}
      />
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs')
  }

  const { value: activeValue, onValueChange } = context
  const isActive = activeValue === value

  return (
    <button
      type="button"
      className={cn("tabs-trigger", className)}
      data-selected={isActive}
      data-disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      disabled={disabled}
    >
      {children}
    </button>
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
