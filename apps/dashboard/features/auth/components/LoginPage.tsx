'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

function MiniBarChart({ color, bars }: { color: string; bars: number[] }) {
  const maxH = 28
  return (
    <svg width={bars.length * 9} height={maxH} viewBox={`0 0 ${bars.length * 9} ${maxH}`} fill="none">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 9}
          y={maxH - (h / 100) * maxH}
          width="6"
          height={(h / 100) * maxH}
          rx="1.5"
          fill={i === bars.length - 2 ? color : `${color}55`}
        />
      ))}
    </svg>
  )
}

function Character() {
  return (
    <svg width="240" height="350" viewBox="0 0 240 350" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="120" cy="342" rx="52" ry="9" fill="rgba(0,0,0,0.16)" />

      {/* Left shoe */}
      <path d="M82 312 L76 323 Q68 330 66 335 Q64 341 71 343 Q80 345 97 343 Q107 341 108 335 L107 312Z" fill="#1a2336" />
      <ellipse cx="87" cy="338" rx="9" ry="3" fill="#2a3348" opacity="0.6" />

      {/* Right shoe */}
      <path d="M133 312 L132 335 Q133 341 147 343 Q163 345 170 343 Q176 341 173 335 Q171 330 162 323 L154 312Z" fill="#1a2336" />
      <ellipse cx="153" cy="338" rx="9" ry="3" fill="#2a3348" opacity="0.6" />

      {/* Pants left leg */}
      <path d="M84 208 L78 314 L108 314 L114 222Z" fill="#2540c8" />
      {/* Pants right leg */}
      <path d="M156 208 L126 222 L132 314 L162 314 L156 208Z" fill="#2540c8" />
      {/* Pants waist */}
      <rect x="84" y="196" width="72" height="16" rx="2" fill="#2540c8" />
      <line x1="120" y1="198" x2="120" y2="240" stroke="#1c33b0" strokeWidth="1.5" />

      {/* T-shirt */}
      <path d="M84 144 L64 168 L76 175 L84 160 L84 197 L156 197 L156 160 L164 175 L176 168 L156 144 Q142 132 120 130 Q98 132 84 144Z" fill="#f2f2ed" />
      <path d="M84 160 L84 197 L97 197 L97 150Q91 154 84 160Z" fill="#e5e5e0" />

      {/* Left arm */}
      <path d="M84 154 L65 220 L76 225 L93 166" fill="#f0c4a0" />
      <ellipse cx="70" cy="222" rx="8" ry="6" fill="#f0c4a0" />
      <path d="M62 219 Q67 229 76 227" stroke="#daa878" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Right arm + phone */}
      <rect x="154" y="148" width="15" height="58" rx="7" fill="#f0c4a0" />

      {/* Phone body */}
      <rect x="152" y="182" width="38" height="58" rx="6" fill="#1a2336" />
      <rect x="155" y="187" width="32" height="46" rx="3" fill="#3dc7be" />
      <rect x="163" y="185" width="14" height="3" rx="1.5" fill="#1a2336" />
      {/* Screen content */}
      <rect x="158" y="194" width="26" height="2.5" rx="1" fill="white" opacity="0.9" />
      <rect x="158" y="200" width="18" height="2" rx="1" fill="white" opacity="0.55" />
      <rect x="158" y="206" width="22" height="2" rx="1" fill="white" opacity="0.55" />
      <rect x="158" y="212" width="14" height="2" rx="1" fill="white" opacity="0.55" />
      {/* Mini bars on phone screen */}
      <rect x="158" y="218" width="5" height="8" rx="1" fill="white" opacity="0.4" />
      <rect x="165" y="214" width="5" height="12" rx="1" fill="white" opacity="0.75" />
      <rect x="172" y="216" width="5" height="10" rx="1" fill="white" opacity="0.5" />
      <rect x="179" y="212" width="5" height="14" rx="1" fill="white" opacity="0.85" />
      {/* Phone grip */}
      <rect x="150" y="218" width="8" height="28" rx="4" fill="#f0c4a0" />
      <rect x="184" y="218" width="8" height="28" rx="4" fill="#f0c4a0" />

      {/* Neck */}
      <rect x="113" y="114" width="14" height="20" rx="4" fill="#f0c4a0" />

      {/* Head */}
      <ellipse cx="120" cy="84" rx="38" ry="40" fill="#f0c4a0" />

      {/* Hair */}
      <path d="M82 78 Q86 42 120 38 Q154 42 158 78 Q163 58 154 46 Q138 24 120 22 Q102 24 86 46 Q77 58 82 78Z" fill="#1a1a1a" />
      <path d="M82 78 Q78 88 80 98" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
      <path d="M158 78 Q162 88 160 98" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />

      {/* Ears */}
      <ellipse cx="82" cy="88" rx="7" ry="10" fill="#e8b48e" />
      <ellipse cx="158" cy="88" rx="7" ry="10" fill="#e8b48e" />

      {/* Glasses */}
      <circle cx="106" cy="84" r="15" fill="rgba(210,228,255,0.12)" stroke="#1a1a1a" strokeWidth="3" />
      <circle cx="134" cy="84" r="15" fill="rgba(210,228,255,0.12)" stroke="#1a1a1a" strokeWidth="3" />
      <path d="M121 84 L119 84" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M91 80 L83 76" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M149 80 L157 76" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />

      {/* Eyes */}
      <circle cx="106" cy="85" r="6.5" fill="#281608" />
      <circle cx="134" cy="85" r="6.5" fill="#281608" />
      <circle cx="108" cy="82" r="2.5" fill="white" />
      <circle cx="136" cy="82" r="2.5" fill="white" />

      {/* Eyebrows */}
      <path d="M93 71 Q106 66 118 69" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M122 69 Q134 66 147 71" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M116 100 Q120 106 124 100" stroke="#d4946a" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M111 112 Q120 120 129 112" stroke="#b46030" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
   console.log('Attempting login with:', { email, password: '••••••••' })
    const result = await signIn('credentials', { email, password, redirect: false })
    console.log('Login result:', result)
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password. Please try again.')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel: form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-[380px]">

          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-[#3454d1] flex items-center justify-center">
              <span className="text-white text-sm font-bold tracking-tight">G</span>
            </div>
            <span className="text-xl font-bold text-[#283c50]">
              Go<span className="text-[#3454d1]">drop</span>
            </span>
          </div>

          <h1 className="text-[1.9rem] font-bold text-[#283c50] leading-tight">Login</h1>

          <p className="text-sm font-semibold text-[#283c50] mt-5 mb-1.5">
            Login to your account
          </p>
          <p className="text-xs text-[#9ca3af] mb-7 leading-relaxed">
            Welcome to Godrop Operations. Monitor deliveries, riders, and vendors across Lagos in real time.
          </p>

          {error && (
            <div className="flex items-center gap-2.5 text-xs text-[#ea4d4d] bg-[#fdf0f0] border border-[#fca5a5] rounded-lg px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}  className="space-y-3.5">
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@godrop.ng"
              className="w-full px-4 py-3 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#283c50] placeholder:text-[#c4c9cf] focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1] transition-all"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 pr-12 py-3 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#283c50] placeholder:text-[#c4c9cf] focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7885] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-[#6b7885] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#d1d5db] text-[#3454d1] focus:ring-[#3454d1]/20 cursor-pointer"
                />
                Remember Me
              </label>
              <button
                type="button"
                className="text-xs text-[#3454d1] hover:underline font-medium"
              >
                Forget password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 mt-1 rounded-lg text-sm font-bold uppercase tracking-widest text-white bg-[#3454d1] hover:bg-[#2a43a8] transition-colors disabled:opacity-60 shadow-[0_4px_14px_rgba(52,84,209,0.32)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

         

          

         
        </div>
      </div>

      {/* ── Right panel: illustration ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: '#3454d1' }}
      >
        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(255,255,255,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Orb layers */}
        <div
          className="absolute rounded-full"
          style={{ width: 400, height: 400, background: 'rgba(255,255,255,0.13)' }}
        />
        <div
          className="absolute rounded-full"
          style={{ width: 306, height: 306, background: 'rgba(255,255,255,0.10)' }}
        />

        {/* Character */}
        <div className="relative z-10 mt-8">
          <Character />
        </div>

        {/* Floating card: GMV */}
        <div
          className="absolute z-20 bg-white rounded-xl p-3.5 shadow-[0_10px_36px_rgba(0,0,0,0.20)]"
          style={{ top: '20%', right: '9%', minWidth: 152 }}
        >
          <div className="flex items-start justify-between mb-2.5">
            <div>
              <p className="text-[10px] text-[#9ca3af] font-medium leading-none mb-1">
                Today&apos;s GMV
              </p>
              <p className="text-[15px] font-bold text-[#283c50] leading-none">₦682,500</p>
            </div>
            <span className="text-[9px] text-[#17c666] bg-[#e8faf2] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
              +12%
            </span>
          </div>
          <MiniBarChart color="#3454d1" bars={[40, 65, 30, 80, 55, 90, 45]} />
        </div>

        {/* Floating card: Active Orders */}
        <div
          className="absolute z-20 bg-white rounded-xl p-3.5 shadow-[0_10px_36px_rgba(0,0,0,0.20)]"
          style={{ bottom: '20%', left: '8%', minWidth: 152 }}
        >
          <div className="flex items-start justify-between mb-2.5">
            <div>
              <p className="text-[10px] text-[#9ca3af] font-medium leading-none mb-1">
                Active Orders
              </p>
              <p className="text-[15px] font-bold text-[#283c50] leading-none">142 live</p>
            </div>
            <span className="text-[9px] text-[#ffa21d] bg-[#fff6e8] px-1.5 py-0.5 rounded-full font-semibold">
              Live
            </span>
          </div>
          <MiniBarChart color="#ffa21d" bars={[55, 40, 72, 45, 88, 62, 78]} />
        </div>

        {/* Brand footer */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <p
            className="text-[10px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.28)' }}
          >
            Godrop Operations
          </p>
        </div>
      </div>
    </div>
  )
}
