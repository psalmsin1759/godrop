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
          DEFAULT: '#3454d1',
          hover: '#2a43a8',
          light: '#eef1fb',
        },
        secondary: '#64748b',
        success: '#17c666',
        info: '#3dc7be',
        warning: '#ffa21d',
        danger: '#ea4d4d',
        dark: '#283c50',
        darken: '#001327',
        muted: '#6b7885',
        border: '#e5e7eb',
        surface: '#ffffff',
        background: '#f0f2f8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.84rem', { lineHeight: '1.5rem' }],
        base: ['0.84rem', { lineHeight: '1.6' }],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '4px',
        lg: '6px',
        xl: '1rem',
        '2xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05)',
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
