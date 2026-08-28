// @ts-nocheck

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMirage } from '../hooks/useMirage'
import { useEvmWallet } from '../hooks/useEvmWallet'
import { useWallet } from '../hooks/useWallet'
import { addNote, getSpendingKey, loadNotes, markSpent, type StoredNote } from '../lib/note-store'
import { baseUnitsToNumber, toBaseUnits } from '../lib/real-sdk'
import { formatAmount, isPositiveAmount, isValidStarknetAddress, truncateKey } from '../lib/format'
import {
  ETH_LIGHT_CLIENT_ID,
  L1_BRIDGE_ADDRESS,
  USE_MOCK,
  USE_MOCK_BRIDGE,
  MIRAGE_BRIDGE_ID,
} from '../lib/config'
import {
  assetMeta,
  BRIDGED_ASSET_CODES,
  CURATED_TOKENS,
  depositableTokens,
  resolveCustomToken,
  type TokenMeta,
} from '../lib/tokens'
import {
  BRIDGE_TOKENS,
  commitmentHex,
  createBridgeNote,
  type LightClientHead,
  lockOnL1,
  readIsBridged,
  readLightClientHead,
  requestBridgeIn,
  sepoliaTxUrl,
  starknetContractUrl,
} from '../lib/bridge'
import { cx } from '../lib/cx'
import {
  Button,
  Card,
  CheckIcon,
  ChevronDownIcon,
  PageIntro,
  ShieldIcon,
  Spinner,
  TextInput,
  XIcon,
} from './ui'
import { CoinBadge } from './BrandIcons'

// ---------------------------------------------------------------------------
// Endpoints & routing
//
// The Deposit surface moves value between an external Layer-1 (Starknet or Ethereum)
// and the Mirage shielded pool, in either direction:
//   • deposit  = L1 → Mirage   (fund the pool)
//   • withdraw = Mirage → L1   (redeem back out)
// The Mirage side is always fixed; the L1 side is a chain picker.
// ---------------------------------------------------------------------------

type L1 = 'starknet' | 'ethereum'
type Endpoint = L1 | 'mirage'
type Direction = 'deposit' | 'withdraw'

const ENDPOINT_META: Record<Endpoint, { label: string; sub: string; icon: string }> = {
  starknet: { label: 'Starknet', sub: 'Testnet', icon: 'starknet' },
  ethereum: { label: 'Ethereum', sub: 'Sepolia', icon: 'ethereum' },
  mirage: { label: 'Mirage', sub: 'Shielded pool', icon: 'mirage' },
}

const L1_CHAINS: L1[] = ['starknet', 'ethereum']

/** The L1-native token that enters/leaves each external chain (code = CoinBadge name). */
const L1_TOKEN: Record<L1, string> = { starknet: 'STRK', ethereum: 'ETH' }

/** Notes withdrawable back to each chain: bridged notes go to Ethereum, the rest to Starknet. */
function isWithdrawableTo(l1: L1, code: string): boolean {
  const bridged = BRIDGED_ASSET_CODES.includes(code)
  return l1 === 'ethereum' ? bridged : !bridged
}

/** The L1 token a shielded code redeems to on withdraw (bridged -> its L1 form; else itself). */
function l1TokenFor(code: string): string {
  if (code === 'bETH') return 'ETH'
  if (code === 'bUSDC') return 'USDC'
  return code
}

