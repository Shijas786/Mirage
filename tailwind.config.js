/** @type {import('tailwindcss').Config} */

// Starknet palette — Deep space / indigo theme
const stark = {
  50: '#F0F4FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1',
  600: '#4F46E5',
  700: '#4338CA',
  750: '#3730A3',
  800: '#181A33',
  850: '#111224',
  900: '#0B0C17',
  950: '#06070B',
}

const halo = {
  DEFAULT: '#A5B4FC',
  soft: '#E0E7FF',
  dim: '#6366F1',
  glow: '#818CF8',
  deep: '#4338CA',
}

// Starknet signature coral & accents
const starknetCoral = {
  DEFAULT: '#EC796B',
  300: '#FFA194',
  400: '#FF8878',
  500: '#EC796B',
  600: '#D95D4E',
}

// Cyber Cyan accent
const cyberCyan = {
  300: '#67E8F9',
  400: '#22D3EE',
  500: '#06B6D4',
  600: '#0891B2',
}

// Accent
const patina = {
  300: '#C084FC',
  400: '#A855F7',
  500: '#9333EA',
}

// Cool text scale
const coolZinc = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
}

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mist: stark,
        halo,
        ink: stark, // alias — existing bg-ink-*/border-ink-* now read cool deep indigo.
        spectral: halo, // alias — existing text-spectral/bg-spectral now read blue.
        coral: starknetCoral,
        cyan: cyberCyan,
        patina,
        zinc: coolZinc,
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        glow: '0 0 25px rgba(99,102,241,0.25)',
        'glow-cyan': '0 0 25px rgba(34,211,238,0.25)',
        'glow-coral': '0 0 25px rgba(236,121,107,0.25)',
        panel: '0 8px 32px 0 rgba(0,0,0,0.5)',
        hair: '0 0 0 1px rgba(99,102,241,0.25)',
        'cyber-border': 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'reverse-spin': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(-1.5%, -2%, 0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'reverse-spin': 'reverse-spin 25s linear infinite',
        drift: 'drift 22s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
