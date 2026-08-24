import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createStore } from '@starknet-io/get-starknet-discovery'
import { RpcProvider, WalletAccountV6 } from 'starknet'
import type { StarknetWindowObject } from '@starknet-io/types-js'

export type WalletStatus =
  | 'checking'
  | 'not-installed'
  | 'disconnected'
  | 'connecting'
  | 'connected'

export interface WalletState {
  status: WalletStatus
  address: string | null
  network: string | null
  isTestnet: boolean
  installed: boolean
  error: string | null
  account: WalletAccountV6 | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletState | null>(null)
const walletStore = createStore()

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>('checking')
  const [address, setAddress] = useState<string | null>(null)
  const [account, setAccount] = useState<WalletAccountV6 | null>(null)
  const [isInstalled, setIsInstalled] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if any wallets are available
    const wallets = walletStore.getWallets()
    if (wallets.length === 0) {
      // Sometimes takes a tick to populate
      setTimeout(() => {
        if (walletStore.getWallets().length === 0) {
          setIsInstalled(false)
          setStatus('not-installed')
        } else {
          setStatus('disconnected')
        }
      }, 500)
    } else {
      setStatus('disconnected')
    }
  }, [])

  const connect = useCallback(async () => {
    setError(null)
    setStatus('connecting')
    try {
      const wallets = walletStore.getWallets()
      if (wallets.length === 0) {
        throw new Error('No Starknet wallet found')
      }
      
      // Prefer Argent X if available, otherwise take the first one
      let selectedWallet = wallets.find(w => (w as any).id === 'argentX' || w.name.includes('Argent')) || wallets[0]
      
      // For some reason types might not perfectly align with window object, but standard requires .request
      const swObject = selectedWallet as unknown as StarknetWindowObject
      
      // Request connection
      const accounts = await swObject.request({ type: 'wallet_requestAccounts' })
      if (!accounts || accounts.length === 0) {
        throw new Error('User rejected connection or no accounts found')
      }

      const userAddress = accounts[0]
      setAddress(userAddress)

      // Instantiate a WalletAccountV6 (required for STRK20 support)
      // NodeURL can be provided via environment variable or default to public Sepolia RPC
      const provider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_7" })
      
      const walletAccount = new WalletAccountV6({
        provider,
        walletProvider: swObject as any,
        address: userAddress,
      })
      
      setAccount(walletAccount)

      setStatus('connected')
    } catch (err: any) {
      console.error('Wallet connection failed:', err)
      setError(err?.message || 'Connection failed')
      setStatus('disconnected')
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setAccount(null)
    setError(null)
    setStatus('disconnected')
  }, [])

  const value = useMemo<WalletState>(
    () => ({
      status,
      address,
      network: 'SEPOLIA',
      isTestnet: true,
      installed: isInstalled,
      error,
      account,
      connect,
      disconnect,
    }),
    [status, address, isInstalled, error, account, connect, disconnect],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider')
  return ctx
}
