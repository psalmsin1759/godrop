import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E5FFF',
          hover: '#0A3FD1',
          light: '#E7EEFF',
        },
        secondary: '#64748B',
        success: '#1DB980',
        info: '#7A5AE0',
        warning: '#E8930C',
        danger: '#FF3B30',
        orange: '#FF6A2C',
        dark: '#0D1426',
        darken: '#06122E',
        muted: '#525A72',
        border: '#E7EAF1',
        surface: '#ffffff',
        background: '#EDF0F6',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.84rem', { lineHeight: '1.5rem' }],
        base: ['0.84rem', { lineHeight: '1.6' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '11px',
        lg: '14px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(13,30,70,.04), 0 1px 3px -1px rgba(13,30,70,.04)',
        'card-md': '0 1px 2px rgba(13,30,70,.05), 0 5px 18px rgba(13,30,70,.05)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in': { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease both',
        'slide-in': 'slide-in 0.3s ease both',
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default config
