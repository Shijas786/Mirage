import { Link } from 'react-router-dom'
import { useMirage } from '../hooks/useMirage'
import { useReveal } from '../hooks/useReveal'
import { formatUsd } from '../lib/format'
import { cx } from '../lib/cx'
import { ScrambleNumber } from '../components/ScrambleNumber'
import { ProvenLedger } from '../components/ProvenLedger'
import { CoinBadge } from '../components/BrandIcons'
import {
  ArrowDownIcon,
  EyeGlyph,
  LockIcon,
  ReceiveIcon,
  SendIcon,
  SparklesIcon,
  SwapIcon,
} from '../components/ui'

const MASK = '######'

const MODULES = [
  {
    label: 'Deposit / Withdraw',
    to: '/deposit',
    title: 'Cross the veil',
    desc: 'Move assets in and out of the shielded pool seamlessly — validated on Starknet with STARK proofs.',
    icon: ArrowDownIcon,
    tag: 'Bridge · L1/L2',
  },
  {
    label: 'Pay',
    to: '/pay',
    title: 'Send into the dark',
    desc: 'Confidential 2-in / 2-out shielded transfers. Amounts, senders, and receivers stay private inside Cairo circuits.',
    icon: SendIcon,
    tag: 'Encrypted · 0-Leak',
  },
  {
    label: 'Swap',
    to: '/swap',
    title: 'The sealed book',
    desc: 'Dark pool order matching at the midpoint price. Zero front-running, zero sandwich attacks, zero MEV.',
    icon: SwapIcon,
    tag: 'Dark DEX · Midpoint',
  },
  {
    label: 'Receive',
    to: '/receive',
    title: 'Your cipher',
    desc: 'Share your single-use or persistent stealth receive cipher to receive private payments on Starknet.',
    icon: ReceiveIcon,
    tag: 'Stealth · Unlinkable',
  },
] as const

const QUICK_ACTIONS = [
  { label: 'Deposit', to: '/deposit', icon: ArrowDownIcon },
  { label: 'Send', to: '/pay', icon: SendIcon },
  { label: 'Swap', to: '/swap', icon: SwapIcon },
  { label: 'Receive', to: '/receive', icon: ReceiveIcon },
] as const

export function Hub() {
  const { balances, loadingBalances } = useMirage()
  const { revealed, toggle } = useReveal()
  const total = balances.reduce((sum, b) => sum + b.usdEstimate, 0)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pb-16 sm:pt-12">
      {/* Hero section */}
      <section className="relative flex flex-col items-center pb-12 text-center">
        {/* Starknet cosmic glow behind balance */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 h-72 w-[28rem] -translate-x-1/2 rounded-full opacity-35 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.45), rgba(236,121,107,0.18) 70%, transparent)' }}
        />

        <div className="relative flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-ink-800 bg-ink-900/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mist-300 backdrop-blur-md">
            <LockIcon className="h-3 w-3 text-mist-400" />
            shielded · [ pedersen · merkle · cairo ]
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-label={revealed ? 'Hide balance' : 'Reveal balance'}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-800 bg-ink-900/80 text-mist-400/80 transition hover:border-mist-500/40 hover:text-mist-300 active:scale-95"
          >
            <EyeGlyph off={!revealed} className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-6 flex min-h-[4.5rem] items-center" style={{ textShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
          {loadingBalances ? (
            <span className="display-hd text-5xl text-mist-400/30">••••••</span>
          ) : (
            <ScrambleNumber value={formatUsd(total)} revealed={revealed} className="display-hd text-[clamp(2.8rem,9vw,5.2rem)]" />
          )}
        </div>
        <div className="coord-label mt-2.5 text-mist-400/80">{revealed ? 'your shielded total · usd' : 'private by default'}</div>

        {/* Quick action pill row */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-center gap-2 rounded-xl border border-ink-750 bg-ink-900/80 px-4 py-2 text-xs font-semibold text-zinc-200 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-mist-500/60 hover:bg-mist-600/20 hover:text-white hover:shadow-[0_0_16px_rgba(99,102,241,0.25)] active:scale-98"
              >
                <Icon className="h-3.5 w-3.5 text-mist-400 transition group-hover:text-white" />
                <span>{action.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Balances pills */}
        {!loadingBalances && balances.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5">
            {balances.map((b) => (
              <span key={b.asset} className="flex items-center gap-2.5 rounded-xl border border-ink-800/90 bg-ink-900/70 px-3.5 py-1.5 backdrop-blur-md transition hover:border-ink-700">
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
          <Link to="/deposit" className="coord-label mt-8 inline-flex items-center gap-1.5 text-mist-400 transition hover:text-mist-300">
            <span>nothing shielded yet — cross the veil</span>
            <span aria-hidden>→</span>
          </Link>
        )}

        <div className="mt-10 w-full">
          <ProvenLedger />
        </div>
      </section>

      {/* Feature Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((mod) => {
          const Icon = mod.icon
          return (
            <Link
              key={mod.to}
              to={mod.to}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-800/90 bg-ink-900/70 p-6 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-mist-500/50 hover:bg-ink-850/90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.18)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-ink-750 bg-ink-950/80 text-mist-400 transition group-hover:border-mist-500/40 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="coord-label text-mist-400">{mod.label}</div>
                </div>
                <span className="rounded-full border border-ink-800 bg-ink-950/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400 group-hover:border-mist-500/30 group-hover:text-mist-300">
                  {mod.tag}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="display-hd text-xl text-zinc-100 transition group-hover:text-white">{mod.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{mod.desc}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-ink-800/60 pt-3">
                <span className="coord-label text-mist-400 transition group-hover:text-mist-300">enter →</span>
                <SparklesIcon className="h-3.5 w-3.5 text-mist-400/40 opacity-0 transition group-hover:opacity-100" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Hub