const STEP_LABELS: Record<string, string[]> = {
  'deposit:starknet': ['Submit deposit on Starknet', 'Shielded note minted'],
  'deposit:ethereum': ['Lock on Sepolia', 'Header finalized', 'Inclusion proven', 'Minted on Starknet'],
  'withdraw:starknet': ['Prove ownership (ZK)', 'Released on Starknet'],
  'withdraw:ethereum': ['Prove ownership', 'Burn note on Starknet', 'Unlock authorized', 'Released on Sepolia'],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_U64 = 1n << 64n
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const isEvmAddress = (s: string) => /^0x[0-9a-fA-F]{40}$/.test(s.trim())
const starknetTxUrl = (hash: string) => `https://starknet.expert/explorer/testnet/tx/${hash}`

/** A stored note's amount as a human string (base units -> decimal). */
function noteHuman(n: StoredNote): string {
  const decimals = n.decimals ?? assetMeta(n.assetCode).decimals
  return formatAmount(baseUnitsToNumber(BigInt(n.amount), decimals))
}

async function pollUntil(
  fn: () => Promise<boolean>,
  opts: { intervalMs: number; timeoutMs: number; signal: () => boolean },
): Promise<boolean> {
  const deadline = Date.now() + opts.timeoutMs
  for (;;) {
    if (opts.signal()) return false
    try {
      if (await fn()) return true
    } catch {
      /* transient RPC error — keep polling */
    }
    if (Date.now() > deadline) return false
    await wait(opts.intervalMs)
  }
}

/** A believable, slowly-advancing Sepolia head used when the light client isn't deployed. */
const simulatedHeadBlock = (): bigint =>
  8_900_000n + BigInt(Math.floor(Date.now() / 12_000) % 50_000)

const BRIDGE_CONFIGURED =
  L1_BRIDGE_ADDRESS.toLowerCase() !== '0x0000000000000000000000000000000000000000' &&
  Boolean(ETH_LIGHT_CLIENT_ID) &&
  Boolean(MIRAGE_BRIDGE_ID)

type FlowStatus = 'idle' | 'running' | 'done' | 'error'
type StepState = 'pending' | 'active' | 'done' | 'error'

/** Progress ping for a host surface to dramatize the crossing (Act 01's droplet). */
export interface BridgeProgress {
  step: number
  total: number
  status: FlowStatus
}

function StepRow({ label, state, detail }: { label: string; state: StepState; detail?: ReactNode }) {
  return (
    <li className="flex items-start gap-3.5">
      <span
        className={cx(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
          state === 'done' && 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
          state === 'active' && 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)] animate-pulse',
          state === 'pending' && 'border-white/[0.08] bg-ink-950/80 text-zinc-600',
          state === 'error' && 'border-red-500/50 bg-red-500/15 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
        )}
      >
        {state === 'done' && <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />}
        {state === 'active' && <Spinner className="h-3.5 w-3.5 text-cyan-300" />}
        {state === 'error' && <XIcon className="h-3.5 w-3.5 text-red-400" />}
        {state === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />}
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={cx(
            'text-sm font-medium',
            state === 'pending' ? 'text-zinc-500' : state === 'error' ? 'text-red-300' : 'text-zinc-100',
          )}
        >
          {label}
        </div>
        {detail && <div className="mt-0.5 font-mono text-xs text-zinc-400">{detail}</div>}
      </div>
    </li>
  )
}

function stepStateFor(index: number, step: number, status: FlowStatus): StepState {
  if (status === 'error' && index === step) return 'error'
  if (status === 'done') return 'done'
  if (index < step) return 'done'
  if (index === step && status === 'running') return 'active'
  return 'pending'
}

function TxLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs text-cyan-400 underline-offset-2 transition hover:text-cyan-300 hover:underline"
    >
      {label} ↗
    </a>
  )
}

