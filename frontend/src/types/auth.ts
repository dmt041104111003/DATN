export interface User {
  id: string
  address: string
  walletName?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
  refreshAuth: () => Promise<void>
}
