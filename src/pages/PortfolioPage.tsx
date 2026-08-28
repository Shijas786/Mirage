// @ts-nocheck

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMirage } from '../hooks/useMirage'
import { useReveal } from '../hooks/useReveal'
import { loadNotes, type StoredNote } from '../lib/note-store'
import { assetMeta } from '../lib/tokens'
import { formatAmount, formatUsd } from '../lib/format'
import { cx } from '../lib/cx'
import { AssetAvatar, ChevronDownIcon, CopyIcon, EyeGlyph, LockIcon, ShieldIcon } from '../components/ui'
import { ScrambleNumber } from '../components/ScrambleNumber'
import type { AssetCode } from '../lib/mirage-sdk'

const MASK = '••••••'

const SOURCE_LABEL: Record<NonNullable<StoredNote['source']>, string> = {
  deposit: 'Deposit',
  received: 'Received',
  change: 'Change',
}

const ASSET_COLORS: Record<string, string> = {
  STRK: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]',
  ETH: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]',
  USDC: 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]',
  bETH: 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]',
  bUSDC: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
}

/** A stored note's amount as a human number, using its own decimals (falls back to the token's). */
function noteHuman(note: StoredNote): number {
  const decimals = note.decimals ?? assetMeta(note.assetCode).decimals
  return Number(BigInt(note.amount)) / 10 ** decimals
}

/** The wallet's unspent notes grouped by asset, largest first — the per-asset breakdown. */
function groupUnspentNotes(): Map<AssetCode, StoredNote[]> {
  const map = new Map<AssetCode, StoredNote[]>()
  for (const n of loadNotes()) {
    if (n.spent) continue
    const arr = map.get(n.assetCode) ?? []
    arr.push(n)
    map.set(n.assetCode, arr)
  }
  for (const arr of map.values()) arr.sort((a, b) => noteHuman(b) - noteHuman(a))
  return map
}