/** Compact provenance strip — the trusted Ethereum head the bridge verifies against. */
function ProvenanceStrip() {
  const [head, setHead] = useState<LightClientHead | null>(null)
  const simulated = USE_MOCK_BRIDGE || !ETH_LIGHT_CLIENT_ID

  useEffect(() => {
    let cancelled = false
    async function load() {
      const h = simulated
        ? { blockNumber: simulatedHeadBlock(), stateRoot: '0x' as `0x${string}` }
        : await readLightClientHead()
      if (!cancelled) setHead(h)
    }
    void load()
    const id = setInterval(() => void load(), 15_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [simulated])

  return (
    <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-ink-950/60 py-2 text-xs text-zinc-400">
      <ShieldIcon className="h-4 w-4 text-cyan-400" />
      <span>
        Provenance: Ethereum Light Client{' '}
        <span className={cx('font-semibold', simulated ? 'text-amber-400' : 'text-emerald-400')}>
          [{simulated ? 'SIMULATED' : 'LIVE ON-CHAIN'}]
        </span>
        {head && (
          <>
            {' · Head '}
            <span className="font-mono font-semibold text-zinc-200">#{head.blockNumber.toString()}</span>
          </>
        )}
      </span>
    </div>
  )
}

/** Static chain identity (used for the fixed Mirage endpoint). */
function ChainIdentity({ endpoint }: { endpoint: Endpoint }) {
  const m = ENDPOINT_META[endpoint]
  return (
    <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-950/80 px-2.5 py-1 text-xs font-semibold text-zinc-200">
      <CoinBadge name={m.icon} size="sm" />
      {m.label}
      <span className="font-mono text-[10px] text-mist-400">[{m.sub}]</span>
    </span>
  )
}

/** The L1 chain picker (Starknet / Ethereum) shown on the external side. */
function ChainSelect({
  value,
  onChange,
  disabled,
}: {
  value: L1
  onChange: (v: L1) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])
  const m = ENDPOINT_META[value]
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-ink-950/80 px-2.5 py-1 text-xs font-semibold text-zinc-200 transition hover:border-mist-400/50 hover:bg-ink-900 disabled:opacity-60"
      >
        <CoinBadge name={m.icon} size="sm" />
        {m.label}
        <ChevronDownIcon className="h-3.5 w-3.5 text-zinc-400" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-white/[0.12] bg-[#0E1020] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-fade-in">
          {L1_CHAINS.map((c) => {
            const cm = ENDPOINT_META[c]
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c)
                  setOpen(false)
                }}
                className={cx(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition',
                  c === value ? 'bg-mist-600/30 text-zinc-100 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.4)]' : 'text-zinc-300 hover:bg-ink-800/60',
                )}
              >
                <CoinBadge name={cm.icon} size="sm" />
                <span className="font-medium">{cm.label}</span>
                <span className="ml-auto font-mono text-[10px] text-zinc-500">{cm.sub}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** A From / To endpoint panel (identity row + its asset/amount content). */
function EndpointPanel({
  role,
  identity,
  wallet,
  children,
}: {
  role: 'From' | 'To'
  identity: ReactNode
  wallet?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-ink-950/90 to-ink-900/90 p-4 shadow-inner">
      <div className="mb-3 flex items-center justify-between">
        <span className="coord-label text-mist-400">{role}</span>
        <div className="flex items-center gap-2">
          {wallet}
          {identity}
        </div>
      </div>
      {children}
    </div>
  )
}

/** A read-only token chip (icon + code). */
function TokenChip({ code }: { code: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.09] bg-ink-950 px-3 py-2 text-sm font-semibold text-zinc-100 shadow-sm">
      <CoinBadge name={code} size="sm" />
      {code}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Deposit / withdraw widget
// ---------------------------------------------------------------------------

export function Bridge({ embedded, onProgress }: { embedded?: boolean; onProgress?: (p: BridgeProgress) => void } = {}) {
  const { sdk, refreshBalances, identityReady } = useMirage()
  const evm = useEvmWallet()
  const starknet = useWallet()

  const [l1, setL1] = useState<L1>('starknet')
  const [direction, setDirection] = useState<Direction>('deposit')
  const from: Endpoint = direction === 'deposit' ? l1 : 'mirage'
  const to: Endpoint = direction === 'deposit' ? 'mirage' : l1

  const ethToken = BRIDGE_TOKENS.ETH

  // Deposit-from-Starknet token: any curated token (with a SAC here) or a custom SAC address.
  const [depositToken, setDepositToken] = useState<TokenMeta>(() => depositableTokens()[0] ?? CURATED_TOKENS[0]!)
  const [customMode, setCustomMode] = useState(false)
  const [customSac, setCustomSac] = useState('')
  const [customError, setCustomError] = useState<string | null>(null)
  const [resolvingCustom, setResolvingCustom] = useState(false)

  // Resolve a custom token from its SAC address (decimals + symbol) as it's typed.
  useEffect(() => {
    if (!customMode) return
    const sac = customSac.trim()
    if (!/^C[A-Z2-7]{55}$/.test(sac)) return
    let cancelled = false
    setResolvingCustom(true)
    setCustomError(null)
    resolveCustomToken(sac)
      .then((t) => {
        if (!cancelled) setDepositToken(t)
      })
      .catch((e) => {
        if (!cancelled) setCustomError(e instanceof Error ? e.message : 'Could not resolve token.')
      })
      .finally(() => {
        if (!cancelled) setResolvingCustom(false)
      })
    return () => {
      cancelled = true
    }
  }, [customMode, customSac])

  // Withdraw operates on individual notes (the circuit releases a full note, no change),
  // so the user picks a note rather than typing an amount.
  const [withdrawNote, setWithdrawNote] = useState('') // selected note commitment
  const withdrawableNotes =
    direction === 'withdraw'
      ? loadNotes().filter((n) => !n.spent && isWithdrawableTo(l1, n.assetCode) && n.leafIndex !== undefined)
      : []
  const selectedNote = withdrawableNotes.find((n) => n.commitment === withdrawNote) ?? withdrawableNotes[0] ?? null
  const withdrawAmountHuman = selectedNote ? noteHuman(selectedNote) : ''

  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('') // withdraw only: L1 destination

  const [status, setStatus] = useState<FlowStatus>('idle')
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [l1Hash, setL1Hash] = useState<string | null>(null)
  const [starknetHash, setStarknetHash] = useState<string | null>(null)
  const cancelledRef = useRef(false)
  useEffect(() => () => void (cancelledRef.current = true), [])

  const running = status === 'running'
  const amountValid = isPositiveAmount(amount)

  // Token codes shown in the From / To panels.
  const depositCode = l1 === 'starknet' ? depositToken.code : 'ETH'
  const shieldedCode = l1 === 'starknet' ? depositToken.code : 'bETH'
  const fromCode = direction === 'deposit' ? depositCode : selectedNote?.assetCode ?? '—'
  const toCode = direction === 'deposit'
    ? shieldedCode
    : selectedNote
      ? l1TokenFor(selectedNote.assetCode)
      : L1_TOKEN[l1]

  const steps = STEP_LABELS[`${direction}:${l1}`]

  // Additive: let a host surface (Act 01) mirror the crossing. Default no-op — the
  // live Starknet/Ethereum deposit + withdraw paths are byte-for-byte unchanged.
  useEffect(() => {
    onProgress?.({ step, total: steps.length, status })
  }, [step, status, steps.length, onProgress])

  function reset() {
    setStatus('idle')
    setStep(0)
    setError(null)
    setL1Hash(null)
    setStarknetHash(null)
    setAmount('')
    setRecipient('')
  }

  // Withdraw defaults to the connected wallet's own Starknet account.
  function defaultRecipient(dir: Direction, chain: L1): string {
    return dir === 'withdraw' && chain === 'starknet' && starknet.address ? starknet.address : ''
  }

  function selectChain(next: L1) {
    if (running || next === l1) return
    setL1(next)
    reset()
    setRecipient(defaultRecipient(direction, next))
  }

  function flip() {
    if (running) return
    const next: Direction = direction === 'deposit' ? 'withdraw' : 'deposit'
    setDirection(next)
    reset()
    setRecipient(defaultRecipient(next, l1))
  }

  const creditBridgeNote = useCallback(
    async (note: ReturnType<typeof createBridgeNote>) => {
      if (USE_MOCK) await sdk.deposit({ asset: ethToken.assetCode, amount })
      else addNote(note, { assetCode: ethToken.assetCode })
      await refreshBalances()
    },
    [sdk, ethToken.assetCode, amount, refreshBalances],
  )

  // --- deposit / withdraw flows --------------------------------------------

  /** Starknet → Mirage: a native single-tx deposit of the selected token (LIVE). */
  async function runStarknetIn() {
    setStep(0)
    const { hash } = await sdk.deposit({
      asset: depositToken.code,
      amount,
      sac: depositToken.sac,
      decimals: depositToken.decimals,
      native: depositToken.native,
    })
    setStarknetHash(hash)
    setStep(1)
    await refreshBalances()
  }

  /** Ethereum → Mirage: lock on L1, wait for the light client, mint on Starknet. */
  async function runEthIn() {
    const amountBase = (() => {
      try {
        return toBaseUnits(amount, ethToken.decimals)
      } catch {
        return -1n
      }
    })()
    if (amountBase <= 0n) throw new Error('Enter a valid amount.')
    if (amountBase >= MAX_U64) throw new Error('Amount too large for a demo note (must fit 2^64).')

    const note = createBridgeNote({ token: ethToken, amountBase, spendingKey: getSpendingKey() })
    const commitment = commitmentHex(note)

    if (USE_MOCK_BRIDGE) {
      await wait(900); setL1Hash(`0x${commitment.slice(2, 18)}…mock`); setStep(1)
      await wait(1300); setStep(2)
      await wait(1300); setStep(3)
      await wait(1000); await creditBridgeNote(note)
      return
    }

    if (!evm.walletClient || !evm.publicClient || !evm.address) {
      throw new Error('Connect MetaMask on Sepolia first.')
    }
    const { hash, blockNumber } = await lockOnL1({
      walletClient: evm.walletClient,
      publicClient: evm.publicClient,
      account: evm.address,
      token: ethToken,
      amountBase,
      commitment,
    })
    setL1Hash(hash); setStep(1)

    void requestBridgeIn(commitment)
    const finalized = await pollUntil(
      async () => {
        const head = await readLightClientHead()
        return Boolean(head && head.blockNumber >= blockNumber)
      },
      { intervalMs: 10_000, timeoutMs: 6 * 60_000, signal: () => cancelledRef.current },
    )
    if (!finalized) throw new Error('Timed out waiting for the light client to finalize the lock. Is the relayer feeding headers?')
    setStep(2)

    const minted = await pollUntil(() => readIsBridged(commitment).then((b) => b === true), {
      intervalMs: 8_000,
      timeoutMs: 6 * 60_000,
      signal: () => cancelledRef.current,
    })
    if (!minted) throw new Error('Timed out waiting for the mint on Starknet. Is the relayer submitting inclusion proofs?')
    setStep(3)
    await creditBridgeNote(note)
  }

  /** Mirage → Starknet: an in-browser ZK withdraw of one note to a classic Starknet account. */
  async function runStarknetOut() {
    if (!selectedNote) throw new Error('No shielded note to withdraw.')
    setStep(0)
    const { hash } = await sdk.withdraw({
      asset: selectedNote.assetCode,
      amount: noteHuman(selectedNote),
      recipient,
      commitment: selectedNote.commitment,
    })
    setStarknetHash(hash)
    setStep(1)
    await refreshBalances()
  }

  /** Mirage → Ethereum: burn the selected note, unlock the L1 backing (preview). */
  async function runEthOut() {
    if (!USE_MOCK_BRIDGE) {
      throw new Error(
        'Live bridge-out needs the in-browser withdraw prover. Run with VITE_USE_MOCK_BRIDGE=true to preview the burn → unlock flow.',
      )
    }
    if (!selectedNote) throw new Error('No shielded note to withdraw.')
    await wait(1100); setStep(1)
    await wait(1000); setStep(2)
    await wait(1100); setStep(3)
    await wait(900)
    if (USE_MOCK) await sdk.withdraw({ asset: selectedNote.assetCode, amount: noteHuman(selectedNote), recipient })
    else markSpent(selectedNote.commitment)
    await refreshBalances()
  }

  async function run() {
    setError(null); setL1Hash(null); setStarknetHash(null); setStatus('running'); setStep(0)
    cancelledRef.current = false
    try {
      if (direction === 'deposit') {
        if (l1 === 'starknet') await runStarknetIn()
        else await runEthIn()
      } else {
        if (l1 === 'starknet') await runStarknetOut()
        else await runEthOut()
      }
      setStatus('done')
    } catch (err) {
      if (cancelledRef.current) return
      setError(err instanceof Error ? err.message : 'Transfer failed.')
      setStatus('error')
    }
  }

  // --- context-aware primary action ----------------------------------------

  const action: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean } = (() => {
    if (running) return { label: 'Working…', onClick: () => {}, loading: true }
    // Every shielded note is owned by the wallet-derived identity, so a connected
    // Starknet wallet (and its derived key) is required for both directions.
    if (!USE_MOCK && starknet.status !== 'connected')
      return { label: 'Connect Starknet wallet', onClick: () => void starknet.connect() }
    if (!USE_MOCK && !identityReady)
      return { label: 'Preparing shielded identity…', onClick: () => {}, disabled: true }
    if (direction === 'deposit') {
      if (l1 === 'starknet') {
        if (resolvingCustom) return { label: 'Resolving token…', onClick: () => {}, disabled: true }
        if (!depositToken.sac)
          return { label: `${depositToken.code} not available here`, onClick: () => {}, disabled: true }
        if (!amountValid) return { label: 'Enter an amount', onClick: () => {}, disabled: true }
        return { label: `Deposit ${depositToken.code}`, onClick: () => void run() }
      }
      // ethereum deposit
      if (!USE_MOCK_BRIDGE && !BRIDGE_CONFIGURED) return { label: 'Bridge unavailable', onClick: () => {}, disabled: true }
      if (!USE_MOCK_BRIDGE && !evm.isConnected)
        return { label: evm.hasInjected ? 'Connect MetaMask' : 'No injected wallet', onClick: evm.connect, disabled: !evm.hasInjected }
      if (!USE_MOCK_BRIDGE && !evm.isSepolia) return { label: 'Switch to Sepolia', onClick: evm.switchToSepolia }
      if (!amountValid) return { label: 'Enter an amount', onClick: () => {}, disabled: true }
      return { label: 'Deposit', onClick: () => void run() }
    }
    // withdraw
    if (!selectedNote) return { label: 'No shielded note to withdraw', onClick: () => {}, disabled: true }
    const okRecipient = l1 === 'starknet' ? isValidStarknetAddress(recipient) : isEvmAddress(recipient)
    if (!okRecipient) return { label: 'Enter recipient address', onClick: () => {}, disabled: true }
    return { label: 'Withdraw', onClick: () => void run() }
  })()

  // Origin-wallet affordance shown inline in the From panel (EVM origin only).
  const evmWalletChip =
    direction === 'deposit' && l1 === 'ethereum' && !USE_MOCK_BRIDGE && evm.isConnected && evm.address ? (
      <button
        type="button"
        onClick={evm.disconnect}
        className="font-mono text-xs text-zinc-400 hover:text-zinc-200"
        title="Disconnect"
      >
        {truncateKey(evm.address, 4, 4)}
      </button>
    ) : undefined

  const fromIdentity =
    from === 'mirage' ? (
      <ChainIdentity endpoint="mirage" />
    ) : (
      <ChainSelect value={l1} onChange={selectChain} disabled={running} />
    )
  const toIdentity =
    to === 'mirage' ? (
      <ChainIdentity endpoint="mirage" />
    ) : (
      <ChainSelect value={l1} onChange={selectChain} disabled={running} />
    )

  // Starknet withdraw is live (real in-browser ZK proof). Only the Ethereum bridge-out
  // still needs the mock (its L1 unlock isn't wired yet).
  const withdrawGated = direction === 'withdraw' && l1 === 'ethereum' && !USE_MOCK_BRIDGE

  const showTracker = status !== 'idle'

  function stepDetail(i: number): ReactNode {
    if (direction === 'deposit' && l1 === 'ethereum' && i === 0 && l1Hash) {
      return USE_MOCK_BRIDGE ? (
        <span className="font-mono">{l1Hash}</span>
      ) : (
        <TxLink href={sepoliaTxUrl(l1Hash)} label={truncateKey(l1Hash, 8, 6)} />
      )
    }
    if (direction === 'deposit' && l1 === 'ethereum' && i === 3 && status === 'done' && MIRAGE_BRIDGE_ID && !USE_MOCK_BRIDGE) {
      return <TxLink href={starknetContractUrl(MIRAGE_BRIDGE_ID)} label="MirageBridge" />
    }
    if (l1 === 'starknet' && starknetHash && !USE_MOCK) {
      const last = steps.length - 1
      if ((direction === 'deposit' && i === 0) || (direction === 'withdraw' && i === last)) {
        return <TxLink href={starknetTxUrl(starknetHash)} label={truncateKey(starknetHash, 8, 6)} />
      }
    }
    return undefined
  }

  return (
    <div className={embedded ? 'space-y-5' : 'mx-auto max-w-xl space-y-6'}>
      {!embedded && (
        <PageIntro
          title={direction === 'deposit' ? 'Cross Into Veil' : 'Redeem to Layer-1'}
          subtitle="Deposit Starknet/Ethereum assets into zero-knowledge Pedersen notes, or redeem them back out."
          badge="CROSS-CHAIN ZK PORTAL"
        />
      )}

      <CyberCard
        className="p-6"
        title={direction === 'deposit' ? 'Deposit & Mint Shielded Note' : 'Redeem & Burn Shielded Note'}
        tag={direction === 'deposit' ? 'L1 ➔ Mirage ZK' : 'Mirage ZK ➔ L1'}
        icon={<ShieldIcon className="h-4.5 w-4.5 text-cyan-400" />}
      >
        {/* From */}
        <EndpointPanel role="From" identity={fromIdentity} wallet={evmWalletChip}>
          {direction === 'deposit' ? (
            <>
              <div className="flex items-center gap-3">
                <input
                  className="input input-mono flex-1 border-none bg-transparent px-0 font-mono text-2xl font-bold text-zinc-100 placeholder:text-zinc-600 focus:ring-0"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={running}
                />
                {l1 === 'starknet' ? (
                  <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.1] bg-ink-950 px-3 py-2 shadow-sm">
                    <CoinBadge name={customMode ? depositToken.icon : depositCode} size="sm" />
                    <select
                      className="cursor-pointer appearance-none bg-transparent text-sm font-semibold text-zinc-100 focus:outline-none"
                      value={customMode ? '__custom__' : depositToken.code}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === '__custom__') {
                          setCustomMode(true)
                          setCustomError(null)
                        } else {
                          setCustomMode(false)
                          setCustomSac('')
                          setCustomError(null)
                          const t = CURATED_TOKENS.find((c) => c.code === v)
                          if (t) setDepositToken(t)
                        }
                      }}
                      disabled={running}
                    >
                      {CURATED_TOKENS.map((t) => (
                        <option key={t.code} value={t.code} className="bg-ink-850">
                          {t.code}
                          {t.sac ? '' : ' · n/a here'}
                        </option>
                      ))}
                      <option value="__custom__" className="bg-ink-850">
                        Custom…
                      </option>
                    </select>
                  </div>
                ) : (
                  <TokenChip code={String(fromCode)} />
                )}
              </div>
              {direction === 'deposit' && l1 === 'starknet' && customMode && (
                <div className="mt-2 space-y-1">
                  <TextInput
                    mono
                    placeholder="Token SAC address · C…"
                    value={customSac}
                    onChange={(e) => setCustomSac(e.target.value)}
                    disabled={running}
                  />
                  {resolvingCustom && <p className="text-xs text-zinc-400">Resolving token…</p>}
                  {customError && <p className="text-xs text-red-300">{customError}</p>}
                  {!resolvingCustom && !customError && depositToken.sac === customSac.trim() && (
                    <p className="text-xs text-emerald-300">
                      Found {depositToken.code} · {depositToken.decimals} decimals
                    </p>
                  )}
                </div>
              )}
              {direction === 'deposit' && l1 === 'starknet' && !customMode && depositToken.faucet && (
                <p className="mt-2 font-mono text-[11px] text-zinc-400">
                  Need test {depositToken.code}? Mint tokens from the{' '}
                  <a href="#/faucet" className="text-cyan-400 hover:underline">
                    testnet faucet
                  </a>
                  .
                </p>
              )}
            </>
          ) : withdrawableNotes.length > 0 ? (
            <>
              <div className="flex items-center gap-3">
                <div className="input input-mono flex-1 border-none bg-transparent px-0 font-mono text-2xl font-bold text-zinc-100">
                  {withdrawAmountHuman || '0.00'}
                </div>
                <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.1] bg-ink-950 px-3 py-2 shadow-sm">
                  <CoinBadge name={selectedNote?.assetCode ?? '—'} size="sm" />
                  <select
                    className="cursor-pointer appearance-none bg-transparent text-sm font-semibold text-zinc-100 focus:outline-none"
                    value={selectedNote?.commitment ?? ''}
                    onChange={(e) => setWithdrawNote(e.target.value)}
                    disabled={running}
                  >
                    {withdrawableNotes.map((n) => (
                      <option key={n.commitment} value={n.commitment} className="bg-ink-850">
                        {noteHuman(n)} {n.assetCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2 font-mono text-[11px] text-zinc-400">
                Withdraw releases one full shielded note · {withdrawableNotes.length} available
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="input input-mono flex-1 border-none bg-transparent px-0 font-mono text-2xl text-zinc-600">0.00</div>
              <TokenChip code="—" />
            </div>
          )}
        </EndpointPanel>

        {/* Flip direction */}
        <div className="relative my-1 flex h-2 justify-center">
          <button
            type="button"
            onClick={flip}
            disabled={running}
            aria-label="Switch direction"
            className="absolute -top-3.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] bg-gradient-to-br from-ink-900 to-ink-950 text-zinc-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all hover:scale-105 hover:border-mist-400 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M7 4v16m0 0 3-3m-3 3-3-3M17 20V4m0 0 3 3m-3-3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* To */}
        <EndpointPanel role="To" identity={toIdentity}>
          <div className="flex items-center gap-3">
            <div className="input input-mono flex-1 border-none bg-transparent px-0 font-mono text-2xl font-bold text-zinc-300">
              {direction === 'withdraw' ? withdrawAmountHuman || '0.00' : amountValid ? amount : '0.00'}
            </div>
            <TokenChip code={String(toCode)} />
          </div>
          {direction === 'withdraw' && (
            <TextInput
              mono
              className="mt-3"
              placeholder={l1 === 'starknet' ? 'Starknet recipient · 0x…' : 'Ethereum recipient · 0x…'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={running}
            />
          )}
        </EndpointPanel>

        {/* Config warning */}
        {direction === 'deposit' && l1 === 'ethereum' && !USE_MOCK_BRIDGE && !BRIDGE_CONFIGURED && (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            Live bridge addresses are not configured. Set the <span className="font-mono">VITE_*</span> bridge vars, or run with{' '}
            <span className="font-mono font-bold">VITE_USE_MOCK_BRIDGE=true</span>.
          </p>
        )}

        {withdrawGated && (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            Bridge-out to Ethereum isn’t wired for the L1 unlock yet. Preview the burn → unlock flow with{' '}
            <span className="font-mono font-bold">VITE_USE_MOCK_BRIDGE=true</span>.
          </p>
        )}

        <Button
          variant="primary"
          size="lg"
          className="mt-6 w-full"
          onClick={action.onClick}
          disabled={action.disabled}
          loading={action.loading}
        >
          {action.label}
        </Button>

        {l1 === 'ethereum' ? (
          <ProvenanceStrip />
        ) : (
          <p className="mt-4 text-center font-mono text-[11px] text-zinc-400">
            {direction === 'deposit'
              ? 'Funds enter the shielded pool directly on Starknet Testnet.'
              : 'Redeems a shielded note back to a classic Starknet account.'}
          </p>
        )}
      </CyberCard>

      {/* Progress Tracker */}
      {showTracker && (
        <CyberCard
          className="animate-fade-in"
          title={direction === 'deposit' ? 'Shielded Deposit Pipeline' : 'Note Redemption Pipeline'}
          tag={`${ENDPOINT_META[from].label} ➔ ${ENDPOINT_META[to].label}`}
        >
          <ol className="space-y-4">
            {steps.map((label, i) => (
              <StepRow key={label} label={label} state={stepStateFor(i, step, status)} detail={stepDetail(i)} />
            ))}
          </ol>
          {status === 'error' && error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          {status === 'done' && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckIcon className="h-4 w-4 text-emerald-400" />
              {direction === 'deposit' ? (
                <>
                  Shielded {String(toCode)} now visible in{' '}
                  <Link to="/portfolio" className="underline underline-offset-2 transition hover:text-emerald-200">
                    Portfolio
                  </Link>
                  .
                </>
              ) : l1 === 'starknet' ? (
                <>Released to {truncateKey(recipient, 6, 6)} on Starknet.</>
              ) : (
                <>Released to {truncateKey(recipient, 6, 6)} on Sepolia.</>
              )}
            </p>
          )}
          {(status === 'done' || status === 'error') && (
            <Button variant="outline" className="mt-5 w-full" onClick={reset}>
              {direction === 'deposit' ? 'Deposit another note' : 'Withdraw another note'}
            </Button>
          )}
        </CyberCard>
      )}
    </div>
  )
}

export default Bridge
