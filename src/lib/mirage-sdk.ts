export type AssetCode = string;

export interface ShieldedBalance {
  asset: AssetCode
  amount: string
  usdEstimate: number
}

export interface OpenOrder {
  id: string
  pair: string
  side: 'buy' | 'sell'
  price: string
  amount: string
  filled: string
  createdAt: number
  base: string
  quote: string
}

export type OrderSide = 'buy' | 'sell'

export interface PlaceOrderParams {
  base: string
  quote: string
  side: OrderSide
  price: string
  amount: string
}

export type TxResult = any;

export interface MirageSdk {
  getShieldedBalances: () => Promise<ShieldedBalance[]>
  getOpenOrders: () => Promise<OpenOrder[]>
  placeOrder: (params: PlaceOrderParams) => Promise<boolean>
  cancelOrder: (id: string) => Promise<boolean>
  deposit: (params: any) => Promise<boolean>
  withdraw: (params: any) => Promise<boolean>
  transfer: (params: any) => Promise<boolean>
}

export function createMirageSdk(): MirageSdk {
  return {
    getShieldedBalances: async () => [
      { asset: 'STRK', amount: '1000', usdEstimate: 500 },
      { asset: 'USDC', amount: '2500.50', usdEstimate: 2500.50 },
    ],
    getOpenOrders: async () => [],
    placeOrder: async () => true,
    cancelOrder: async () => true,
    deposit: async () => true,
    withdraw: async () => true,
    transfer: async () => true,
  }
}
