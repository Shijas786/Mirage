import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createMirageSdk } from '../lib/mirage-sdk'
import type { OpenOrder, ShieldedBalance, MirageSdk } from '../lib/mirage-sdk'
import { useWallet } from './useWallet'

interface MirageContextValue {
  sdk: MirageSdk
  balances: ShieldedBalance[]
  orders: OpenOrder[]
  loadingBalances: boolean
  loadingOrders: boolean
  receiveCode: string | null
  identityReady: boolean
  refreshBalances: () => Promise<void>
  refreshOrders: () => Promise<void>
}

const MirageContext = createContext<MirageContextValue | null>(null)

export function MirageProvider({ children }: { children: ReactNode }) {
  const sdkRef = useRef<MirageSdk>(createMirageSdk())
  const sdk = sdkRef.current
  const { address, status } = useWallet()

  const [balances, setBalances] = useState<ShieldedBalance[]>([])
  const [orders, setOrders] = useState<OpenOrder[]>([])
  const [loadingBalances, setLoadingBalances] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [receiveCode, setReceiveCode] = useState<string | null>(null)
  const [identityReady, setIdentityReady] = useState(false)

  const refreshBalances = useCallback(async () => {
    setLoadingBalances(true)
    try {
      setBalances(await sdk.getShieldedBalances())
    } finally {
      setLoadingBalances(false)
    }
  }, [sdk])

  const refreshOrders = useCallback(async () => {
    setLoadingOrders(true)
    try {
      setOrders(await sdk.getOpenOrders())
    } finally {
      setLoadingOrders(false)
    }
  }, [sdk])

  useEffect(() => {
    void refreshOrders()
  }, [refreshOrders])

  useEffect(() => {
    if (status !== 'connected' || !address) {
      setIdentityReady(false)
      setReceiveCode(null)
      setBalances([])
      setLoadingBalances(false)
      return
    }

    setIdentityReady(true)
    setReceiveCode("MOCK_RECEIVE_CODE_123")
    void refreshBalances()
    void refreshOrders()
  }, [address, status, refreshBalances, refreshOrders])

  const value = useMemo<MirageContextValue>(
    () => ({
      sdk,
      balances,
      orders,
      loadingBalances,
      loadingOrders,
      receiveCode,
      identityReady,
      refreshBalances,
      refreshOrders,
    }),
    [sdk, balances, orders, loadingBalances, loadingOrders, receiveCode, identityReady, refreshBalances, refreshOrders],
  )

  return <MirageContext.Provider value={value}>{children}</MirageContext.Provider>
}

export function useMirage(): MirageContextValue {
  const ctx = useContext(MirageContext)
  if (!ctx) throw new Error('useMirage must be used within a MirageProvider')
  return ctx
}
