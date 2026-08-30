import { useState } from 'react'
import { sfx } from '../lib/sound'
import { Button, CopyIcon, CheckIcon, ShieldIcon, SparklesIcon } from './ui'
import { truncateKey } from '../lib/format'

export function ZkSimulator() {
  const [asset, setAsset] = useState('STRK')
  const [amount, setAmount] = useState('100')
  const [isSimulating, setIsSimulating] = useState(false)
  const [commitment, setCommitment] = useState('0x038b7e21a8d0529f7f9810a9c80d44e5912a76f2f980183bce4916a2b8e3a201')
  const [nullifier, setNullifier] = useState('0x06e129fbb342b78619a8603df5a61b8f56e18742b6a909a82463e26cf84386e1')
  const [copied, setCopied] = useState(false)

  const handleSimulate = () => {
    sfx.click()
    setIsSimulating(true)
    setTimeout(() => {
      // Generate randomized simulated Pedersen commitment and nullifier
      const randomHex = () =>
        '0x0' + Array.from({ length: 63 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      setCommitment(randomHex())
      setNullifier(randomHex())
      setIsSimulating(false)
      sfx.proofDone()
    }, 650)
  }

  const handleCopy = async () => {
    sfx.click()
    try {
      await navigator.clipboard.writeText(commitment)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative rounded-2xl border border-white/[0.12] bg-[#0A0C16]/90 p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl cyber-brackets overflow-hidden">
      {/* Glow highlight */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-bold tracking-wider text-white uppercase">
              Interactive ZK Shielding Sandbox
            </h3>
          </div>
          <span className="rounded-full border border-mist-400/30 bg-mist-500/10 px-2.5 py-0.5 font-mono text-[10px] text-mist-300">
            SIMULATE ZERO-KNOWLEDGE
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          See how plaintext assets dissolve into mathematical Pedersen commitments on the STARK curve before entering the Merkle tree.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="coord-label text-mist-400">Token Asset</label>
            <div className="mt-1 flex gap-2">
              {['STRK', 'ETH', 'USDC'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    sfx.click()
                    setAsset(t)
                  }}
                  className={`flex-1 rounded-xl border px-3 py-2 font-mono text-xs font-bold transition ${
                    asset === t
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : 'border-white/[0.08] bg-ink-950/80 text-zinc-400 hover:border-white/[0.2] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="coord-label text-mist-400">Plaintext Amount</label>
            <div className="mt-1 flex items-center rounded-xl border border-white/[0.08] bg-ink-950/80 px-3 py-1.5 focus-within:border-cyan-400/60 shadow-inner">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
                placeholder="Amount"
              />
              <span className="font-mono text-xs font-semibold text-zinc-500">{asset}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="primary"
            className="w-full"
            loading={isSimulating}
            onClick={handleSimulate}
          >
            {isSimulating ? 'Computing STARK Pedersen Hash…' : `Shield ${amount} ${asset} ➔ Mint Note`}
          </Button>
        </div>

        {/* Generated Output */}
        <div className="mt-6 space-y-3 rounded-xl border border-white/[0.08] bg-ink-950/90 p-4 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-cyan-300">
                <ShieldIcon className="h-3.5 w-3.5" /> Pedersen Note Commitment
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-mist-400 hover:text-white transition"
              >
                {copied ? <CheckIcon className="h-3 w-3 text-emerald-400" /> : <CopyIcon className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy Hash'}
              </button>
            </div>
            <p className="mt-1 break-all rounded-lg border border-white/[0.06] bg-[#06070B] p-2.5 font-mono text-[11px] font-semibold text-cyan-200">
              {commitment}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="text-coral-300">Nullifier (Unlinkable Exit Spend Key)</span>
              <span className="text-[10px] text-zinc-500">[Private until spent]</span>
            </div>
            <p className="mt-1 break-all rounded-lg border border-white/[0.06] bg-[#06070B] p-2.5 font-mono text-[11px] font-semibold text-coral-200">
              {truncateKey(nullifier, 12, 10)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
