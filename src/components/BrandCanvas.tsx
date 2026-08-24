import FluidVolume from './FluidVolume'

/** The faint coordinate hairlines + geometric Starknet orbital nodes carried behind the app. */
function Coords() {
  const lines = [
    { deg: -15, top: '52%' },
    { deg: 1, top: '57%' },
    { deg: 7.6, top: '61%' },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute left-1/2 top-[50%]"
        style={{ width: 'min(82vh, 96vw)', height: 'min(82vh, 96vw)', transform: 'translate(-50%, -50%)' }}
        viewBox="0 0 1000 1000"
        fill="none"
        aria-hidden
      >
        <circle cx="500" cy="500" r="322" stroke="rgba(99,102,241,0.12)" strokeWidth="1.1" transform="translate(-150 -12)" />
        <circle cx="500" cy="500" r="286" stroke="rgba(236,121,107,0.10)" strokeWidth="1.1" transform="translate(146 22)" />
        {/* Starknet starburst node accents */}
        <circle cx="350" cy="488" r="2.5" fill="rgba(99,102,241,0.6)" />
        <circle cx="646" cy="522" r="2.5" fill="rgba(236,121,107,0.6)" />
      </svg>
      {lines.map((l, i) => (
        <div
          key={i}
          className="absolute left-[-25%] h-px w-[150%]"
          style={{ top: l.top, background: 'rgba(99,102,241,0.10)', transform: `translateY(-50%) rotate(${l.deg}deg)`, transformOrigin: 'center' }}
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
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[#07070E]">
      <div className="absolute inset-0">
        <FluidVolume baseColor="#3730A3" background="#07070E" quality="medium" speed={0.85} />
      </div>
      {/* Starknet indigo cosmic scrim */}
      <div className="absolute inset-0 bg-[#07070E]/65" />
      <div className="mi-grain absolute inset-0 opacity-25" />
      <Coords />
    </div>
  )
}

export default BrandCanvas
