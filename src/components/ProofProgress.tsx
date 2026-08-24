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
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-ink-950/92 p-6 backdrop-blur-xl animate-fade-in">
      {/* Starknet indigo/violet energy field pulsing during proving */}
      {running && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35), rgba(124,58,237,0.2) 40%, transparent 70%)' }}
          aria-hidden
        />
      )}

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        <div className="coord-label mb-8 text-mist-400">cairo zero-knowledge proof · starknet testnet</div>

        {subject ? (
          <ScrambleNumber
            value={subject}
            revealed={done}
            className={cx('display-hd text-4xl sm:text-5xl text-zinc-100', errored && 'opacity-60')}
          />
        ) : (
          <div className="display-hd text-3xl sm:text-4xl text-zinc-100">{done ? 'Confirmed' : errored ? 'Failed' : title}</div>
        )}

        <div className="mt-8 flex items-center gap-2.5">
          {done ? (
            <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
              <CheckIcon className="h-4 w-4" /> Verified on Starknet L2
            </span>
          ) : errored ? (
            <span className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1 text-sm font-medium text-red-300">
              <XIcon className="h-4 w-4" /> {flow.error ?? 'Proof failed'}
            </span>
          ) : (
            <span className="text-sm font-medium text-zinc-300">{current}</span>
          )}
        </div>

        {/* step ticks */}
        <ol className="mt-6 flex items-center gap-2" aria-label="proof progress">
          {flow.steps.map((label, i) => {
            const state = errored && i === flow.step ? 'error' : done || i < flow.step ? 'done' : i === flow.step ? 'active' : 'pending'
            return (
              <li
                key={label}
                title={label}
                className={cx(
                  'h-1.5 rounded-full transition-all duration-300',
                  state === 'active' ? 'w-8 bg-mist-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'w-4',
                  state === 'done' && 'bg-emerald-400',
                  state === 'pending' && 'bg-ink-750',
                  state === 'error' && 'w-8 bg-red-400',
                )}
              />
            )
          })}
        </ol>

        {(done || errored) && (
          <Button className="mt-9" variant={errored ? 'outline' : 'primary'} onClick={onClose}>
            {errored ? 'Close' : 'Done'}
          </Button>
        )}
      </div>
    </div>
  )
}
