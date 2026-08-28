import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  SVGProps,
} from 'react'
import { cx } from '../lib/cx'
import type { AssetCode } from '../lib/mirage-sdk'
import { truncateKey } from '../lib/format'
import { CoinBadge, MirageMark } from './BrandIcons'

// The mirage mark lives with the other brand glyphs; re-exported so `import
// { MirageMark } from './ui'` call sites resolve here.
export { MirageMark } from './BrandIcons'

// --- Icons (inherit currentColor) -------------------------------------------

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15V6.5A1.5 1.5 0 0 1 6.5 5H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function EyeGlyph({ off, ...props }: SVGProps<SVGSVGElement> & { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      {off && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
    </svg>
  )
}

export function ArrowDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M12 5v14m0 0 6-6m-6 6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M12 19V5m0 0-6 6m6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 3 5 6v5c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6l-7-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M5 4v16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8" y="11" width="2.5" height="6" rx="1" fill="currentColor" />
      <rect x="13" y="7" width="2.5" height="10" rx="1" fill="currentColor" />
      <rect x="18" y="13" width="2.5" height="4" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <MirageMark className={cx('animate-spin', className)} />
}

export function SwitchVerticalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M7 16V4m0 0L3 8m4-4 4 4m6 4v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364-2.121 2.121M8.757 15.243l-2.121 2.121m12.728 0-2.121-2.121M8.757 8.757 6.636 6.636M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ReceiveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M12 3v13m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SwapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M16 3h5v5M4 20L20.5 3.5M21 16v5h-5M15 15l6 6M4 4l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.5" cy="14" r="1" fill="currentColor" />
    </svg>
  )
}

export function QrCodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 14h2v2h-2zm4 0h3v3h-3zm-4 4h3v3h-3zm4 3h3v-3h-3z" fill="currentColor" />
      <rect x="5.5" y="5.5" width="2" height="2" fill="currentColor" />
      <rect x="16.5" y="5.5" width="2" height="2" fill="currentColor" />
      <rect x="5.5" y="16.5" width="2" height="2" fill="currentColor" />
    </svg>
  )
}

export function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// --- Primitives -------------------------------------------------------------

type ButtonVariant = 'primary' | 'cyber' | 'outline' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'md' | 'sm' | 'lg'
  loading?: boolean
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  cyber: 'btn-cyber',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'btn',
        VARIANT_CLASS[variant],
        size === 'sm' && 'btn-sm',
        size === 'lg' && 'px-5 py-3 text-base font-bold',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function Card({
  className,
  glow = false,
  brackets = false,
  children,
}: {
  className?: string
  glow?: boolean
  brackets?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cx(
        'card',
        glow && 'card-glow',
        brackets && 'cyber-brackets',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CyberCard({
  className,
  title,
  tag,
  icon,
  children,
}: {
  className?: string
  title?: string
  tag?: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <div className={cx('cyber-panel cyber-brackets p-5 sm:p-6', className)}>
      {(title || tag || icon) && (
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-mist-400">{icon}</div>}
            {title && <h3 className="font-display text-sm font-semibold tracking-tight text-zinc-100">{title}</h3>}
          </div>
          {tag && (
            <span className="rounded-md border border-white/[0.08] bg-ink-950/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-mist-300">
              {tag}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: ReactNode
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <div className="mt-1.5 text-xs text-zinc-400">{hint}</div>}
    </div>
  )
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
}

export function TextInput({ mono, className, ...rest }: TextInputProps) {
  return <input className={cx('input', mono && 'input-mono', className)} {...rest} />
}

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[]
}

export function Select({ options, className, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select className={cx('input cursor-pointer appearance-none pr-9', className)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-850 text-zinc-100">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
    </div>
  )
}

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'coral' | 'cyan'

const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: 'bg-ink-800/80 text-zinc-300 border border-white/[0.08]',
  accent: 'bg-mist-600/20 text-mist-300 border border-mist-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]',
  cyan: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)]',
  coral: 'bg-[#EC796B]/15 text-[#FFA194] border border-[#EC796B]/30 shadow-[0_0_10px_rgba(236,121,107,0.15)]',
  success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
  warn: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
  danger: 'bg-red-500/15 text-red-300 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}) {
  return <span className={cx('badge font-mono text-[10px] tracking-wide', BADGE_TONE[tone], className)}>{children}</span>
}

export function AssetAvatar({ code, className }: { code: AssetCode; className?: string }) {
  return <CoinBadge name={code} size="lg" className={className} />
}

export function PageIntro({
  title,
  subtitle,
  badge = 'STARKNET ZK POOL',
}: {
  title: string
  subtitle: string
  badge?: string
}) {
  return (
    <div className="relative mb-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="coord-label flex items-center gap-1.5 text-mist-400">
          <span className="h-1.5 w-1.5 rounded-full bg-mist-400" />
          {badge}
        </span>
      </div>
      <h1 className="display-hd text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">{subtitle}</p>
    </div>
  )
}

export function SectionHeading({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode
  title: string
  hint?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-mist-400">{icon}</span>}
        <h2 className="panel-title">{title}</h2>
      </div>
      {hint && <span className="font-mono text-xs text-zinc-400">{hint}</span>}
    </div>
  )
}

interface ToggleOption<T extends string> {
  value: T
  label: string
  activeClassName?: string
}

export function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: ToggleOption<T>[]
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-ink-950/80 p-1">
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cx(
              'rounded-lg py-2 text-sm font-semibold transition-all duration-200',
              active
                ? (option.activeClassName ??
                    'bg-gradient-to-r from-mist-600/40 to-mist-500/30 text-zinc-100 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.5),0_0_12px_rgba(99,102,241,0.25)]')
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-ink-850/50',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function TxBanner({
  status,
  hash,
  error,
  successLabel,
}: {
  status: 'idle' | 'pending' | 'done' | 'error'
  hash: string | null
  error: string | null
  successLabel: string
}) {
  if (status === 'done' && hash) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-fade-in">
        <CheckIcon className="h-4 w-4 shrink-0 text-emerald-400" />
        <span>{successLabel}</span>
        <span className="ml-auto font-mono text-xs text-emerald-400/80">{truncateKey(hash, 6, 6)}</span>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-fade-in">
        {error ?? 'Transaction failed.'}
      </div>
    )
  }
  return null
}
