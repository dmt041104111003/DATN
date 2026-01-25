import { User } from './auth'

export interface GetNonceResponse {
  nonce: string
}

export interface VerifyWalletRequest {
  address: string
  signature: string
  key: string
}

export interface VerifyWalletResponse {
  user: User
}

export interface AuthMeResponse {
  user: User
}
