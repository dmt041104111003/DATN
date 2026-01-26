const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const REQUEST_TIMEOUT = 10000

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  
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
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      const errorMessage = error.message || `HTTP error! status: ${response.status}`
      if (response.status === 404) {
        throw new Error('404 - Page Not Found')
      }
      throw new Error(errorMessage)
    }

    return response.json()
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
