// @ts-nocheck

import { useEffect, useRef, useState } from 'react'
import { useMirage } from '../hooks/useMirage'
import { useProofFlow } from '../hooks/useProofFlow'
import { usePriceQuote } from '../hooks/usePriceQuote'
import { formatAmount, formatPrice, parseAmount } from '../lib/format'
import type { OpenOrder, OrderSide } from '../lib/mirage-sdk'
import { submitIntent } from '../utils/strk20'
import { TOKEN_OPTIONS } from '../lib/tokens'
import { useWallet } from '../hooks/useWallet'
import { cx } from '../lib/cx'
import {
  Badge,
  Button,
  Card,
  ChartIcon,
  ChevronDownIcon,
  CyberCard,
  Field,
  PageIntro,
  SectionHeading,
  Select,
  TextInput,
  ToggleGroup,
  XIcon,
} from './ui'
import { ProofProgress } from './ProofProgress'
import { PriceChart } from './PriceChart'

function timeAgo(timestamp: number): string {
  const mins = Math.max(0, Math.round((Date.now() - timestamp) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  return `${hours}h ago`
}

function OrderRow({
  order,
  canceling,
  onCancel,
}: {
  order: OpenOrder
  canceling: boolean
  onCancel: () => void
}) {
  const buy = order.side === 'buy'
  return (
    <li className="flex items-center gap-4 py-3.5">
      <Badge tone={buy ? 'accent' : 'cyan'} className="uppercase">
        {order.side}
      </Badge>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-100">{order.pair}</div>
        <div className="text-xs text-zinc-500">
          filled {order.filled} / {order.amount} · {timeAgo(order.createdAt)}
        </div>
      </div>
      <div className="ml-auto text-right">
        <div className="font-mono text-sm font-semibold tabular-nums text-zinc-100">
          {order.price} {order.quote}
        </div>
        <div className="text-xs text-zinc-500">
          {order.amount} {order.base}
        </div>
      </div>
      <Button variant="outline" size="sm" loading={canceling} onClick={onCancel}>
        Cancel
      </Button>
    </li>
  )
}

function OrderSkeleton() {
  return (
    <ul className="divide-y divide-white/[0.06]">
      {[0, 1].map((i) => (
        <li key={i} className="flex items-center gap-4 py-3.5">
          <div className="h-6 w-12 animate-pulse rounded-full bg-ink-800" />
          <div className="space-y-2">
            <div className="h-3.5 w-20 animate-pulse rounded bg-ink-800" />
            <div className="h-2.5 w-28 animate-pulse rounded bg-ink-900" />
          </div>
          <div className="ml-auto h-7 w-16 animate-pulse rounded bg-ink-800" />
        </li>
      ))}
    </ul>
  )
}

/** Open orders — a companion panel beside the order form. */
function OpenOrders({
  orders,
  loadingOrders,
  cancelingId,
  onCancel,
  open,
  onToggle,
}: {
  orders: OpenOrder[]
  loadingOrders: boolean
  cancelingId: string | null
  onCancel: (id: string) => void
  open: boolean
  onToggle: () => void
}) {
  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Expand open orders"
        className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-ink-900/60 py-4 transition hover:border-purple-400/40 hover:bg-ink-850/80"
      >
        <ChartIcon className="h-4 w-4 shrink-0 text-purple-400" />
        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 rotate-180 [writing-mode:vertical-rl]">
          Open orders · {orders.length}
        </span>
      </button>
    )
  }

  return (
    <Card className="flex h-full flex-col p-4 shadow-panel backdrop-blur-2xl">
      <div className="mb-2 flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <ChartIcon className="h-4 w-4 text-purple-400" />
          <h3 className="panel-title text-sm">Open Orders</h3>
          <span className="rounded-full bg-purple-500/20 px-2 py-0.2 font-mono text-[10px] text-purple-300">
            {orders.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Collapse open orders"
          className="text-zinc-500 transition hover:text-zinc-200"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loadingOrders ? (
          <OrderSkeleton />
        ) : orders.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-500">No open sealed orders.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                canceling={cancelingId === order.id}
                onCancel={() => void onCancel(order.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

export function Swap({ embedded }: { embedded?: boolean } = {}) {
  const { sdk, orders, loadingOrders, refreshOrders, refreshBalances } = useMirage()
  const { account } = useWallet()
  const proof = useProofFlow()

  const [side, setSide] = useState<OrderSide>('buy')
  const [base, setBase] = useState('STRK')
  const [quote, setQuote] = useState('USDC')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [showChart, setShowChart] = useState(true)
  const [ordersOpen, setOrdersOpen] = useState(true)

  const { price: marketPrice, live: livePrice } = usePriceQuote(base, quote)
  const priceEdited = useRef(false)

  useEffect(() => {
    priceEdited.current = false
  }, [base, quote])

  useEffect(() => {
    if (marketPrice != null && !priceEdited.current) setPrice(formatPrice(marketPrice))
  }, [base, quote, marketPrice])

  function onPriceChange(value: string) {
    priceEdited.current = true
    setPrice(value)
  }

  function useMarketPrice() {
    if (marketPrice == null) return
    priceEdited.current = false
    setPrice(formatPrice(marketPrice))
  }

  const valid = base !== quote && parseAmount(price) > 0 && parseAmount(amount) > 0
  const total = valid ? parseAmount(price) * parseAmount(amount) : 0

  async function onPlace() {
    if (!account) {
      alert('Wallet not connected')
      return
    }
    const result = await proof.run(async () => {
      try {
        const txHash = await submitIntent(account, base, quote, amount)
        console.log('Intent successfully submitted:', txHash)
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    })
    if (result) {
      await refreshOrders()
      await refreshBalances()
    }
  }

  function closeOverlay() {
    const succeeded = proof.status === 'done'
    proof.reset()
    if (succeeded) {
      setPrice('')
      setAmount('')
    }
  }

  async function onCancel(id: string) {
    setCancelingId(id)
    try {
      await sdk.cancelOrder(id)
      await refreshOrders()
      await refreshBalances()
    } finally {
      setCancelingId(null)
    }
  }

  const { balances } = useMirage()

  function flipTokens() {
    const prevBase = base
    const prevQuote = quote
    setBase(prevQuote)
    setQuote(prevBase)
  }

  const relevantAsset = side === 'sell' ? base : quote
  const availableBalance = balances.find((b) => b.asset === relevantAsset)?.amount ?? '0'

  function applyPercentage(pct: number) {
    const balNum = parseFloat(availableBalance)
    if (isNaN(balNum) || balNum <= 0) return
    const calc = ((balNum * pct) / 100).toFixed(4).replace(/\.?0+$/, '')
    setAmount(calc)
  }

  return (
    <div className={embedded ? 'space-y-5' : 'space-y-6'}>
      {!embedded && (
        <PageIntro
          title="Sealed Dark Pool"
          subtitle="Execute confidential midpoint swaps with zero front-running, zero sandwich attacks, and zero MEV leakage."
          badge="DARK DEX · 0-MEV MATCHING"
        />
      )}

      <div className="flex items-stretch justify-center gap-4">
        {/* Price chart sidebar */}
        <div
          className={cx(
            'hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-out lg:block',
            showChart ? 'w-[22rem]' : 'w-12',
          )}
        >
          {showChart ? (
            <Card className="flex h-full flex-col p-4 shadow-panel backdrop-blur-2xl">
              <div className="mb-2 flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <ChartIcon className="h-4 w-4 shrink-0 text-mist-400" />
                  <span className="panel-title whitespace-nowrap text-sm font-semibold">
                    {base} / {quote}
                  </span>
                  {marketPrice != null && (
                    <span className="truncate font-mono text-[11px] font-semibold tabular-nums text-zinc-100">
                      {formatPrice(marketPrice)}
                    </span>
                  )}
                  <span
                    className={cx(
                      'rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider',
                      livePrice ? 'bg-emerald-500/20 text-emerald-300' : 'bg-ink-800 text-zinc-400',
                    )}
                  >
                    {livePrice ? 'LIVE' : 'EST'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChart(false)}
                  aria-label="Hide chart"
                  className="text-zinc-500 transition hover:text-zinc-200"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <PriceChart pair={`${base}/${quote}`} price={marketPrice} />
              </div>
            </Card>
          ) : (
            <button
              type="button"
              onClick={() => setShowChart(true)}
              aria-label="Add chart"
              className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-ink-900/60 py-4 transition hover:border-mist-500/40 hover:bg-ink-850/80"
            >
              <ChartIcon className="h-4 w-4 shrink-0 text-mist-400/80" />
              <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 [writing-mode:vertical-rl]">
                Chart
              </span>
            </button>
          )}
        </div>

        {/* Central swap order card */}
        <CyberCard
          className="w-full shrink-0 self-start p-6 lg:w-[26rem]"
          title="Sealed Dark Order"
          tag="0-MEV Shield"
          icon={<ChartIcon className="h-4.5 w-4.5 text-purple-400" />}
        >
          <div className="relative mb-4 mt-2 flex items-center gap-2">
            <div className="flex-1">
              <Field label="From / Base Asset">
                <Select value={base} onChange={(e) => setBase(e.target.value)} options={TOKEN_OPTIONS} />
              </Field>
            </div>
            <button
              type="button"
              onClick={flipTokens}
              title="Flip tokens"
              aria-label="Flip tokens"
              className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-ink-950 text-mist-400 shadow-sm transition hover:border-mist-400/60 hover:bg-mist-600/20 hover:text-white active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                <path d="M7 16V4m0 0L3 8m4-4 4 4m6 4v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex-1">
              <Field label="To / Quote Asset">
                <Select value={quote} onChange={(e) => setQuote(e.target.value)} options={TOKEN_OPTIONS} />
              </Field>
            </div>
          </div>
          {base === quote && <p className="mb-3 text-xs text-amber-400">Pick two different tokens.</p>}

          <div className="space-y-4">
            <ToggleGroup
              value={side}
              onChange={setSide}
              options={[
                { value: 'buy', label: 'Buy' },
                { value: 'sell', label: 'Sell' },
              ]}
            />
            <Field
              label={`Price (${quote} per ${base})`}
              hint={
                marketPrice != null ? (
                  <span className="flex items-center justify-between font-mono text-[11px]">
                    <span>
                      Market:{' '}
                      <span className="font-semibold text-zinc-200">
                        {formatPrice(marketPrice)}
                      </span>{' '}
                      {quote}
                    </span>
                    <button
                      type="button"
                      onClick={useMarketPrice}
                      className="font-bold text-mist-400 transition hover:text-mist-200"
                    >
                      Use Market Midpoint
                    </button>
                  </span>
                ) : undefined
              }
            >
              <TextInput
                mono
                inputMode="decimal"
                placeholder="0.0000"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
              />
            </Field>

            <Field
              label={`Amount (${base})`}
              hint={
                <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
                  <span>Balance: {availableBalance} {relevantAsset}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      type="button"
                      onClick={() => applyPercentage(25)}
                      className="rounded bg-ink-950 px-1.5 py-0.5 text-zinc-400 hover:bg-mist-600/30 hover:text-white"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPercentage(50)}
                      className="rounded bg-ink-950 px-1.5 py-0.5 text-zinc-400 hover:bg-mist-600/30 hover:text-white"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPercentage(75)}
                      className="rounded bg-ink-950 px-1.5 py-0.5 text-zinc-400 hover:bg-mist-600/30 hover:text-white"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPercentage(100)}
                      className="rounded bg-ink-950 px-1.5 py-0.5 font-bold text-mist-300 hover:bg-mist-600/30 hover:text-white"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              }
            >
              <TextInput
                mono
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-gradient-to-r from-ink-950 to-ink-900 px-4 py-3 text-sm shadow-inner">
              <span className="coord-label text-zinc-400">Est. {side === 'buy' ? 'Cost' : 'Proceeds'}</span>
              <span className="font-mono text-sm font-bold tabular-nums text-zinc-100">
                {formatAmount(total)} {quote}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!valid}
              onClick={() => void onPlace()}
            >
              Place Sealed Dark Order →
            </Button>
          </div>
        </CyberCard>

        {/* Orders list sidebar */}
        <div
          className={cx(
            'hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-out lg:block',
            ordersOpen ? 'w-72' : 'w-12',
          )}
        >
          <OpenOrders
            orders={orders}
            loadingOrders={loadingOrders}
            cancelingId={cancelingId}
            onCancel={onCancel}
            open={ordersOpen}
            onToggle={() => setOrdersOpen((v) => !v)}
          />
        </div>
      </div>

      <ProofProgress
        flow={proof}
        title="Placing sealed order"
        subject={parseAmount(amount) > 0 ? `${amount} ${base}` : undefined}
        onClose={closeOverlay}
      />
    </div>
  )
}
