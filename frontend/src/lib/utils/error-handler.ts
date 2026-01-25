import { useRouter } from 'next/navigation'

export function handleApiError(err: unknown, router?: ReturnType<typeof useRouter>): string {
  const errorMessage = err instanceof Error ? err.message : 'An error occurred'
  
  if (errorMessage.includes('expired') || errorMessage.includes('Subscription')) {
    const message = `${errorMessage}. Please renew your subscription to continue.`
    if (router) {
      alert(message)
      router.push('/dashboard/billing')
    }
    return message
  }
  
  if (errorMessage.includes('Not your') || errorMessage.includes('permission') || errorMessage.includes('Forbidden')) {
    return 'You do not have permission to perform this action.'
  }
  
  if (errorMessage.includes('not found') || errorMessage.includes('NotFound')) {
    return 'Item not found or has already been deleted.'
  }
  
  return errorMessage
}

export function isCancelledError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  return ['declined', 'rejected', 'cancelled', 'User'].some(s => err.message.includes(s))
}
