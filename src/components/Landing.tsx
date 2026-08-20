import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import FluidVolume from './FluidVolume'
import ScrambleCycle from './ScrambleCycle'
import { StoryShielded } from './StoryShielded'
import markUrl from '../assets/mirage-mark.png'

const ROTATING = ['shielded', 'unlinkable', 'verified', 'private', 'yours']

const LINE_STROKE = 'rgba(255,255,255,0.62)'
const CIRCLE_STROKE = 'rgba(239,233,220,0.24)'

/** Two large overlapping circles + three skewed lines + position labels — the
 *  coords background of the monopo.nyc intro, in Mirage's own words. Line and
 *  circle colours are driven by the `--coord-*` vars so they can darken on
 *  scroll against the incoming footer. */
function CoordsBackground() {
  const lines = [
    { deg: -15, top: '52%' },
    { deg: 1, top: '57%' },
    { deg: 7.6, top: '61%' },
  ]
    { r: 240, tx: -150, ty: -12, sides: 6 },
    { r: 200, tx: 146, ty: 22, sides: 6 },
  ]
  
  // A helper to draw a hexagon path instead of a circle
  const hexagonPath = (r: number) => {
    let path = ''
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = 500 + r * Math.cos(angle)
      const y = 500 + r * Math.sin(angle)
      path += (i === 0 ? 'M' : 'L') + x + ' ' + y
    }
    return path + ' Z'
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute left-1/2 top-[52%]"
        style={{ width: 'min(80vh, 92vw)', height: 'min(80vh, 92vw)', transform: 'translate(-50%, -50%)' }}
        viewBox="0 0 1000 1000"
        fill="none"
        aria-hidden
      >
        {circles.map((c, i) => (
          <path
            key={i}
            d={hexagonPath(c.r)}
            stroke="var(--coord-circle)"
            strokeWidth="1.5"
            transform={`translate(${c.tx} ${c.ty})`}
          />
        ))}
      </svg>

      {lines.map((l, i) => (
        <div
          key={i}
          className="absolute left-[-25%] h-px w-[150%]"
          style={{ top: l.top, background: 'var(--coord-line)', transform: `translateY(-50%) rotate(${l.deg}deg)`, transformOrigin: 'center' }}
        />
      ))}

      <ul className="absolute inset-0 font-mono text-[10px] uppercase tracking-[0.14em] text-mist-200/55">
        <li className="absolute left-[5%] top-[45%]">
          <span className="block text-mist-200/80">Testnet</span>
          <span className="block">[ Starknet · STRK20 ]</span>
        </li>
        <li className="absolute right-[5%] top-[38%] text-right">
          <span className="block text-mist-200/80">Proof</span>
          <span className="block">[ Cairo · STARK ]</span>
        </li>
        <li className="absolute bottom-[16%] left-1/2 -translate-x-1/2 text-center">
          <span className="block text-mist-200/80">Shielded</span>
          <span className="block">[ Pedersen · Merkle ]</span>
        </li>
      </ul>
    </div>
  )
}

function Word({ children }: { children: string }) {
  return <span className="inline-block">{children}</span>
}

