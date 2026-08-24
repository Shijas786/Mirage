// @ts-nocheck

export interface TokenMeta {
  code: string
  name: string
  icon: string
  decimals: number
  priceUsd: number
  sac?: string
  native?: boolean
  bridged?: boolean
  faucet?: boolean
}

export const CURATED_TOKENS: TokenMeta[] = [
  { code: 'STRK', name: 'Starknet Token', icon: 'STRK', decimals: 18, priceUsd: 0.5, sac: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', native: true },
  { code: 'USDC', name: 'USD Coin', icon: 'USDC', decimals: 6, priceUsd: 1, faucet: true,
    sac: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8' },
  { code: 'ETH', name: 'Ethereum', icon: 'ETH', decimals: 18, priceUsd: 3500, faucet: true,
    sac: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' },
]

export const TOKEN_CODES: string[] = CURATED_TOKENS.map((t) => t.code)

export const TOKEN_OPTIONS = CURATED_TOKENS.map((t) => ({ value: t.code, label: `${t.code} — ${t.name}` }))

export function assetMeta(code: string): TokenMeta {
  return CURATED_TOKENS.find(t => t.code === code) ?? { code, name: code, icon: code, decimals: 18, priceUsd: 0 }
}
export const BRIDGED_ASSET_CODES: string[] = [];
export function depositableTokens() { return []; }
export async function resolveCustomToken(s: string) { return {} as any; }
