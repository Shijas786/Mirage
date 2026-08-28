import type { ProofFlow } from '../hooks/useProofFlow'
import { cx } from '../lib/cx'
import { Button, CheckIcon, XIcon } from './ui'
import { ScrambleNumber } from './ScrambleNumber'

/**
 * Proof-as-theatre with Starknet cosmic ZK visualization.
 */
export function ProofProgress({
  flow,
  title = 'Generating STARK proof',
  subject,
  onClose,
}: {
  flow: ProofFlow
  title?: string
  subject?: string
  onClose: () => void
}) {
  if (flow.status === 'idle') return null

  const done = flow.status === 'done'
  const errored = flow.status === 'error'
  const running = flow.status === 'running'
  const current = flow.steps[Math.min(flow.step, flow.steps.length - 1)]

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-[#06070B]/95 p-6 backdrop-blur-2xl animate-fade-in">
      {/* Starknet indigo/violet energy field pulsing during proving */}
      {running && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <div
            className="absolute inset-0 animate-pulse rounded-full opacity-50 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.45), rgba(34,211,238,0.25) 40%, rgba(236,121,107,0.15) 70%, transparent)' }}
          />
          <svg className="animate-spin-slow h-full w-full opacity-40" viewBox="0 0 1000 1000" fill="none">
            <circle cx="500" cy="500" r="340" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="8 12" />
            <circle cx="500" cy="500" r="260" stroke="rgba(34,211,238,0.25)" strokeWidth="1.5" strokeDasharray="4 8" />
          </svg>
        </div>
      )}

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        <div className="coord-label mb-8 flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-950/80 px-3 py-1 text-mist-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          Cairo Zero-Knowledge Prover · Starknet L2
        </div>

        {subject ? (
          <ScrambleNumber
            value={subject}
            revealed={done}
            className={cx('display-hd text-4xl sm:text-5xl text-white', errored && 'opacity-60')}
          />
        ) : (
          <div className="display-hd text-3xl sm:text-4xl text-white">{done ? 'Confirmed' : errored ? 'Failed' : title}</div>
        )}

        <div className="mt-8 flex items-center gap-2.5">
          {done ? (
            <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-1.5 text-sm font-semibold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckIcon className="h-4 w-4 text-emerald-400" /> Verified on Starknet L2
            </span>
          ) : errored ? (
            <span className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/15 px-4 py-1.5 text-sm font-semibold text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <XIcon className="h-4 w-4 text-red-400" /> {flow.error ?? 'Proof failed'}
            </span>
          ) : (
            <span className="font-mono text-sm font-semibold text-cyan-300">{current}</span>
          )}
        </div>

        {/* Step progress ticks */}
        <ol className="mt-6 flex items-center gap-2" aria-label="proof progress">
          {flow.steps.map((label, i) => {
            const state = errored && i === flow.step ? 'error' : done || i < flow.step ? 'done' : i === flow.step ? 'active' : 'pending'
            return (
              <li
                key={label}
                title={label}
                className={cx(
                  'h-2 rounded-full transition-all duration-300',
                  state === 'active' ? 'w-10 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]' : 'w-5',
                  state === 'done' && 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
                  state === 'pending' && 'bg-ink-800',
                  state === 'error' && 'w-10 bg-red-400 shadow-[0_0_12px_rgba(239,68,68,0.9)]',
                )}
              />
            )
          })}
        </ol>

        {(done || errored) && (
          <Button className="mt-9 min-w-[8rem]" variant={errored ? 'outline' : 'primary'} onClick={onClose}>
            {errored ? 'Close' : 'Continue →'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default ProofProgress
