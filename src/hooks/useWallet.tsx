import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

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
  account: any | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletState | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>('disconnected')
  const [address, setAddress] = useState<string | null>(null)
  const [account, setAccount] = useState<any | null>(null)

  const connect = useCallback(async () => {
    setStatus('connecting')
    try {
      // MOCK STARKNET CONNECTION FOR UI SHELL
      setTimeout(() => {
        const mockAddress = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        setAddress(mockAddress)
        setAccount({
          address: mockAddress,
          strk20InvokeTransaction: async (actions: any[]) => {
            console.log("Mock STRK20 transaction execution", actions);
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { transaction_hash: "0xMockTransactionHash456" };
          }
        });
        setStatus('connected')
      }, 500)
    } catch (err) {
      setStatus('disconnected')
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setAccount(null)
    setStatus('disconnected')
  }, [])

  const value = useMemo<WalletState>(
    () => ({
      status,
      address,
      network: 'SEPOLIA',
      isTestnet: true,
      installed: true,
      error: null,
      account,
      connect,
      disconnect,
    }),
    [status, address, account, connect, disconnect],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider')
  return ctx
}
