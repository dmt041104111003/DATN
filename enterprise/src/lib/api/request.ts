const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const DEFAULT_REQUEST_TIMEOUT = 10000

export type RequestOptions = RequestInit & {
  timeoutMs?: number
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  const isFormData = options.body instanceof FormData
  const headers: HeadersInit = isFormData 
    ? { ...options.headers }
    : { 'Content-Type': 'application/json', ...options.headers }
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
      credentials: 'include',
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      const error = text ? (() => { try { return JSON.parse(text) } catch { return { message: text } } })() : { message: 'Request failed' }
      const errorMessage = (error as any)?.message || `HTTP error! status: ${response.status}`
      if (response.status === 404) {
        throw new Error('404 - Page Not Found')
      }
      throw new Error(errorMessage)
    }

    if (response.status === 204) return undefined as T
    const text = await response.text().catch(() => '')
    if (!text) return undefined as T
    try {
      return JSON.parse(text) as T
    } catch {
      return text as unknown as T
    }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`)
    }
    throw err
  }
}
