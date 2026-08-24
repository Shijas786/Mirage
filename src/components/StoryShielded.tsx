import type { CSSProperties, ReactNode } from 'react'

const CARD = 'relative rounded-[1.75rem] border border-ink-800/80 px-6 py-10 sm:px-10 sm:py-12 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
const CARD_BG: CSSProperties = { background: 'rgba(17,18,36,0.7)', backdropFilter: 'blur(16px)' }

const BEATS = [
  {
    label: '01 · SHIELDED',
    coord: '[ Pedersen · Merkle ]',
    title: 'seal it in a note',
    body: 'bridge assets in and your balance becomes a Pedersen commitment — a note in a Merkle tree. hold private multi-asset balances; amount and owner stay inside the hash, only the root is ever public.',
  },
  {
    label: '02 · PROVEN',
    coord: '[ CairoVM · STARK ]',
    title: 'prove, don’t reveal',
    body: 'to move, you build a zero-knowledge proof — you own a note, the sums balance, nothing double-spends. no amounts, no addresses leave the circuit. privacy comes from the circuit, not from trust.',
  },
  {
    label: '03 · UNLINKABLE',
    coord: '[ nullifier · spend ]',
    title: 'spend a nullifier, stay unlinkable',
    body: 'every exit is verified inside a Cairo contract over STARK curves before any funds move. a spend reveals only a nullifier, so the old note and the new never link. no valid proof, no funds move.',
  },
]

const MODULES = [
  { k: 'DEPOSIT / WITHDRAW', d: 'assets in — or in from Ethereum, L1-verified on Starknet.', to: '/deposit' },
  { k: 'PORTFOLIO', d: 'private multi-asset balances only you can see.', to: '/portfolio' },
  { k: 'PAY', d: 'confidential payments; amounts and parties hidden.', to: '/pay' },
  { k: 'SWAP', d: 'a zero-knowledge dark pool; orders matched blind.', to: '/swap' },
]

