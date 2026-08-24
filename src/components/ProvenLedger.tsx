import { loadNotes, type StoredNote } from '../lib/note-store'
import { truncateKey } from '../lib/format'

// A slim audit trail under the masthead: the shielded actions this device has
// proven, reconstructed read-only from the local note store. No terminal shell —
// just receipts, so the film leaves a verifiable paper trail.

const VERB: Record<NonNullable<StoredNote['source']>, string> = {
  deposit: 'DEPOSIT',
  received: 'RECEIVED',
  change: 'SENT',
}

function clock(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function ProvenLedger() {
  const entries = loadNotes()
    .slice()
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, 4)

  if (entries.length === 0) return null

  return (
    <ul className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {entries.map((n) => {
        const proven = Boolean(n.txHash)
        return (
          <li key={n.commitment} className="coord-label flex items-center gap-2 rounded-full border border-ink-800 bg-ink-900/60 px-3 py-1 normal-case tracking-normal backdrop-blur-md">
            <span className="tabular-nums text-mist-400/60">{clock(n.createdAt ?? 0)}</span>
            <span className="uppercase tracking-[0.14em] text-zinc-300 font-medium">{VERB[n.source ?? 'received']}</span>
            <span className={proven ? 'text-emerald-400 font-semibold' : 'text-mist-400/60'}>
              {proven ? '✓ STARK verified' : '· sealed note'}
            </span>
            {proven && <span className="font-mono text-[10px] text-mist-400/80">{truncateKey(n.txHash!, 4, 4)}</span>}
          </li>
        )
      })}
    </ul>
  )
}

export default ProvenLedger
