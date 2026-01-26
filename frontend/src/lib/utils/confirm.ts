"use client"

let globalConfirm: ((message: string) => Promise<boolean>) | null = null

export function setGlobalConfirm(confirm: typeof globalConfirm) {
  globalConfirm = confirm
}

export function confirm(message: string): Promise<boolean> {
  if (globalConfirm) {
    return globalConfirm(message)
  } else {
    return Promise.resolve(window.confirm(message))
  }
}
