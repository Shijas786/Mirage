import { Link } from 'react-router-dom'
import { useMirage } from '../hooks/useMirage'
import { useReveal } from '../hooks/useReveal'
import { formatUsd } from '../lib/format'
import { cx } from '../lib/cx'
import { ScrambleNumber } from '../components/ScrambleNumber'
import { ProvenLedger } from '../components/ProvenLedger'
import { CoinBadge } from '../components/BrandIcons'
import { EyeGlyph } from '../components/ui'

const MASK = '######'

const MODULES = [
  ['Deposit / Withdraw', '/deposit', 'Cross the veil', 'Move value in and out of the shielded pool — proven on Starknet with STARK validity.'],
  ['Pay', '/pay', 'Send into the dark', 'A 2-in / 2-out shielded transfer. Amounts and parties stay hidden inside Cairo circuits.'],
  ['Swap', '/swap', 'The sealed book', 'A dark pool where orders match at the midpoint — nothing to front-run.'],
  ['Receive', '/receive', 'Your cipher', 'Share your receive code to receive confidential payments on Starknet.'],
] as const

export function Hub() {
  const { balances, loadingBalances } = useMirage()
  const { revealed, toggle } = useReveal()
  const total = balances.reduce((sum, b) => sum + b.usdEstimate, 0)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-12">
      <section className="relative flex flex-col items-center pb-12 text-center">
        {/* Subtle Starknet glow behind balance */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 h-64 w-96 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4), rgba(236,121,107,0.15) 70%, transparent)' }}
        />

        <div className="relative flex items-center gap-3">
          <span className="coord-label text-mist-400">shielded · [ pedersen · merkle · cairo ]</span>
          <button
            type="button"
            onClick={toggle}
            aria-label={revealed ? 'Hide balance' : 'Reveal balance'}
            className="text-mist-400/70 transition hover:text-mist-300"
          >
            <EyeGlyph off={!revealed} className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-6 flex min-h-[4.5rem] items-center" style={{ textShadow: '0 0 35px rgba(99,102,241,0.35)' }}>
          {loadingBalances ? (
            <span className="display-hd text-5xl text-mist-400/30">••••••</span>
          ) : (
            <ScrambleNumber value={formatUsd(total)} revealed={revealed} className="display-hd text-[clamp(2.6rem,9vw,5rem)]" />
          )}
        </div>
        <div className="coord-label mt-3 text-mist-400/80">{revealed ? 'your shielded total · usd' : 'private by default'}</div>

        {!loadingBalances && balances.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {balances.map((b) => (
              <span key={b.asset} className="flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-900/60 px-3 py-1.5 backdrop-blur-md">
                <CoinBadge name={b.asset} size="sm" />
                <span className="font-mono text-sm text-zinc-200">{b.asset}</span>
                <span
                  className={cx(
                    'font-mono text-sm tabular-nums',
                    revealed ? 'text-zinc-100 font-semibold' : 'mi-scramble-glyph mi-scramble-char',
                  )}
                >
                  {revealed ? b.amount : MASK}
                </span>
              </span>
            ))}
          </div>
        )}

        {!loadingBalances && balances.length === 0 && (
          <Link to="/deposit" className="coord-label mt-8 text-mist-400 transition hover:text-mist-300">
            nothing shielded yet — cross the veil →
          </Link>
        )}

        <div className="mt-10 w-full">
          <ProvenLedger />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map(([label, to, title, desc]) => (
          <Link
            key={to}
            to={to}
            className="group relative overflow-hidden rounded-2xl border border-ink-800/90 bg-ink-900/70 p-6 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-mist-500/50 hover:bg-ink-850/90 hover:shadow-[0_4px_30px_rgba(99,102,241,0.15)]"
          >
            <div className="coord-label mb-2 text-mist-400">{label}</div>
            <h3 className="display-hd text-xl text-zinc-100 transition group-hover:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{desc}</p>
            <span className="coord-label mt-4 inline-block text-mist-400 transition group-hover:text-mist-300">enter →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Hub
