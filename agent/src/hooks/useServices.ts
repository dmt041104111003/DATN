import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BrowserWallet } from '@meshsdk/core'
import { servicesApi } from '@/lib/api/services'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import { contractApi } from '@/lib/api/contract'
import { Service, Subscription } from '@/types/subscription'
import { useAuth } from '@/contexts/auth-context'
import { showAlert } from '@/lib/utils/alert'

interface UtxoAmount {
  unit: string
  quantity: string
}

interface UtxoOutput {
  amount: UtxoAmount[]
}

interface Utxo {
  output: UtxoOutput
}

export function useServices() {
  const router = useRouter()
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadData = async () => {
    try {
      const [servicesData, subsData] = await Promise.all([
        servicesApi.findAll(),
        subscriptionsApi.findAll()
      ])
      setServices(servicesData || [])
      setSubscriptions(subsData || [])
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [user, router])

  const checkWalletBalance = async (walletInstance: BrowserWallet, requiredAmountADA: number): Promise<boolean> => {
    try {
      const utxos = await walletInstance.getUtxos() as Utxo[]
      let totalLovelace = BigInt(0)
      
      for (const utxo of utxos) {
        const lovelace = utxo.output.amount.find((a) => a.unit === 'lovelace')
        if (lovelace) {
          totalLovelace += BigInt(lovelace.quantity)
        }
      }
      
      const totalADA = Number(totalLovelace) / 1_000_000
      const requiredAmount = requiredAmountADA + 0.2
      
      return totalADA >= requiredAmount
    } catch {
      return false
    }
  }

  const handleSubscribe = async (serviceId: string) => {
    if (!user?.address) {
      router.push('/login')
      return
    }

    const service = services.find(s => s.id === serviceId)
    if (!service) return

    setProcessing(serviceId)
    try {
      if (!user.walletName) {
        throw new Error('Wallet not found. Please login again.')
      }

      const { BrowserWallet } = await import('@meshsdk/core')
      const walletInstance = await BrowserWallet.enable(user.walletName)

      const hasEnoughBalance = await checkWalletBalance(walletInstance, service.price)
      if (!hasEnoughBalance) {
        throw new Error('Insufficient balance. Please add more ADA to your wallet.')
      }

      const amountLovelace = (service.price * 1_000_000).toString()
      const paymentResponse = await contractApi.payment(user.address, amountLovelace)
      if (!paymentResponse.result) {
        throw new Error(paymentResponse.message)
      }

      const signedTx = await walletInstance.signTx(paymentResponse.data)
      const txHash = await walletInstance.submitTx(signedTx)
      
      const payResponse = await subscriptionsApi.pay({
        servicePlanId: serviceId,
        txHash
      })

      if (!payResponse.result) {
        throw new Error(payResponse.message || 'Payment verification failed')
      }

      if (payResponse.data?.subscription?.status === 'pending') {
        showAlert({ description: payResponse.message || 'Transaction submitted. Verification in progress...', variant: 'success' })
        await loadData()
        
        const subscriptionId = payResponse.data.subscription.id
        let checkCount = 0
        const maxChecks = 20
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        
        pollingIntervalRef.current = setInterval(async () => {
          try {
            checkCount++
            const subs = await subscriptionsApi.findAll()
            const sub = subs.find(s => s.id === subscriptionId)
            
            await loadData()
            
            if (sub && sub.status !== 'pending') {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }
              if (sub.status === 'active') {
                showAlert({ description: 'Payment verified! Subscription activated.', variant: 'success' })
                router.push('/dashboard/billing/subscriptions')
              } else if (sub.status === 'cancelled' || sub.status === 'expired') {
                showAlert({ description: 'Payment verification failed.', variant: 'error' })
              }
              return
            }
            
            if (checkCount >= maxChecks) {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }
            }
          } catch (err) {
            console.error('Error checking subscription status:', err)
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
          }
        }, 2000)
      } else {
        showAlert({ description: payResponse.message || 'Payment verified! Subscription activated.', variant: 'success' })
        await loadData()
        router.push('/dashboard/billing/subscriptions')
      }
    } catch (err) {
      const isCancelled = err instanceof Error && 
        ['declined', 'rejected', 'cancelled', 'User'].some(s => err.message.includes(s))
      if (!isCancelled) {
        showAlert({ description: err instanceof Error ? err.message : 'Failed to subscribe', variant: 'error' })
      }
    } finally {
      setProcessing(null)
    }
  }

  return {
    items: services,
    subscriptions,
    loading,
    processing,
    handleSubscribe,
  }
}
