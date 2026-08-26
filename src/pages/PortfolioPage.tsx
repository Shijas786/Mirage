// @ts-nocheck

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMirage } from '../hooks/useMirage'
import { useReveal } from '../hooks/useReveal'
import { loadNotes, type StoredNote } from '../lib/note-store'
import { assetMeta } from '../lib/tokens'
import { formatAmount, formatUsd } from '../lib/format'
import { cx } from '../lib/cx'
import { AssetAvatar, ChevronDownIcon, EyeGlyph } from '../components/ui'
import { ScrambleNumber } from '../components/ScrambleNumber'
import type { AssetCode } from '../lib/mirage-sdk'

const MASK = '••••••'

const SOURCE_LABEL: Record<NonNullable<StoredNote['source']>, string> = {
  deposit: 'Deposit',
  received: 'Received',
  change: 'Change',
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
  // Recomputed each render; the page re-renders whenever balances refresh (which is when the
  // spent flags used below are reconciled), so the breakdown stays in sync with the totals.
  const notesByAsset = groupUnspentNotes()

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
    <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-10 sm:px-6 sm:pb-20 sm:pt-12">
      {/* Total */}
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <div className="coord-label text-mist-400">portfolio · starknet shielded pool</div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          {loadingBalances ? (
            <span className="display-hd text-4xl text-mist-400/30">{MASK}</span>
          ) : (
            <ScrambleNumber
              value={formatUsd(total)}
              revealed={revealed}
              className="display-hd text-[clamp(2.2rem,6vw,3.6rem)] text-zinc-100"
            />
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={revealed ? 'Hide balances' : 'Show balances'}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-ink-800 bg-ink-900/80 text-mist-400/80 transition hover:border-mist-500/40 hover:text-mist-300 active:scale-95"
          >
            <EyeGlyph off={!revealed} className="h-5 w-5" />
          </button>
        </div>
        <div className="coord-label mt-1 text-mist-400/80">{revealed ? 'total shielded value · usd' : 'private by default'}</div>
      </header>

      {/* Holdings */}
      {loadingBalances ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-ink-800 bg-ink-900/40" />
          ))}
        </div>
      ) : balances.length === 0 ? (
        <div className="rounded-2xl border border-ink-800/90 bg-ink-900/60 px-6 py-14 text-center shadow-panel backdrop-blur-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-750 bg-ink-950/80 text-mist-400">
            <EyeGlyph className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-zinc-200">No Shielded Assets</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-zinc-400">
            Deposit tokens to mint zero-knowledge Pedersen notes on Starknet L2.
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
              <div key={b.asset} className="overflow-hidden rounded-2xl border border-ink-800/90 bg-ink-900/70 backdrop-blur-md transition-all hover:border-ink-700">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : b.asset)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3.5 p-4 text-left transition hover:bg-ink-850/60"
                >
                  <AssetAvatar code={b.asset} className="h-10 w-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-semibold text-zinc-100">{b.asset}</span>
                      <span className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                        {notes.length} note{notes.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="truncate text-xs text-zinc-500">
                      {meta.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold tabular-nums text-zinc-100">{revealed ? b.amount : MASK}</div>
                    <div className="text-xs text-zinc-500">{revealed ? `≈ ${formatUsd(b.usdEstimate)}` : ''}</div>
                  </div>
                  <ChevronDownIcon
                    className={cx('h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200', isOpen && 'rotate-180 text-mist-400')}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-ink-800/80 bg-ink-950/50 p-4">
                    {/* Quick action bar for this asset */}
                    <div className="mb-3 flex items-center justify-between border-b border-ink-800/60 pb-3">
                      <div className="coord-label text-mist-400">pedersen notes & actions</div>
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
                      <p className="py-2 text-center text-xs text-zinc-500">No spendable notes.</p>
                    ) : (
                      <ul className="space-y-2">
                        {notes.map((n) => (
                          <li key={n.commitment} className="flex flex-col gap-1.5 rounded-xl border border-ink-800/60 bg-ink-900/60 p-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mist-400" />
                              <span className="font-medium text-zinc-300">{SOURCE_LABEL[n.source ?? 'received']}</span>
                              {n.leafIndex !== undefined && (
                                <span className="rounded bg-mist-600/20 px-1.5 py-0.5 font-mono text-[10px] text-mist-300">
                                  Leaf #{n.leafIndex}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => void copyCommitment(n.commitment)}
                                title="Click to copy commitment hash"
                                className="truncate font-mono text-[10px] text-zinc-500 transition hover:text-mist-300"
                              >
                                {copiedHash === n.commitment ? '✓ Copied' : `${n.commitment.slice(0, 10)}…`}
                              </button>
                            </div>
                            <div className="font-mono tabular-nums text-zinc-200 font-semibold sm:text-right">
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
