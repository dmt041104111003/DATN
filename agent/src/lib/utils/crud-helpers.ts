
export async function loadData<T>(
  apiCall: () => Promise<T[]>,
  setData: (data: T[]) => void,
  setLoading: (loading: boolean) => void
) {
  try {
    const data = await apiCall()
    setData(Array.isArray(data) ? data : [])
  } catch {
    setData([])
  } finally {
    setLoading(false)
  }
}

export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 16)
}

export function formatDateOnlyForInput(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export function formatDateDisplay(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}

export function formatDateTimeDisplay(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString()
}