export function Landing({ onEnter }: { onEnter: () => void }) {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    let raf = 0
    const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)
    const update = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.6)))
      el.style.setProperty('--coord-line', `rgba(${lerp(255, 99, p)},${lerp(255, 102, p)},${lerp(255, 241, p)},0.62)`)
      el.style.setProperty('--coord-circle', `rgba(${lerp(224, 99, p)},${lerp(231, 102, p)},${lerp(255, 241, p)},${(0.24 + 0.26 * p).toFixed(3)})`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="relative w-full bg-[#0A0910] text-[#E0E7FF]">
      <section
        ref={heroRef}
        className="relative min-h-screen w-full overflow-hidden"
        style={{ '--coord-line': LINE_STROKE, '--coord-circle': CIRCLE_STROKE } as CSSProperties}
      >
      {/* Backdrop — monopo.nyc volumetric raymarch (flowing caustic liquid).
          Grain is a separate static overlay; the field's own alpha bleeds the
          bottom edge into the footer cream. */}
      <div className="absolute inset-0">
        <FluidVolume background="#0A0910" baseColor="#3730A3" quality="high" />
      </div>

      {/* Static film grain — fixed noise, does not shimmer. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0.45 0.45 0 -0.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: '90px 90px',
          opacity: 0.6,
        }}
      />

      <CoordsBackground />

      {/* Keep the upper half a touch darker for the white type. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(10,9,16,0.55), rgba(10,9,16,0.12) 42%, transparent 70%)' }}
      />

      {/* Header — fixed, inverts against whatever scrolls behind it. */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="flex items-center justify-between px-8 py-5">
          <a href="#/" className="flex items-center gap-2.5">
            <img src={markUrl} alt="Mirage" className="h-7 w-auto" />
            <span className="font-display text-sm font-semibold tracking-tight text-white">
              mirage <span className="align-super font-mono text-[10px] tracking-[0.2em] text-[#E0E7FF]/60">ZK</span>
            </span>
          </a>
          <nav className="flex items-center gap-8 font-mono text-[11px] uppercase tracking-[0.18em]">
            <a href="#/faucet" className="text-[#E0E7FF]/70 transition hover:text-[#E0E7FF]">
              Faucet
            </a>
            <button onClick={onEnter} className="text-[#E0E7FF]/70 transition hover:text-[#E0E7FF]">
              Enter →
            </button>
          </nav>
        </div>
      </header>

      {/* Hero — two fixed word-lines + one rotating, scrambling line. */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <h1
          className="text-center font-display font-medium uppercase leading-[0.98] tracking-[-0.04em] text-[#E0E7FF]"
          style={{ fontSize: 'clamp(2.6rem, 7.4vw, 5.75rem)', textShadow: '0 2px 30px rgba(10,9,16,0.65)' }}
        >
          <span className="flex flex-wrap justify-center gap-x-[0.26em]">
            <Word>private</Word>
            <Word>money</Word>
          </span>
          <span className="flex flex-wrap justify-center gap-x-[0.26em]">
            <Word>that</Word>
            <Word>stays</Word>
          </span>
          <span className="block text-mist-300">
            <ScrambleCycle words={ROTATING} duration={900} hold={2000} />
          </span>
        </h1>

        <span className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-[#E0E7FF]/55">scroll</span>
      </div>

      {/* Clean seam into the footer: a long, gradual cream wash over the bottom
          (grain, lines and fluid alike) reaching pure #f4efe4 at the boundary so
          the section change is invisible. Below the z-10 content, so the headline
          and `scroll` stay crisp; the ramp stays transparent through their band. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[32rem]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,9,16,0) 0%, rgba(10,9,16,0) 44%, rgba(10,9,16,0.28) 64%, rgba(10,9,16,0.62) 80%, rgba(10,9,16,0.9) 92%, #0A0910 100%)',
        }}
      />
      </section>

      <StoryShielded onEnter={onEnter} />

      <footer className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#0A0910] px-8 py-16 text-mist-200">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0.4 0.4 0 -0.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
            backgroundSize: '90px 90px',
          }}
        />

        <div className="relative flex items-start justify-between">
          <p className="max-w-xs text-[15px] font-medium leading-snug">
            Feel free to reach out if you want private money on Starknet — or simply have a chat.
          </p>
          <img src={markUrl} alt="Mirage" className="h-11 w-auto opacity-80" />
        </div>

        <div className="relative">
          <a
            href="mailto:hello@mirage.starknet"
            className="block font-display font-light uppercase leading-none tracking-[-0.02em] text-mist-300 transition-colors hover:text-mist-100"
            style={{ fontSize: 'clamp(2rem, 8.2vw, 6.5rem)' }}
          >
            hello@mirage.starknet
          </a>
          <div className="mt-6 h-px w-full bg-mist-800/60" />
        </div>

        <div className="relative">
          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <nav className="flex gap-6 font-mono text-[13px] uppercase tracking-[0.14em] text-mist-400">
              <a href="#" className="transition hover:text-mist-200">X</a>
              <a href="#" className="transition hover:text-mist-200">GitHub</a>
              <a href="#" className="transition hover:text-mist-200">Discord</a>
            </nav>

            <div className="grid max-w-2xl grid-cols-1 gap-10 sm:grid-cols-2">
              <div className="max-w-[15rem]">
                <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em]">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                    <polygon points="6.5,0.5 12,3.5 12,9.5 6.5,12.5 1,9.5 1,3.5" stroke="currentColor" />
                  </svg>
                  Open source
                </div>
                <p className="text-[13px] leading-relaxed text-mist-400">
                  Mirage is open source and community-run. We're always looking for cryptographers, Cairo engineers and designers. Reach out with what you'd build.
                </p>
              </div>
              <div className="max-w-[15rem]">
                <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em]">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                    <rect x="2" y="2" width="9" height="9" stroke="currentColor" />
                    <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" />
                  </svg>
                  Security
                </div>
                <p className="text-[13px] leading-relaxed text-mist-400">
                  Found a vulnerability in the circuits or contracts? Disclose it responsibly at security@mirage.starknet — privacy protects everyone.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 flex items-center justify-between border-t border-mist-800/60 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-mist-500">
            <span>© Mirage 2026</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="transition hover:text-mist-300"
            >
              Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