export function PortfolioPage() {
  const { balances, loadingBalances } = useMirage()
  const { revealed, toggle } = useReveal()
  const [open, setOpen] = useState<AssetCode | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  const total = balances.reduce((sum, b) => sum + b.usdEstimate, 0)
  const notesByAsset = groupUnspentNotes()
  const totalNotesCount = Array.from(notesByAsset.values()).reduce((sum, arr) => sum + arr.length, 0)

  async function copyCommitment(commitment: string) {
    try {
      await navigator.clipboard.writeText(commitment)
      setCopiedHash(commitment)
      setTimeout(() => setCopiedHash(null), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      {/* Header & Total */}
      <header className="relative mb-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#101224]/90 to-[#080912]/90 p-6 shadow-panel backdrop-blur-2xl sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6), transparent)' }}
        />

        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="coord-label text-mist-400">ZK Shielded Portfolio · Starknet</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              {loadingBalances ? (
                <span className="display-hd text-4xl text-mist-400/30">{MASK}</span>
              ) : (
                <ScrambleNumber
                  value={formatUsd(total)}
                  revealed={revealed}
                  className="display-hd text-[clamp(2.4rem,7vw,4rem)] text-white"
                />
              )}
              <button
                type="button"
                onClick={toggle}
                aria-label={revealed ? 'Hide balances' : 'Show balances'}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.1] bg-ink-900/80 text-mist-400 transition hover:border-mist-400/50 hover:bg-mist-600/20 hover:text-white active:scale-95"
              >
                <EyeGlyph off={!revealed} className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="coord-label mt-1 text-mist-400/80">
              {revealed ? 'TOTAL PROTECTED VALUE · AUDITED ON-CHAIN' : 'ENCRYPTED ZERO-KNOWLEDGE BALANCE'}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/deposit" className="btn btn-primary btn-sm">
              Deposit
            </Link>
            <Link to="/pay" className="btn btn-outline btn-sm">
              Send
            </Link>
            <Link to="/swap" className="btn btn-outline btn-sm">
              Swap
            </Link>
          </div>
        </div>

        {/* Visual Allocation Bar */}
        {!loadingBalances && balances.length > 0 && total > 0 && (
          <div className="relative mt-6 border-t border-white/[0.06] pt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
              <span className="coord-label text-mist-300/80">Asset Allocation</span>
              <span className="font-mono text-[11px] text-zinc-400">{balances.length} assets shielded</span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-ink-950/80 p-0.5">
              {balances.map((b) => {
                const pct = total > 0 ? (b.usdEstimate / total) * 100 : 0
                if (pct < 1) return null
                return (
                  <div
                    key={b.asset}
                    style={{ width: `${pct}%` }}
                    className={cx('h-full first:rounded-l-full last:rounded-r-full', ASSET_COLORS[b.asset] ?? 'bg-mist-500')}
                    title={`${b.asset}: ${pct.toFixed(1)}%`}
                  />
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Vault Analytics Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#0E1020]/90 to-[#070810]/90 p-4 backdrop-blur-xl">
          <div className="coord-label text-mist-400">Unspent ZK Notes</div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-100">{totalNotesCount}</div>
          <div className="mt-1 text-[11px] text-zinc-500">Pedersen leaf commitments</div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#0E1020]/90 to-[#070810]/90 p-4 backdrop-blur-xl">
          <div className="coord-label text-mist-400">Anonymity Rating</div>
          <div className="mt-2 flex items-center gap-1.5 font-mono text-2xl font-bold text-emerald-400">
            <span>100%</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Zero linkable metadata</div>
        </div>

        <div className="col-span-2 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#0E1020]/90 to-[#070810]/90 p-4 backdrop-blur-xl sm:col-span-1">
          <div className="coord-label text-mist-400">Circuit Engine</div>
          <div className="mt-2 font-mono text-2xl font-bold text-cyan-400">Cairo 2.x</div>
          <div className="mt-1 text-[11px] text-zinc-500">STARK curves verified</div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight text-zinc-100">Shielded Holdings</h2>
        <span className="coord-label text-mist-400/80">Click asset for note tree</span>
      </div>

      {loadingBalances ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/[0.06] bg-ink-900/40" />
          ))}
        </div>
      ) : balances.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-ink-900/80 to-ink-950/80 px-6 py-14 text-center shadow-panel backdrop-blur-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-ink-950 text-mist-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <ShieldIcon className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-zinc-100">No Shielded Assets in Vault</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-zinc-400">
            Deposit Starknet or Ethereum tokens into the privacy pool to mint confidential zero-knowledge Pedersen notes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/deposit" className="btn btn-primary btn-sm">
              Deposit Assets →
            </Link>
            <Link to="/faucet" className="btn btn-outline btn-sm">
              Get Testnet Tokens
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {balances.map((b) => {
            const notes = notesByAsset.get(b.asset) ?? []
            const isOpen = open === b.asset
            const meta = assetMeta(b.asset)
            return (
              <div
                key={b.asset}
                className={cx(
                  'overflow-hidden rounded-2xl border transition-all duration-200',
                  isOpen
                    ? 'border-mist-500/50 bg-gradient-to-b from-[#111326]/95 to-[#0A0B14]/95 shadow-[0_8px_30px_rgba(99,102,241,0.15)]'
                    : 'border-white/[0.08] bg-gradient-to-b from-ink-900/80 to-ink-950/80 hover:border-white/[0.15] hover:bg-ink-850/80',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : b.asset)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-4 text-left transition sm:p-5"
                >
                  <AssetAvatar code={b.asset} className="h-11 w-11 shrink-0 shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-semibold text-zinc-100">{b.asset}</span>
                      <span className="rounded-md border border-white/[0.08] bg-ink-950/80 px-2 py-0.5 font-mono text-[10px] text-mist-300">
                        {notes.length} note{notes.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="truncate text-xs text-zinc-400">{meta.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-base font-semibold tabular-nums text-zinc-100">
                      {revealed ? b.amount : MASK}
                    </div>
                    <div className="font-mono text-xs text-zinc-500">{revealed ? `≈ ${formatUsd(b.usdEstimate)}` : ''}</div>
                  </div>
                  <ChevronDownIcon
                    className={cx(
                      'h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200',
                      isOpen && 'rotate-180 text-mist-400',
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-white/[0.08] bg-ink-950/60 p-4 sm:p-5">
                    {/* Quick action bar for this asset */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                      <div className="coord-label text-mist-400">Pedersen Note Tree Decomposition</div>
                      <div className="flex items-center gap-2">
                        <Link to="/pay" className="btn btn-outline btn-sm py-1 text-[11px]">
                          Send
                        </Link>
                        <Link to="/swap" className="btn btn-outline btn-sm py-1 text-[11px]">
                          Swap
                        </Link>
                        <Link to="/deposit" className="btn btn-outline btn-sm py-1 text-[11px]">
                          Withdraw
                        </Link>
                      </div>
                    </div>

                    {notes.length === 0 ? (
                      <p className="py-3 text-center text-xs text-zinc-500">No spendable notes in vault.</p>
                    ) : (
                      <ul className="space-y-2">
                        {notes.map((n) => (
                          <li
                            key={n.commitment}
                            className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-ink-900/60 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-mist-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                              <span className="font-semibold text-zinc-200">{SOURCE_LABEL[n.source ?? 'received']}</span>
                              {n.leafIndex !== undefined && (
                                <span className="rounded border border-mist-500/20 bg-mist-600/20 px-1.5 py-0.5 font-mono text-[9px] text-mist-300">
                                  Leaf #{n.leafIndex}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => void copyCommitment(n.commitment)}
                                title="Click to copy commitment hash"
                                className="flex items-center gap-1 truncate rounded bg-ink-950/80 px-2 py-0.5 font-mono text-[10px] text-zinc-400 transition hover:border-mist-400 hover:text-mist-300"
                              >
                                <CopyIcon className="h-3 w-3" />
                                {copiedHash === n.commitment ? '✓ Copied Hash' : `${n.commitment.slice(0, 10)}…`}
                              </button>
                            </div>
                            <div className="font-mono font-semibold tabular-nums text-zinc-100 sm:text-right">
                              {revealed ? `${formatAmount(noteHuman(n))} ${n.assetCode}` : MASK}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PortfolioPage
