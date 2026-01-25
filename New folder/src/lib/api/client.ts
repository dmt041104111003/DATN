const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

async function request<T>(endpoint: string, method: string, body?: unknown): Promise<T> {
  const headers: any = { "Content-Type": "application/json" }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    credentials: "include",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

export const httpClient = {
  get: <T>(e: string) => request<T>(e, "GET"),
  post: <T>(e: string, b?: unknown) => request<T>(e, "POST", b),
  patch: <T>(e: string, b?: unknown) => request<T>(e, "PATCH", b),
  delete: <T>(e: string) => request<T>(e, "DELETE"),
}
