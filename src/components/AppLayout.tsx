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

function ShieldedChip() {
  const { balances, loadingBalances } = useMirage()
  const { revealed, toggle } = useReveal()
  if (loadingBalances || balances.length === 0) return null
  const total = balances.reduce((sum, b) => sum + b.usdEstimate, 0)
  return (
    <div className="hidden items-center gap-2 rounded-xl border border-ink-800 bg-ink-900/70 px-3 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.3)] backdrop-blur-md md:flex">
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
      className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-around rounded-2xl border border-ink-750/90 bg-ink-900/90 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl md:hidden"
    >
      {NAV.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cx(
                'flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition',
                isActive
                  ? 'bg-mist-600/30 text-white shadow-[inset_0_0_0_1px_rgba(99,102,241,0.5)] font-semibold'
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
    <header className="sticky top-0 z-40 border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/app" className="group flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-ink-750 bg-ink-900/90 shadow-[0_0_15px_rgba(99,102,241,0.25)] transition group-hover:border-mist-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.45)]">
            <MirageMark className="h-4 w-4 text-mist-300 transition group-hover:text-white" />
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
              <span className="rounded bg-mist-600/20 px-1 py-0.2 font-mono text-[9px] uppercase tracking-[0.16em] text-mist-300">
                ZK
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist-400/60">Starknet L2</span>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-1 rounded-full border border-ink-800/80 bg-ink-900/70 p-1 font-mono text-[11px] uppercase tracking-[0.14em] backdrop-blur-md md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  'rounded-full px-3.5 py-1.5 transition',
                  isActive
                    ? 'bg-mist-600/30 text-zinc-100 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.4)]'
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
    <footer className="relative mt-auto border-t border-ink-800/80 bg-[#07070E] pb-20 text-zinc-300 md:pb-10">
      <div
        aria-hidden
        className="mi-grain pointer-events-none absolute inset-0 opacity-20"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-750 bg-ink-900 text-mist-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
            <StarknetGlyph className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold tracking-tight text-zinc-100">Mirage Protocol</span>
              <span className="rounded bg-mist-600/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-mist-300">
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
    <div className="relative flex min-h-screen flex-col bg-[#07070E]">
      <BrandCanvas />
      <AppNav />
      <main className="relative flex-1">
        <Outlet />
      </main>
      {/* Deep space cosmic transition to footer */}
      <div
        aria-hidden
        className="pointer-events-none relative h-24"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(7,7,14,0.95))',
        }}
      />
      <AppFooter />
      <MobileNav />
    </div>
  )
}

export default AppLayout
