import { useState } from 'react'
import { useMirage } from '../hooks/useMirage'
import { useProofFlow } from '../hooks/useProofFlow'
import { TOKEN_OPTIONS } from '../lib/tokens'
import { isPositiveAmount } from '../lib/format'
import type { AssetCode } from '../lib/mirage-sdk'
import { Button, CyberCard, Field, PageIntro, Select, ShieldIcon, TextInput } from './ui'
import { ProofProgress } from './ProofProgress'

export function Pay({ embedded }: { embedded?: boolean } = {}) {
  const { sdk, balances, refreshBalances } = useMirage()
  const proof = useProofFlow()

  const [recipientKey, setRecipientKey] = useState('')
  const [asset, setAsset] = useState<AssetCode>('STRK')
  const [amount, setAmount] = useState('')

  const availableBalance = balances.find((b) => b.asset === asset)?.amount ?? '0'
  const valid = recipientKey.trim().length >= 8 && isPositiveAmount(amount)

  async function pasteRecipient() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setRecipientKey(text.trim())
    } catch {
      /* clipboard unavailable */
    }
  }

  function setMax() {
    setAmount(availableBalance)
  }

  async function onSend() {
    const result = await proof.run(() =>
      sdk.transfer({ recipientKey: recipientKey.trim(), asset, amount }),
    )
    if (result) await refreshBalances()
  }

  function closeOverlay() {
    const succeeded = proof.status === 'done'
    proof.reset()
    if (succeeded) {
      setAmount('')
      setRecipientKey('')
    }
  }

  return (
    <div className={embedded ? 'space-y-5' : 'space-y-6'}>
      {!embedded && (
        <PageIntro
          title="Confidential Pay"
          subtitle="Execute encrypted 2-in / 2-out shielded transfers. Amounts, senders, and receivers stay private inside Cairo circuits."
          badge="STARK 0-LEAK TRANSFER"
        />
      )}

      <CyberCard
        className={embedded ? 'p-5' : 'mx-auto max-w-xl'}
        title="Private STARK Transfer"
        tag="2-in / 2-out ZK"
        icon={<ShieldIcon className="h-4.5 w-4.5 text-cyan-400" />}
      >
        <div className="space-y-4">
          <Field
            label="Recipient Stealth Code"
            hint="The recipient's Mirage stealth cipher (wr1…) from their Receive screen — the payment is encrypted on the Stark curve."
          >
            <div className="relative">
              <TextInput
                mono
                placeholder="wr1…"
                value={recipientKey}
                onChange={(e) => setRecipientKey(e.target.value)}
                className="pr-20 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => void pasteRecipient()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-mist-500/30 bg-mist-600/20 px-2.5 py-1 font-mono text-[10px] font-semibold text-mist-300 transition hover:border-mist-400 hover:bg-mist-600/40 hover:text-white"
              >
                PASTE
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Asset">
              <Select
                value={asset}
                onChange={(e) => setAsset(e.target.value as AssetCode)}
                options={TOKEN_OPTIONS}
              />
            </Field>
            <Field
              label="Amount"
              hint={
                <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
                  <span>Bal: {availableBalance}</span>
                  <button
                    type="button"
                    onClick={setMax}
                    className="font-mono font-bold text-mist-400 transition hover:text-mist-200"
                  >
                    MAX
                  </button>
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
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#090A14] to-[#05060A] p-4 text-xs text-zinc-400 shadow-inner">
            <div className="coord-label mb-2 flex items-center justify-between text-mist-300">
              <span>Cryptographic Privacy Guarantees</span>
              <span className="text-[9px] text-emerald-400">VERIFIED ✓</span>
            </div>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <span>Hidden transfer amount via Pedersen homomorphic commitments</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <span>Stealth single-use recipient key prevents transaction graph linking</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <span>Proven with STARK curve inside Cairo 2.x smart contracts</span>
              </li>
            </ul>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!valid}
            onClick={() => void onSend()}
          >
            Send Privately into Veil →
          </Button>
        </div>
      </CyberCard>

      <ProofProgress
        flow={proof}
        title="Sending private payment"
        subject={isPositiveAmount(amount) ? `${amount} ${asset}` : undefined}
        onClose={closeOverlay}
      />
    </div>
  )
}

