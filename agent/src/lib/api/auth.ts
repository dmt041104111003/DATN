import { request } from './request'
import { 
  GetNonceResponse, 
  VerifyWalletRequest, 
  VerifyWalletResponse, 
  AuthMeResponse,
} from '@/types/auth'

export const authApi = {
  getNonce: (address: string) => {
    const endpoint = `/agent/auth/nonce?address=${encodeURIComponent(address)}`
    return request<GetNonceResponse>(endpoint)
  },

  verifyWallet: (data: VerifyWalletRequest) => {
    const endpoint = '/agent/auth/verify'
    const method = 'POST'
    const body = JSON.stringify(data)
    return request<VerifyWalletResponse>(endpoint, { method, body })
  },

  getMe: () => {
    const endpoint = '/enterprise/auth/me'
    return request<AuthMeResponse>(endpoint)
  },

  logout: () => {
    const endpoint = '/enterprise/auth/logout'
    const method = 'POST'
    return request<{ message: string }>(endpoint, { method })
  },
}
