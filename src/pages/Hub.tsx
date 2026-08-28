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
    glowColor: 'group-hover:border-mist-500/60 group-hover:shadow-[0_8px_30px_rgba(99,102,241,0.25)]',
    accentGrad: 'from-mist-500/20 via-transparent to-transparent',
    iconTone: 'text-mist-400',
  },
  {
    label: 'Pay',
    to: '/pay',
    title: 'Send into the dark',
    desc: 'Confidential 2-in / 2-out shielded transfers. Amounts, senders, and receivers stay private inside Cairo circuits.',
    icon: SendIcon,
    tag: 'Encrypted · 0-Leak',
    glowColor: 'group-hover:border-cyan-400/60 group-hover:shadow-[0_8px_30px_rgba(34,211,238,0.22)]',
    accentGrad: 'from-cyan-500/20 via-transparent to-transparent',
    iconTone: 'text-cyan-400',
  },
  {
    label: 'Swap',
    to: '/swap',
    title: 'The sealed book',
    desc: 'Dark pool order matching at the midpoint price. Zero front-running, zero sandwich attacks, zero MEV.',
    icon: SwapIcon,
    tag: 'Dark DEX · Midpoint',
    glowColor: 'group-hover:border-purple-400/60 group-hover:shadow-[0_8px_30px_rgba(168,85,247,0.22)]',
    accentGrad: 'from-purple-500/20 via-transparent to-transparent',
    iconTone: 'text-purple-400',
  },
  {
    label: 'Receive',
    to: '/receive',
    title: 'Your cipher',
    desc: 'Share your single-use or persistent stealth receive cipher to receive private payments on Starknet.',
    icon: ReceiveIcon,
    tag: 'Stealth · Unlinkable',
    glowColor: 'group-hover:border-coral-400/60 group-hover:shadow-[0_8px_30px_rgba(236,121,107,0.25)]',
    accentGrad: 'from-coral-500/20 via-transparent to-transparent',
    iconTone: 'text-coral-400',
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
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      {/* Central ZK Vault Core Hero */}
      <section className="relative flex flex-col items-center pb-12 text-center">
        {/* Dynamic Holographic Backdrop Aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-4 h-80 w-[32rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.5), rgba(34,211,238,0.2) 40%, rgba(236,121,107,0.15) 75%, transparent)',
          }}
        />

        {/* Shielded Protocol Badge */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-gradient-to-r from-ink-900/90 via-[#111326]/90 to-ink-900/90 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mist-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <LockIcon className="h-3 w-3 text-mist-400" />
            <span>Shielded Pool · [ Pedersen · Merkle · Cairo 2.x ]</span>
          </div>

          <button
            type="button"
            onClick={toggle}
            aria-label={revealed ? 'Hide balance' : 'Reveal balance'}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.1] bg-ink-900/80 text-mist-400 transition hover:border-mist-400/60 hover:bg-mist-600/20 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] active:scale-95"
          >
            <EyeGlyph off={!revealed} className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Big Scrambled Balance Number */}
        <div
          className="relative mt-6 flex min-h-[5rem] items-center"
          style={{ textShadow: '0 0 50px rgba(99,102,241,0.5)' }}
        >
          {loadingBalances ? (
            <span className="display-hd text-5xl text-mist-400/30">••••••</span>
          ) : (
            <ScrambleNumber
              value={formatUsd(total)}
              revealed={revealed}
              className="display-hd text-[clamp(3rem,10vw,5.8rem)] tracking-tight text-white"
            />
          )}
        </div>

        {/* Telemetry Status Subtitle */}
        <div className="coord-label mt-2 text-mist-400/90">
          {revealed ? 'CONFIDENTIAL VALUE · ZERO-KNOWLEDGE AUDITED' : 'TOTAL SHIELDED • ENCRYPTED CIPHER'}
        </div>

        {/* Quick Launchpad Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.to}
                to={action.to}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-white/[0.1] bg-gradient-to-b from-ink-900/90 to-ink-950/90 px-4 py-2.5 text-xs font-semibold text-zinc-200 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-mist-400/60 hover:from-mist-600/30 hover:to-indigo-600/20 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.35)] active:scale-98"
              >
                <Icon className="h-3.5 w-3.5 text-mist-400 transition group-hover:text-white" />
                <span>{action.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Protected Token Pills Grid */}
        {!loadingBalances && balances.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {balances.map((b) => (
              <span
                key={b.asset}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-ink-950/70 px-4 py-2 shadow-sm backdrop-blur-xl transition hover:border-mist-500/40 hover:bg-ink-900/90"
              >
                <CoinBadge name={b.asset} size="sm" />
                <span className="font-mono text-sm font-medium text-zinc-200">{b.asset}</span>
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
          <Link
            to="/deposit"
            className="coord-label mt-8 inline-flex items-center gap-2 rounded-xl border border-mist-500/30 bg-mist-600/10 px-4 py-2 text-mist-300 transition hover:border-mist-400 hover:bg-mist-600/20"
          >
            <span>Nothing shielded yet — Cross the veil</span>
            <span aria-hidden>→</span>
          </Link>
        )}

        <div className="mt-12 w-full">
          <ProvenLedger />
        </div>
      </section>

      {/* Feature Modules Launch Deck */}
      <div className="grid gap-5 sm:grid-cols-2">
        {MODULES.map((mod) => {
          const Icon = mod.icon
          return (
            <Link
              key={mod.to}
              to={mod.to}
              className={cx(
                'group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0F1122]/90 to-[#070810]/90 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1',
                mod.glowColor,
              )}
            >
              {/* Subtle top edge glow gradient */}
              <div
                className={cx(
                  'pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                  mod.accentGrad,
                )}
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cx(
                      'flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-ink-950/90 transition-all duration-300 group-hover:scale-105 group-hover:border-white/20',
                      mod.iconTone,
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="coord-label text-mist-300/80">{mod.label}</div>
                </div>
                <span className="rounded-full border border-white/[0.08] bg-ink-950/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-400 group-hover:border-mist-400/40 group-hover:text-mist-200">
                  {mod.tag}
                </span>
              </div>

              <div className="mt-6">
                <h3 className="display-hd text-xl text-zinc-100 transition group-hover:text-white">{mod.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300">{mod.desc}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
                <span className="coord-label text-mist-400 transition group-hover:text-mist-200">Initialize module →</span>
                <SparklesIcon className="h-4 w-4 text-mist-400 opacity-40 transition group-hover:opacity-100 group-hover:scale-110" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Hub
