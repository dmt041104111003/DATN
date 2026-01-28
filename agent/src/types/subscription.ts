export interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  maxProducts?: number | null
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  servicePlanId: string
  status: string
  startDate?: string
  endDate?: string
  amount: number
  currency: string
  txHash?: string
  paymentDate: string
  createdAt: string
  updatedAt: string
  service?: Service
}
