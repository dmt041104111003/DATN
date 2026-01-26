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

export interface GetNonceResponse {
  nonce: string
}

export interface VerifyWalletRequest {
  address: string
  signature: string
  key: string
  walletName: string
}

export interface VerifyWalletResponse {
  user: User
}

export interface AuthMeResponse {
  user: User
}
