import { loadNotes, type StoredNote } from '../lib/note-store'
import { truncateKey } from '../lib/format'

// A slim audit trail under the masthead: the shielded actions this device has
// proven, reconstructed read-only from the local note store.

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
    <ul className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
      {entries.map((n) => {
        const proven = Boolean(n.txHash)
        return (
          <li
            key={n.commitment}
            className="coord-label flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-950/80 px-3.5 py-1.5 normal-case tracking-normal shadow-sm backdrop-blur-xl transition hover:border-mist-400/40 hover:bg-ink-900/90"
          >
            <span className="font-mono text-[10px] tabular-nums text-mist-400/70">{clock(n.createdAt ?? 0)}</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-200">{VERB[n.source ?? 'received']}</span>
            <span className={proven ? 'flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-400' : 'text-mist-400/60'}>
              {proven ? '✓ STARK VERIFIED' : '· SEALED NOTE'}
            </span>
            {proven && (
              <span className="rounded bg-mist-600/20 px-1.5 py-0.2 font-mono text-[9px] text-mist-300">
                {truncateKey(n.txHash!, 4, 4)}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default ProvenLedger
