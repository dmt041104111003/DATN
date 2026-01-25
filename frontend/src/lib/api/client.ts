import { request } from './request'
import { GetNonceResponse, VerifyWalletRequest, VerifyWalletResponse, AuthMeResponse } from '@/types/api'

export const apiClient = {
  getNonce: (address: string) => request<GetNonceResponse>(`/auth/nonce?address=${encodeURIComponent(address)}`),
  verifyWallet: (data: VerifyWalletRequest) => request<VerifyWalletResponse>('/auth/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => request<AuthMeResponse>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
}
