// @ts-nocheck

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { CURATED_TOKENS } from '../lib/tokens'
import { faucetMint } from '../lib/faucet'
import { truncateKey } from '../lib/format'
import { CoinBadge } from './BrandIcons'
import { Button, CyberCard, PageIntro, SparklesIcon } from './ui'
import { ConnectWallet } from './ConnectWallet'

const FAUCET_TOKENS = CURATED_TOKENS.filter((t) => t.faucet && t.sac)
const DRIP = 1000

/** Testnet faucet: mint mock tokens (USDC/ETH/BTC/XRP) to the connected wallet. */
export function Faucet() {
  const wallet = useWallet()
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<Record<string, string>>({})
  const connected = wallet.status === 'connected'

  async function mint(code: string, sac: string, decimals: number) {
    setBusy(code)
    setMsg((m) => ({ ...m, [code]: '' }))
    try {
      const hash = await faucetMint(sac, BigInt(DRIP) * 10n ** BigInt(decimals))
      setMsg((m) => ({ ...m, [code]: `✓ Minted ${DRIP.toLocaleString()} ${code} · ${truncateKey(hash, 6, 6)}` }))
    } catch (e) {
      setMsg((m) => ({ ...m, [code]: e instanceof Error ? e.message : 'Mint failed.' }))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[500px] px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <Link
          to="/app"
          className="coord-label flex items-center gap-1.5 text-mist-400 transition hover:text-mist-200"
        >
          <span>← Back to Vault Hub</span>
        </Link>
        <ConnectWallet />
      </header>

      <CyberCard
        className="p-6"
        title="Testnet Faucet Dispenser"
        tag="Starknet Sepolia"
        icon={<SparklesIcon className="h-4.5 w-4.5 text-cyan-400" />}
      >
        <p className="text-xs leading-relaxed text-zinc-400">
          Mint open testnet mock tokens directly to your connected Starknet account, then deposit them into the zero-knowledge privacy pool.
        </p>

        {!connected && (
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-ink-950/80 p-4 text-center text-xs text-zinc-400">
            Connect your Starknet wallet above to activate token dispensing.
          </div>
        )}

        <div className="mt-5 space-y-2.5">
          {FAUCET_TOKENS.map((t) => (
            <div
              key={t.code}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-ink-900/80 to-ink-950/80 p-3.5 shadow-sm transition hover:border-white/[0.15]"
            >
              <CoinBadge name={t.icon} size="lg" />
              <div className="min-w-0">
                <div className="font-display text-sm font-semibold tracking-tight text-zinc-100">{t.code}</div>
                <div className="truncate text-xs text-zinc-400">{t.name}</div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="ml-auto"
                disabled={!connected || busy !== null}
                loading={busy === t.code}
                onClick={() => void mint(t.code, t.sac as string, t.decimals)}
              >
                {busy === t.code ? 'Minting…' : `Mint ${DRIP.toLocaleString()}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5">
          {FAUCET_TOKENS.map((t) =>
            msg[t.code] ? (
              <p
                key={t.code}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-300 animate-fade-in"
              >
                <span className="font-bold text-emerald-400">{t.code}</span> · {msg[t.code]}
              </p>
            ) : null,
          )}
        </div>
      </CyberCard>
    </div>
  )
}

export default Faucet
