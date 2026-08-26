import { useState } from 'react'
import { useMirage } from '../hooks/useMirage'
import { useProofFlow } from '../hooks/useProofFlow'
import { TOKEN_OPTIONS } from '../lib/tokens'
import { isPositiveAmount } from '../lib/format'
import type { AssetCode } from '../lib/mirage-sdk'
import { Button, Card, Field, PageIntro, SectionHeading, Select, ShieldIcon, TextInput } from './ui'
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
        <PageIntro title="Pay" subtitle="Send a private payment with the amount and participants hidden on-chain." />
      )}

      <Card className={embedded ? 'p-5' : 'mx-auto max-w-xl p-6'}>
        <SectionHeading icon={<ShieldIcon className="h-4 w-4" />} title="Private transfer" hint="ZK-proven" />
        <div className="mt-5 space-y-4">
          <Field
            label="Recipient code"
            hint="The recipient's Mirage receive code (wr1…) from their Receive screen — the payment is encrypted to it."
          >
            <div className="relative">
              <TextInput
                mono
                placeholder="wr1…"
                value={recipientKey}
                onChange={(e) => setRecipientKey(e.target.value)}
                className="pr-16"
              />
              <button
                type="button"
                onClick={() => void pasteRecipient()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-ink-800 px-2 py-1 font-mono text-[11px] font-semibold text-mist-300 transition hover:bg-ink-750 hover:text-white"
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
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Bal: {availableBalance}</span>
                  <button
                    type="button"
                    onClick={setMax}
                    className="font-mono text-mist-400 hover:text-mist-300"
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

          <div className="rounded-xl border border-ink-800/90 bg-ink-950/60 p-3.5 text-xs text-zinc-400">
            <div className="coord-label mb-1.5 text-mist-400">Privacy Guarantees</div>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                <span>Hidden transfer amount via Pedersen commitments</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                <span>Stealth single-use recipient key prevents transaction linking</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                <span>Proven with STARK curve inside Cairo smart contracts</span>
              </li>
            </ul>
          </div>

          <Button className="w-full" disabled={!valid} onClick={() => void onSend()}>
            Send privately
          </Button>
        </div>
      </Card>

      <ProofProgress
        flow={proof}
        title="Sending private payment"
        subject={isPositiveAmount(amount) ? `${amount} ${asset}` : undefined}
        onClose={closeOverlay}
      />
    </div>
  )
}
