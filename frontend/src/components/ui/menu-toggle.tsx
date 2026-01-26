"use client"

import { useEffect, useId } from 'react'
import { cn } from '@/lib/utils'

interface MenuToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function MenuToggle({ checked, onCheckedChange, className }: MenuToggleProps) {
  const id = useId()
  const checkboxId = `menu-toggle-check-${id}`

  useEffect(() => {
    const styleId = 'menu-toggle-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .menu-toggle-icon {
        --gap: 5px;
        --height-bar: 2.5px;
        --pos-y-bar-one: 0;
        --pos-y-bar-three: 0;
        --scale-bar: 1;
        --rotate-bar-one: 0;
        --rotate-bar-three: 0;
        width: 25px;
        display: flex;
        flex-direction: column;
        gap: var(--gap);
        cursor: pointer;
        position: relative;
      }

      .menu-toggle-bar {
        position: relative;
        height: var(--height-bar);
        width: 100%;
        border-radius: 0.5rem;
        background-color: #000000;
      }

      .menu-toggle-bar-1 {
        top: var(--pos-y-bar-one);
        transform: rotate(var(--rotate-bar-one));
        transition: top 200ms 100ms, transform 100ms;
      }

      .menu-toggle-bar-2 {
        transform: scaleX(var(--scale-bar));
        transition: transform 150ms 100ms;
      }

      .menu-toggle-bar-3 {
        bottom: var(--pos-y-bar-three);
        transform: rotate(var(--rotate-bar-three));
        transition: bottom 200ms 100ms, transform 100ms;
      }

      .menu-toggle-check:checked + .menu-toggle-icon > .menu-toggle-bar-1 {
        transition: top 200ms, transform 200ms 100ms;
      }

      .menu-toggle-check:checked + .menu-toggle-icon > .menu-toggle-bar-3 {
        transition: bottom 200ms, transform 200ms 100ms;
      }

      .menu-toggle-check:checked + .menu-toggle-icon {
        --pos-y-bar-one: calc(var(--gap) + var(--height-bar));
        --pos-y-bar-three: calc(var(--gap) + var(--height-bar));
        --scale-bar: 0;
        --rotate-bar-one: 45deg;
        --rotate-bar-three: -45deg;
      }
    `
    document.head.appendChild(style)

    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  return (
    <div className={cn("inline-block", className)}>
      <input
        type="checkbox"
        id={checkboxId}
        name={checkboxId}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="hidden menu-toggle-check"
      />
      <label htmlFor={checkboxId} className="menu-toggle-icon cursor-pointer">
        <div className="menu-toggle-bar menu-toggle-bar-1"></div>
        <div className="menu-toggle-bar menu-toggle-bar-2"></div>
        <div className="menu-toggle-bar menu-toggle-bar-3"></div>
      </label>
    </div>
  )
}
