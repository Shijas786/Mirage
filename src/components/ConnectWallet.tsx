import { useEffect, useRef, useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { truncateKey } from '../lib/format'
import { cx } from '../lib/cx'
import { Badge, Button, ChevronDownIcon, CopyIcon } from './ui'
import { StarknetGlyph } from './BrandIcons'

export function ConnectWallet() {
  const wallet = useWallet()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  async function copyAddress() {
    if (!wallet.address) return
    try {
      await navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable; ignore silently.
    }
  }

  if (wallet.status === 'not-installed') {
    return (
      <a
        href="https://www.starknet.io/en/ecosystem/wallets"
        target="_blank"
        rel="noreferrer"
        className="btn btn-outline border-mist-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
      >
        <StarknetGlyph className="h-4 w-4 text-mist-400" />
        Install Starknet Wallet
      </a>
    )
  }

  if (wallet.status === 'connected' && wallet.address) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="btn btn-outline gap-2.5 border-white/[0.12] bg-gradient-to-r from-ink-900/90 to-ink-850/90 shadow-[0_0_15px_rgba(99,102,241,0.12)]"
        >
          <span
            className={cx(
              'h-2 w-2 rounded-full',
              wallet.isTestnet
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
            )}
          />
          <span className="font-mono text-xs font-semibold text-zinc-100">{truncateKey(wallet.address)}</span>
          <ChevronDownIcon className="h-3.5 w-3.5 text-zinc-400" />
        </button>

        {open && (
          <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-white/[0.12] bg-[#0E1020]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-fade-in">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarknetGlyph className="h-4 w-4 text-mist-400" />
                <span className="font-display text-xs font-semibold text-zinc-300">Starknet Account</span>
              </div>
              <Badge tone={wallet.isTestnet ? 'accent' : 'warn'}>{wallet.network ?? 'Sepolia'}</Badge>
            </div>

            <button
              type="button"
              onClick={copyAddress}
              className="flex w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-ink-950/80 px-3 py-2 text-left transition hover:border-mist-400/50 hover:bg-ink-900"
            >
              <span className="break-all font-mono text-xs text-zinc-200">{wallet.address}</span>
              <CopyIcon className="ml-auto h-4 w-4 shrink-0 text-zinc-400" />
            </button>
            {copied && <p className="mt-1.5 font-mono text-[10px] text-emerald-400">✓ Copied address to clipboard</p>}

            {!wallet.isTestnet && (
              <p className="mt-2.5 text-xs text-amber-300">Switch your wallet to Starknet Sepolia Testnet for this demo.</p>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start border border-red-500/20 text-zinc-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => {
                wallet.disconnect()
                setOpen(false)
              }}
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </div>
    )
  }

  const busy = wallet.status === 'connecting'
  return (
    <div className="flex items-center gap-3">
      {wallet.error && wallet.status === 'disconnected' && (
        <span className="hidden text-xs text-red-300 sm:inline">{wallet.error}</span>
      )}
      <Button variant="primary" onClick={() => void wallet.connect()} loading={busy}>
        {!busy && <StarknetGlyph className="h-4 w-4 text-white" />}
        {busy ? 'Connecting…' : 'Connect Starknet'}
      </Button>
    </div>
  )
}