function GeometricDiagram({ type }: { type: 'layers' | 'network' | 'cube' }) {
  if (type === 'layers') {
    return (
      <svg viewBox="0 0 200 200" className="w-full h-auto opacity-80" fill="none" stroke="currentColor">
        <path d="M20 100 L100 60 L180 100 L100 140 Z" strokeWidth="2" className="text-mist-500" strokeDasharray="4 4" />
        <path d="M20 130 L100 90 L180 130 L100 170 Z" strokeWidth="2" className="text-mist-400" />
        <path d="M100 60 L100 90 M20 100 L20 130 M180 100 L180 130 M100 140 L100 170" strokeWidth="1" className="text-mist-600" />
      </svg>
    )
  }
  if (type === 'network') {
    return (
      <svg viewBox="0 0 200 200" className="w-full h-auto opacity-80" fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="40" strokeWidth="2" className="text-mist-400" strokeDasharray="5 5" />
        <circle cx="100" cy="100" r="10" fill="currentColor" className="text-mist-300" />
        <path d="M100 90 L100 50 M110 100 L150 100 M90 100 L50 100 M100 110 L100 150" strokeWidth="2" className="text-mist-500" />
        <circle cx="100" cy="50" r="4" fill="currentColor" className="text-mist-400" />
        <circle cx="150" cy="100" r="4" fill="currentColor" className="text-mist-400" />
        <circle cx="50" cy="100" r="4" fill="currentColor" className="text-mist-400" />
        <circle cx="100" cy="150" r="4" fill="currentColor" className="text-mist-400" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 200 200" className="w-full h-auto opacity-80" fill="none" stroke="currentColor">
      <rect x="60" y="60" width="80" height="80" strokeWidth="2" className="text-mist-500" transform="rotate(45 100 100)" />
      <rect x="70" y="70" width="60" height="60" strokeWidth="2" className="text-mist-400" transform="rotate(45 100 100)" />
      <circle cx="100" cy="100" r="5" fill="currentColor" className="text-mist-300" />
    </svg>
  )
}

function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.18em] ${className}`}>
      {children}
    </div>
  )
}

export function StoryShielded({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="relative w-full overflow-hidden bg-[#0A0910] px-6 py-32 text-mist-200 sm:px-8 md:py-40">
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* intro */}
        <Label>
          <span className="text-mist-400">public ledger</span>
          <span aria-hidden className="text-mist-600">→</span>
          <span className="text-mist-300">shielded layer</span>
        </Label>
        <h2
          className="mt-8 max-w-3xl font-display font-medium lowercase leading-[1.04] tracking-[-0.03em] text-white"
          style={{ fontSize: 'clamp(2rem, 5.4vw, 3.6rem)' }}
        >
          public chains remember everything.{' '}
          <span className="text-mist-500">the shielded layer forgets.</span>
        </h2>

        {/* PUBLIC LEDGER — one card: text + block stack */}
        <div className={`mt-14 md:mt-16 ${CARD}`} style={CARD_BG}>
          <div className="grid grid-cols-1 items-center gap-x-12 gap-y-8 md:grid-cols-[0.82fr_1.18fr]">
            <div className="order-2 max-w-md md:order-1">
              <p className="text-[15px] font-medium leading-relaxed text-mist-300">
                every block on an open chain is permanent, public and linkable — amounts, balances,
                counterparties, readable by anyone with the address, forever. the ledger never forgets.
              </p>
              <Label className="mt-6">
                <span className="whitespace-nowrap text-mist-400">public ledger</span>
                <span className="whitespace-nowrap text-mist-600">[ every block · forever ]</span>
              </Label>
            </div>
            <div className="order-1 mx-auto w-[clamp(240px,40vw,460px)] md:order-2">
              <GeometricDiagram type="layers" />
            </div>
          </div>
        </div>

        {/* SHIELDED CORE — one card: vortex + text */}
        <div className={`mt-8 ${CARD}`} style={CARD_BG}>
          <div className="grid grid-cols-1 items-center gap-x-12 gap-y-8 md:grid-cols-[1fr_1fr]">
            <div className="order-1 mx-auto w-[clamp(220px,34vw,420px)]">
              <GeometricDiagram type="network" />
              <span className="mt-3 block text-center font-mono text-[10px] uppercase tracking-[0.14em] text-mist-500">
                <span className="text-mist-300">shielded core</span> · value drawn in
              </span>
            </div>
            <div className="order-2 max-w-md">
              <h3 className="font-display text-[clamp(1.5rem,3.2vw,2.2rem)] font-medium lowercase leading-[1.08] tracking-[-0.02em] text-white">
                value falls into the pool and disappears.
              </h3>
              <p className="mt-5 text-[15px] font-medium leading-relaxed text-mist-300">
                mirage bridges assets into a shielded layer on Starknet, where value moves behind
                zero-knowledge proofs verified on-chain by Cairo contracts. no valid proof, no funds move.
              </p>
            </div>
          </div>
        </div>

        {/* THE CRYPTOGRAPHY — one card: copy + proof beats */}
        <div className={`mt-8 ${CARD}`} style={CARD_BG}>
          <Label>
            <span className="text-mist-300">the cryptography</span>
            <span className="text-mist-600">[ CairoVM · Pedersen · STARK ]</span>
          </Label>
          <p className="mt-6 max-w-xl text-[15px] font-medium leading-relaxed text-mist-300">
            every move out of the shielded layer is a zero-knowledge proof, checked on-chain inside a
            Cairo contract. privacy comes from the circuit; integrity from the verifier. the math is the lock.
          </p>

          <div className="mt-10 grid grid-cols-1 items-center gap-x-14 gap-y-12 md:mt-12 md:grid-cols-[0.85fr_1.15fr]">
            <div className="order-1 mx-auto w-[clamp(220px,30vw,380px)]">
              <GeometricDiagram type="cube" />
              <span className="mt-3 block text-center font-mono text-[10px] uppercase tracking-[0.14em] text-mist-500">
                <span className="text-mist-300">zero-knowledge</span> · the circuit
              </span>
            </div>

            <div className="order-2 grid grid-cols-1 gap-y-8">
              {BEATS.map((b) => (
                <div key={b.label} className="border-t border-mist-800/60 pt-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 font-mono text-[11px] uppercase tracking-[0.18em]">
                    <span className="text-mist-300">{b.label}</span>
                    <span className="text-mist-500">{b.coord}</span>
                  </div>
                  <h3 className="mt-3 font-display text-[19px] font-medium lowercase leading-[1.1] tracking-[-0.02em] text-white">
                    {b.title}
                  </h3>
                  <p className="mt-3 text-[14px] font-medium leading-relaxed text-mist-400">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* modules + CTA — one card */}
        <div className={`mt-8 ${CARD}`} style={CARD_BG}>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1rem] border border-ink-800 bg-ink-800 sm:grid-cols-4">
            {MODULES.map((m) => (
              <a key={m.k} href={`#${m.to}`} className="group block bg-ink-900/90 px-5 py-7 transition hover:bg-ink-850">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist-300">{m.k}</div>
                <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">{m.d}</p>
                <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-mist-400 transition-colors group-hover:text-mist-200">
                  open →
                </span>
              </a>
            ))}
          </div>
          <button
            onClick={onEnter}
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-mist-500 to-mist-600 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] transition hover:from-mist-400 hover:to-mist-500 hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
          >
            enter the shielded layer →
          </button>
        </div>
      </div>
    </section>
  )
}
