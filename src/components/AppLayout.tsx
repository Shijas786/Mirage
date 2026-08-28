import { NavLink, Outlet } from 'react-router-dom'
import { useMirage } from '../hooks/useMirage'
import { useReveal } from '../hooks/useReveal'
import { clearAllNotes } from '../lib/note-store'
import { formatUsd } from '../lib/format'
import { cx } from '../lib/cx'
import { BrandCanvas } from './BrandCanvas'
import { ConnectWallet } from './ConnectWallet'
import {
  ArrowDownIcon,
  EyeGlyph,
  LockIcon,
  MirageMark,
  ReceiveIcon,
  SendIcon,
  SwapIcon,
  WalletIcon,
} from './ui'
import { StarknetGlyph } from './BrandIcons'
import { ScrambleNumber } from './ScrambleNumber'

interface NavItem {
  label: string
  to: string
  shortLabel?: string
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
}

const NAV: readonly NavItem[] = [
  { label: 'Portfolio', to: '/portfolio', shortLabel: 'Portfolio', icon: WalletIcon },
  { label: 'Deposit / Withdraw', to: '/deposit', shortLabel: 'Deposit', icon: ArrowDownIcon },
  { label: 'Pay', to: '/pay', shortLabel: 'Pay', icon: SendIcon },
  { label: 'Swap', to: '/swap', shortLabel: 'Swap', icon: SwapIcon },
  { label: 'Receive', to: '/receive', shortLabel: 'Receive', icon: ReceiveIcon },
]

function TopTelemetryBar() {
  return (
    <div className="relative z-50 border-b border-white/[0.06] bg-ink-950/90 px-4 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-mist-400/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>STARK Prover Active</span>
          </span>
          <span className="hidden text-zinc-600 sm:inline">|</span>
          <span className="hidden text-mist-300/80 sm:inline">Cairo 2.x Core</span>
          <span className="hidden text-zinc-600 md:inline">|</span>
          <span className="hidden text-zinc-400 md:inline">Merkle Depth: 32</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-cyan-400">Starknet Sepolia L2</span>
          <span className="text-zinc-600">|</span>
          <span className="rounded bg-mist-500/20 px-1 text-mist-200">0-Leakage</span>
        </div>
      </div>
    </div>
  )
}

function ShieldedChip() {
  const { balances, loadingBalances } = useMirage()
  const { revealed, toggle } = useReveal()
  if (loadingBalances || balances.length === 0) return null
  const total = balances.reduce((sum, b) => sum + b.usdEstimate, 0)
  return (
    <div className="hidden items-center gap-2 rounded-xl border border-white/[0.09] bg-gradient-to-r from-ink-900/90 to-ink-850/90 px-3 py-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.4)] backdrop-blur-xl md:flex">
      <LockIcon className="h-3 w-3 text-mist-400" />
      <span className="coord-label text-mist-400">shielded</span>
      <ScrambleNumber value={formatUsd(total)} revealed={revealed} className="font-mono text-sm font-semibold text-zinc-100" />
      <button
        type="button"
        onClick={toggle}
        aria-label={revealed ? 'Hide balance' : 'Reveal balance'}
        className="text-mist-400/70 transition hover:text-mist-300 active:scale-95"
      >
        <EyeGlyph off={!revealed} className="h-4 w-4" />
      </button>
    </div>
  )
}

function MobileNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-around rounded-2xl border border-white/[0.12] bg-[#0B0C17]/90 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:hidden"
    >
      {NAV.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cx(
                'flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-b from-mist-600/30 to-mist-600/15 text-white shadow-[inset_0_0_0_1px_rgba(99,102,241,0.5),0_0_12px_rgba(99,102,241,0.3)] font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-ink-800/40',
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span className="font-mono text-[10px] tracking-tight">{item.shortLabel ?? item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

function AppNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#06070B]/85 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/app" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] bg-gradient-to-br from-ink-900 to-ink-950 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 group-hover:border-mist-400/60 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]">
            <MirageMark className="h-4.5 w-4.5 text-mist-300 transition group-hover:text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mist-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mist-500" />
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-semibold tracking-tight text-zinc-100 transition group-hover:text-white">
                mirage
              </span>
              <span className="rounded bg-gradient-to-r from-mist-600/30 to-cyan-500/20 px-1 py-0.2 font-mono text-[9px] uppercase tracking-[0.16em] text-mist-300 border border-mist-400/20">
                ZK
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist-400/70">Starknet Shield</span>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-ink-950/70 p-1 font-mono text-[11px] uppercase tracking-[0.14em] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  'rounded-full px-3.5 py-1.5 transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-mist-600/35 to-mist-500/25 text-zinc-100 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.5),0_0_15px_rgba(99,102,241,0.25)] font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-ink-800/40',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ShieldedChip />
          <ConnectWallet />
        </div>
      </div>
    </header>
  )
}

function AppFooter() {
  const { refreshBalances } = useMirage()
  async function clearLocalData() {
    const ok = window.confirm(
      'Clear locally-cached shielded notes on this device?\n\nYour wallet stays connected — this only removes the notes/balance stored in this browser. Any on-chain funds tied to older notes stay on-chain.',
    )
    if (!ok) return
    clearAllNotes()
    await refreshBalances()
  }
  return (
    <footer className="relative mt-auto border-t border-white/[0.08] bg-[#06070B] pb-20 text-zinc-300 md:pb-10">
      <div
        aria-hidden
        className="mi-grain pointer-events-none absolute inset-0 opacity-20"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-ink-900 text-mist-400 shadow-[0_0_16px_rgba(99,102,241,0.2)]">
            <StarknetGlyph className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold tracking-tight text-zinc-100">Mirage Protocol</span>
              <span className="rounded border border-mist-500/30 bg-mist-600/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-mist-300">
                Cairo 2.x STARK
              </span>
            </div>
            <p className="mt-0.5 max-w-[22rem] text-xs leading-relaxed text-zinc-400">
              Confidential, unlinkable money on Starknet. Proven with STARK curves — zero knowledge revealed.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
          <NavLink to="/faucet" className="transition hover:text-mist-300">
            Faucet
          </NavLink>
          <a
            href="https://sepolia.voyager.online"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-mist-300"
          >
            Explorer ↗
          </a>
          <button type="button" onClick={() => void clearLocalData()} className="uppercase transition hover:text-mist-300">
            Clear cache
          </button>
          <span className="text-zinc-500">© Mirage 2026</span>
        </div>
      </div>
    </footer>
  )
}

/** Persistent app shell: the BrandCanvas world, router nav and Starknet cosmic footer */
export function AppLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#06070B]">
      <BrandCanvas />
      <TopTelemetryBar />
      <AppNav />
      <main className="relative flex-1">
        <Outlet />
      </main>
      {/* Deep space cosmic transition to footer */}
      <div
        aria-hidden
        className="pointer-events-none relative h-24"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(6,7,11,0.98))',
        }}
      />
      <AppFooter />
      <MobileNav />
    </div>
  )
}

export default AppLayout
