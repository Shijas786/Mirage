import { useState } from 'react'
import { CheckIcon, CopyIcon, LockIcon, MirageMark, PageIntro, ShieldIcon } from './ui'

/** The receive cipher: a shareable code senders encrypt to, revealing nothing
 *  about balance or history. Extracted from the former single-scroll wallet. */
export function Receive({ receiveCode }: { receiveCode: string | null }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    if (!receiveCode) return
    try {
      await navigator.clipboard.writeText(receiveCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageIntro
        title="Stealth Receive"
        subtitle="Share your unlinked stealth receive cipher. Senders encrypt payments using ECDH on the Stark curve."
        badge="STEALTH CIPHER · UNLINKABLE"
      />

      {/* Visual cryptographic icon card */}
      <div className="cyber-panel cyber-brackets relative flex flex-col items-center justify-center overflow-hidden p-8 text-center">
        {/* Glow Halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(236,121,107,0.8), rgba(99,102,241,0.5), transparent)' }}
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.12] bg-gradient-to-br from-ink-900 to-ink-950 text-coral-400 shadow-[0_0_30px_rgba(236,121,107,0.3)]">
          <MirageMark className="h-10 w-10 text-coral-300" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-zinc-100">Confidential Receive Cipher</h3>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-zinc-400">
          Anyone with this code can send you shielded funds on Starknet. Your wallet address and balance remain 100% hidden from block explorers.
        </p>
      </div>

      {receiveCode ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0F1122]/90 to-[#070810]/90 p-5 shadow-panel backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="coord-label text-mist-300">Your Ephemeral Stealth Cipher</span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                Active & Ready
              </span>
            </div>

            <div className="relative flex items-center gap-2 rounded-xl border border-white/[0.08] bg-ink-950/90 p-3.5 shadow-inner">
              <span className="break-all font-mono text-xs text-zinc-200 selection:bg-mist-500/40">{receiveCode}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => void copy()}
                className="btn btn-primary btn-sm flex-1 gap-2 py-2.5"
              >
                {copied ? <CheckIcon className="h-4 w-4 text-white" /> : <CopyIcon className="h-4 w-4" />}
                <span className="font-mono text-xs uppercase tracking-wider">{copied ? 'Cipher Copied to Clipboard!' : 'Copy Stealth Cipher'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#090A14] to-[#05060A] p-5 text-xs text-zinc-400 shadow-panel backdrop-blur-xl">
            <div className="flex items-center gap-2 font-display text-sm font-semibold text-zinc-200">
              <ShieldIcon className="h-4.5 w-4.5 text-coral-400" />
              <span>How Stealth Receiving Works</span>
            </div>
            <p className="mt-2.5 leading-relaxed text-zinc-400">
              Payments sent to this cipher use Diffie-Hellman key exchange on the Stark curve to create a one-time unspendable-by-others Merkle note. Observers scanning Voyager or Starkscan cannot link it to your account address or previous transactions.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-ink-900/60 p-8 text-center backdrop-blur-2xl">
          <LockIcon className="mx-auto h-10 w-10 text-mist-400/60" />
          <p className="mt-3 text-sm text-zinc-300">Connect your Starknet wallet to generate your confidential stealth receive code.</p>
        </div>
      )}
    </div>
  )
}

export default Receive
