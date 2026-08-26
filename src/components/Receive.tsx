import { useState } from 'react'
import { CheckIcon, CopyIcon, LockIcon, MirageMark, ShieldIcon } from './ui'

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
    <div className="mx-auto max-w-xl space-y-5">
      {/* Visual cryptographic icon */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-ink-750 bg-ink-900/70 p-8 text-center shadow-panel backdrop-blur-md">
        {/* Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6), transparent)' }}
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-ink-700 bg-ink-950/80 text-mist-400 shadow-[0_0_24px_rgba(99,102,241,0.2)]">
          <MirageMark className="h-10 w-10 text-mist-300" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-zinc-100">Confidential Receive Cipher</h3>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-400">
          Anyone with this code can send you shielded funds on Starknet. Your wallet address and balance remain 100% hidden.
        </p>
      </div>

      {receiveCode ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-ink-750 bg-ink-900/80 p-4 backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between">
              <span className="coord-label text-mist-400">your stealth cipher</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>

            <div className="relative flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-950/90 p-3">
              <span className="break-all font-mono text-xs text-zinc-200">{receiveCode}</span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void copy()}
                className="btn btn-primary btn-sm flex-1 gap-1.5"
              >
                {copied ? <CheckIcon className="h-4 w-4 text-white" /> : <CopyIcon className="h-4 w-4" />}
                {copied ? 'Copied to clipboard' : 'Copy receive cipher'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-800/80 bg-ink-950/50 p-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2 font-medium text-zinc-300">
              <ShieldIcon className="h-4 w-4 text-mist-400" />
              <span>How Stealth Receiving Works</span>
            </div>
            <p className="mt-2 leading-relaxed text-zinc-400">
              Payments sent to this cipher use Diffie-Hellman key exchange on the Stark curve to create a one-time unspendable-by-others Merkle note. Observers scanning Voyager or Starkscan cannot link it to your account.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-ink-750 bg-ink-900/60 p-6 text-center backdrop-blur-md">
          <LockIcon className="mx-auto h-8 w-8 text-mist-400/60" />
          <p className="mt-3 text-sm text-zinc-300">Connect your Starknet wallet to generate your confidential receive code.</p>
        </div>
      )}
    </div>
  )
}

export default Receive
