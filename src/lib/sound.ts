// Web Audio API micro-synthesizer for cypherpunk UI sound effects
// Lightweight, zero audio asset dependencies, purely synthesized frequencies.

class SoundFX {
  private ctx: AudioContext | null = null
  private enabled: boolean = false

  constructor() {
    // Check localStorage preference, default to false (unmuted on toggle)
    try {
      this.enabled = localStorage.getItem('mirage_sfx') === 'true'
    } catch {
      this.enabled = false
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public toggle(): boolean {
    this.enabled = !this.enabled
    try {
      localStorage.setItem('mirage_sfx', String(this.enabled))
    } catch {
      // ignore
    }
    if (this.enabled) {
      this.initCtx()
      this.blip()
    }
    return this.enabled
  }

  // Soft high-tech click
  public click() {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04)

    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.04)
  }

  // Futuristic blip / confirmation
  public blip() {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.08)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.08)
  }

  // ZK Proof Generation resonance chord
  public proofDone() {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const freqs = [587.33, 880, 1174.66] // D5, A5, D6 harmonic

    freqs.forEach((f, i) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now + i * 0.04)

      gain.gain.setValueAtTime(0.05, now + i * 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + i * 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now + i * 0.04)
      osc.stop(now + 0.3)
    })
  }

  // Error frequency chirp
  public error() {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.linearRampToValueAtTime(110, now + 0.12)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)
  }
}

export const sfx = new SoundFX()
