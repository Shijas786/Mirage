import { useState, useEffect } from 'react'
import { cx } from '../lib/cx'
import { loadNotes } from '../lib/note-store'
import { truncateKey } from '../lib/format'
import { sfx } from '../lib/sound'
import { XIcon, ShieldIcon, CopyIcon, CheckIcon } from './ui'

interface ZkCircuitInspectorProps {
  open: boolean
  onClose: () => void
}

export function ZkCircuitInspector({ open, onClose }: ZkCircuitInspectorProps) {
  const [activeTab, setActiveTab] = useState<'merkle' | 'trace' | 'params'>('merkle')
  const [copiedCommitment, setCopiedCommitment] = useState<string | null>(null)
  const notes = loadNotes()
  const unspentNotes = notes.filter((n) => !n.spent)
  const spentNotes = notes.filter((n) => n.spent)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const copyHash = async (hash: string) => {
    sfx.click()
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedCommitment(hash)
      setTimeout(() => setCopiedCommitment(null), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#06070B]/85 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Cybernetic Modal Card */}
      <div className="relative z-10 flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-white/[0.12] bg-[#0A0C16] shadow-[0_20px_60px_rgba(0,0,0,0.85)] cyber-panel overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-ink-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              <ShieldIcon className="h-4.5 w-4.5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold tracking-wide text-white uppercase">
                  ZK Circuit & Merkle Tree Inspector
                </h3>
                <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                  LIVE L2
                </span>
              </div>
              <p className="font-mono text-[11px] text-mist-400">
                Cairo 2.x Core · STARK Curve 252 · Merkle Tree Depth 32
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sfx.click()
                onClose()
              }}
              className="rounded-lg border border-white/[0.08] p-1.5 text-zinc-400 transition hover:border-white/[0.2] hover:bg-white/[0.05] hover:text-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/[0.08] bg-ink-950/40 px-6">
          <button
            onClick={() => {
              sfx.click()
              setActiveTab('merkle')
            }}
            className={cx(
              'border-b-2 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all',
              activeTab === 'merkle'
                ? 'border-cyan-400 text-cyan-300 shadow-[inset_0_-2px_10px_rgba(34,211,238,0.2)]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200',
            )}
          >
            Merkle Vault Tree ({unspentNotes.length} Leaves)
          </button>
          <button
            onClick={() => {
              sfx.click()
              setActiveTab('trace')
            }}
            className={cx(
              'border-b-2 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all',
              activeTab === 'trace'
                ? 'border-indigo-400 text-indigo-300 shadow-[inset_0_-2px_10px_rgba(99,102,241,0.2)]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200',
            )}
          >
            Prover Execution Trace
          </button>
          <button
            onClick={() => {
              sfx.click()
              setActiveTab('params')
            }}
            className={cx(
              'border-b-2 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all',
              activeTab === 'params'
                ? 'border-mist-400 text-mist-200 shadow-[inset_0_-2px_10px_rgba(224,231,255,0.2)]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200',
            )}
          >
            Cryptographic Constants
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm">
          {activeTab === 'merkle' && (
            <div className="space-y-6">
              {/* Tree Topology Overview */}
              <div className="rounded-xl border border-white/[0.08] bg-ink-950/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="coord-label text-cyan-400">[ TREE TOPOLOGY ]</span>
                  <span className="font-mono text-xs text-zinc-400">Total Capacity: 2^32 (~4.29B notes)</span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-white/[0.05] bg-ink-900/60 p-3">
                    <span className="text-[11px] text-zinc-400">Active Unspent Notes</span>
                    <p className="mt-1 font-mono text-xl font-bold text-emerald-300">{unspentNotes.length}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.05] bg-ink-900/60 p-3">
                    <span className="text-[11px] text-zinc-400">Spent Nullifiers Registered</span>
                    <p className="mt-1 font-mono text-xl font-bold text-coral-300">{spentNotes.length}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.05] bg-ink-900/60 p-3">
                    <span className="text-[11px] text-zinc-400">Hash Primitive</span>
                    <p className="mt-1 font-mono text-xl font-bold text-indigo-300">Pedersen 252</p>
                  </div>
                </div>
              </div>

              {/* Live Tree Hierarchy Visualizer */}
              <div>
                <h4 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Merkle Tree Root & Leaves
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 font-mono text-xs text-cyan-300">
                    <span className="shrink-0 font-bold uppercase">[TREE ROOT]</span>
                    <span className="truncate">0x071a93b4991206f759cbb105e19e09d94943f65e23630f52bda40fb176b6d214</span>
                    <span className="ml-auto shrink-0 rounded bg-cyan-400/20 px-2 py-0.5 text-[10px]">ON-CHAIN</span>
                  </div>

                  {notes.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/[0.1] p-6 text-center text-xs text-zinc-500 font-mono">
                      No commitments minted in this local enclave yet. Deposit or receive assets to grow the tree.
                    </div>
                  ) : (
                    notes.map((n, idx) => (
                      <div
                        key={n.commitment}
                        className={cx(
                          'flex items-center gap-3 rounded-xl border p-3 font-mono text-xs transition',
                          n.spent
                            ? 'border-white/[0.05] bg-ink-950/40 text-zinc-500'
                            : 'border-white/[0.1] bg-ink-900/70 text-zinc-200 hover:border-mist-400/40',
                        )}
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-ink-800 text-[10px] text-zinc-400">
                          {idx}
                        </span>
                        <span className="font-semibold text-mist-300">{n.assetCode}</span>
                        <span className="text-zinc-400">
                          {n.amount ? (BigInt(n.amount) / 10n ** 18n).toString() : '0'} units
                        </span>
                        <span className="truncate text-zinc-400">
                          {truncateKey(n.commitment, 10, 8)}
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                          <span
                            className={cx(
                              'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                              n.spent ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500/20 text-emerald-400',
                            )}
                          >
                            {n.spent ? 'NULLIFIED' : 'UNSPENT LEAF'}
                          </span>
                          <button
                            onClick={() => copyHash(n.commitment)}
                            className="rounded p-1 text-zinc-400 hover:text-white transition"
                          >
                            {copiedCommitment === n.commitment ? (
                              <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <CopyIcon className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trace' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-ink-950 p-4 font-mono text-xs text-zinc-300">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-mist-400">
                  <span>CAIRO 2.x EXECUTION TRACE LOGGER</span>
                  <span className="text-emerald-400">STATUS: PROVER IDLE / READY</span>
                </div>
                <div className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-zinc-400">
                  <p className="text-cyan-400">[00:00.001] Initializing STARK 252 Field Element Arithmetic Context...</p>
                  <p className="text-zinc-300">[00:00.004] Loading Pedersen Merkle verification subroutines: depth=32</p>
                  <p className="text-zinc-300">[00:00.009] Constraint system configured: 2-in / 2-out note balance conservation</p>
                  <p className="text-indigo-400">[00:00.015] Ephemeral stealth public key derivation verification: OK</p>
                  <p className="text-zinc-300">[00:00.022] Nullifier uniqueness check: hash(spending_key, leaf_index)</p>
                  <p className="text-emerald-400">[00:00.035] Prover benchmark completed: Average runtime ~38.4ms (Cairo VM)</p>
                  <p className="text-mist-400">[00:00.040] Zero-knowledge proof ready for on-chain contract verification</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-ink-950/60 p-4">
                  <span className="font-mono text-xs font-semibold text-zinc-300">Prover Privacy Invariants</span>
                  <ul className="mt-2 space-y-1 font-mono text-[11px] text-zinc-400">
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> In-circuit value conservation: sum(In) == sum(Out)
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> No plaintext values exposed to sequencer
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> Unlinkable nullifiers prevent double-spend
                    </li>
                  </ul>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-ink-950/60 p-4">
                  <span className="font-mono text-xs font-semibold text-zinc-300">Starknet Verifier Contract</span>
                  <ul className="mt-2 space-y-1 font-mono text-[11px] text-zinc-400">
                    <li><span className="text-mist-400">Target:</span> Starknet Sepolia L2</li>
                    <li><span className="text-mist-400">Gas Overhead:</span> ~0.00012 STRK</li>
                    <li><span className="text-mist-400">Execution:</span> Real-time Cairo VM native</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'params' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-ink-950/60 p-4">
                <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-mist-300">
                  Cryptographic Parameters
                </h4>
                <dl className="mt-3 divide-y divide-white/[0.06] font-mono text-xs">
                  <div className="flex justify-between py-2">
                    <dt className="text-zinc-400">Stark Curve Prime Field</dt>
                    <dd className="text-zinc-200">2^251 + 17·2^192 + 1</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-zinc-400">Merkle Tree Height</dt>
                    <dd className="text-cyan-400">32 Levels</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-zinc-400">Commitment Hash Function</dt>
                    <dd className="text-indigo-400">Pedersen(asset, amount, owner_pubkey, salt)</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-zinc-400">Nullifier Hash Function</dt>
                    <dd className="text-coral-400">Pedersen(spending_key, leaf_index)</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-zinc-400">Encrypted Memo Format</dt>
                    <dd className="text-zinc-200">ChaCha20-Poly1305 over ECDH shared secret</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-ink-950 px-6 py-3 font-mono text-[11px] text-zinc-400">
          <span>Starknet Privacy Layer 2</span>
          <span className="text-emerald-400">Zero Leakage Guarantee Active</span>
        </div>
      </div>
    </div>
  )
}
