const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface GetNonceResponse {
  nonce: string
}

interface VerifyWalletRequest {
  address: string
  signature: string
  key: string
}

interface VerifyWalletResponse {
  user: {
    id: string
    address: string
  }
}

interface LogoutResponse {
  message: string
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }

      return response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend at ${this.baseUrl}. Please ensure the backend server is running.`)
      }
      throw err
    }
  }

  async getNonce(address: string): Promise<GetNonceResponse> {
    return this.request<GetNonceResponse>(`/auth/nonce?address=${encodeURIComponent(address)}`)
  }

  async verifyWallet(data: VerifyWalletRequest): Promise<VerifyWalletResponse> {
    return this.request<VerifyWalletResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<LogoutResponse> {
    return this.request<LogoutResponse>('/auth/logout', {
      method: 'POST',
    })
  }
}

export const apiClient = new ApiClient()
