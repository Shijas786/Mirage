import FluidVolume from './FluidVolume'

/** The faint coordinate hairlines + geometric Starknet orbital nodes carried behind the app. */
function Coords() {
  const lines = [
    { deg: -15, top: '48%' },
    { deg: 1, top: '56%' },
    { deg: 7.6, top: '64%' },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated rotating STARK constellation rings */}
      <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2">
        <svg
          className="animate-spin-slow opacity-60"
          style={{ width: 'min(86vh, 98vw)', height: 'min(86vh, 98vw)' }}
          viewBox="0 0 1000 1000"
          fill="none"
          aria-hidden
        >
          <circle cx="500" cy="500" r="380" stroke="rgba(99,102,241,0.08)" strokeWidth="1" strokeDasharray="6 14" />
          <circle cx="500" cy="500" r="322" stroke="rgba(99,102,241,0.15)" strokeWidth="1.2" transform="translate(-150 -12)" />
          <circle cx="500" cy="500" r="286" stroke="rgba(236,121,107,0.12)" strokeWidth="1.2" transform="translate(146 22)" />
          <circle cx="500" cy="500" r="180" stroke="rgba(34,211,238,0.08)" strokeWidth="1" strokeDasharray="3 8" />
          
          {/* Starknet starburst node accents */}
          <circle cx="350" cy="488" r="3" fill="rgba(99,102,241,0.8)" />
          <circle cx="646" cy="522" r="3" fill="rgba(236,121,107,0.8)" />
          <circle cx="500" cy="120" r="2" fill="rgba(34,211,238,0.7)" />
          <circle cx="500" cy="880" r="2" fill="rgba(165,180,252,0.6)" />
        </svg>
      </div>

      {/* Crosshair coordinate markers */}
      <div className="absolute left-6 top-20 font-mono text-[9px] text-mist-400/30">
        + 31.7683° N, 35.2137° E [STARK-NET]
      </div>
      <div className="absolute right-6 top-20 font-mono text-[9px] text-mist-400/30">
        [PEDERSEN MERKLE ROOT: 0x4B…9A] +
      </div>
      <div className="absolute bottom-12 left-6 hidden font-mono text-[9px] text-mist-400/30 md:block">
        [ZERO-KNOWLEDGE PRIVACY ENGINE · CAIRO 2.x]
      </div>
      <div className="absolute bottom-12 right-6 hidden font-mono text-[9px] text-mist-400/30 md:block">
        [ANONYMITY SET: UNBOUNDED]
      </div>

      {lines.map((l, i) => (
        <div
          key={i}
          className="absolute left-[-25%] h-px w-[150%]"
          style={{
            top: l.top,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.12) 30%, rgba(34,211,238,0.1) 50%, rgba(236,121,107,0.12) 70%, transparent)',
            transform: `translateY(-50%) rotate(${l.deg}deg)`,
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Ambient brand backdrop for the app surfaces — a Starknet-inspired volumetric fluid aurora
 * running on deep cosmic indigo with subtle film grain and coordinate vectors.
 */
export function BrandCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[#06070B]">
      <div className="absolute inset-0">
        <FluidVolume baseColor="#3730A3" background="#06070B" quality="medium" speed={0.85} />
      </div>
      {/* Starknet indigo cosmic scrim */}
      <div className="absolute inset-0 bg-[#06070B]/70" />
      <div className="mi-grain absolute inset-0 opacity-20" />
      <Coords />
    </div>
  )
}

export default BrandCanvas
