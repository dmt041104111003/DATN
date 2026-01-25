export interface User {
  id: string
  address: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
}
