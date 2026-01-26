import { request } from './request'
import { 
  GetNonceResponse, 
  VerifyWalletRequest, 
  VerifyWalletResponse, 
  AuthMeResponse,
} from '@/types/auth'

export const authApi = {
  getNonce: (address: string) => {
    const endpoint = `/auth/nonce?address=${encodeURIComponent(address)}`
    return request<GetNonceResponse>(endpoint)
  },

  verifyWallet: (data: VerifyWalletRequest) => {
    const endpoint = '/auth/verify'
    const method = 'POST'
    const body = JSON.stringify(data)
    return request<VerifyWalletResponse>(endpoint, { method, body })
  },

  getMe: () => {
    const endpoint = '/auth/me'
    return request<AuthMeResponse>(endpoint)
  },

  logout: () => {
    const endpoint = '/auth/logout'
    const method = 'POST'
    return request<{ message: string }>(endpoint, { method })
  },
}
