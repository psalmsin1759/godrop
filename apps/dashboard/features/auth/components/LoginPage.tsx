'use client'

import React, { useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'signin' | 'forgot' | 'sent' | 'welcome'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconEyeOpen({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.6 6.2A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.5M6.5 7.6C3.8 9.3 2 12 2 12s3.5 6 10 6c1.4 0 2.7-.3 3.8-.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
      <path d="M4 12l5 5L20 6" stroke="#1DB980" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block w-[18px] h-[18px] rounded-full border-[2.4px] border-white/40 border-t-white animate-spin"
      style={{ animationDuration: '0.7s' }}
    />
  )
}

// ─── Logo mark SVG ───────────────────────────────────────────────────────────

function GodropMark({ size = 26, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3.5A10.5 10.5 0 1 0 24.5 14H14" stroke={color} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M20.5 6.5c1.5 1.6 2.6 3.4 2.6 4.9a2.6 2.6 0 1 1-5.2 0c0-1.5 1.1-3.3 2.6-4.9z" fill="#FFB38A" />
    </svg>
  )
}

// ─── Drop shape SVG ──────────────────────────────────────────────────────────

const Drop = React.forwardRef<SVGSVGElement, { fill: string; className?: string; style?: React.CSSProperties }>(
  function Drop({ fill, className, style }, ref) {
    return (
      <svg ref={ref} className={className} style={style} viewBox="0 0 24 30" fill="none">
        <path d="M12 1c4.5 4.6 8 9.5 8 14a8 8 0 1 1-16 0c0-4.5 3.5-9.4 8-14z" fill={fill} />
      </svg>
    )
  }
)

// ─── Field component ─────────────────────────────────────────────────────────

function Field({
  id, label, icon, type = 'text', placeholder, value, onChange, error, hint,
  right,
}: {
  id: string
  label: string
  icon: React.ReactNode
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  error?: boolean
  hint?: string
  right?: React.ReactNode
}) {
  return (
    <div className="mb-[17px]">
      <label htmlFor={id} className="block text-[12px] font-semibold tracking-[0.3px] text-[#4A5068] mb-[7px]">
        {label}
      </label>
      <div
        className={[
          'relative flex items-center bg-white border-[1.5px] rounded-[13px] transition-all duration-150',
          error
            ? 'border-[#FF3B30] shadow-[0_0_0_4px_rgba(255,59,48,0.12)]'
            : 'border-[#E6E8EF] focus-within:border-[#1E5FFF] focus-within:shadow-[0_0_0_4px_rgba(30,95,255,0.14)]',
        ].join(' ')}
      >
        <span className="flex items-center pl-[14px] text-[#8A90A3]">{icon}</span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={id === 'email' || id === 'remail' ? 'username' : 'current-password'}
          spellCheck={false}
          className="flex-1 border-0 outline-0 bg-transparent font-['Plus_Jakarta_Sans',sans-serif] text-[15px] font-medium text-[#0B1F4A] py-[15px] px-[14px] placeholder:text-[#B6BBCB] placeholder:font-medium"
        />
        {right}
      </div>
      {hint && error && (
        <p className="text-[11.5px] text-[#FF3B30] mt-[6px] font-medium">{hint}</p>
      )}
    </div>
  )
}

// ─── Toggle (remember me) ────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex items-center gap-[10px] cursor-pointer select-none">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className="relative w-[38px] h-[22px] rounded-full transition-colors duration-[180ms]"
        style={{ background: checked ? '#1E5FFF' : '#E6E8EF' }}
        onClick={() => onChange(!checked)}
      >
        <span
          className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-[180ms]"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </span>
      <span className="text-[13.5px] font-semibold text-[#4A5068] whitespace-nowrap">{label}</span>
    </label>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()

  // view state
  const [view, setView] = useState<View>('signin')

  // signin state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [emailErr, setEmailErr] = useState(false)
  const [passErr, setPassErr] = useState(false)
  const [banner, setBanner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  // forgot state
  const [resetEmail, setResetEmail] = useState('')
  const [resetEmailErr, setResetEmailErr] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [sentTo, setSentTo] = useState('')

  // GSAP refs for left panel
  const drop1 = useRef<SVGSVGElement>(null)
  const drop2 = useRef<SVGSVGElement>(null)
  const drop3 = useRef<SVGSVGElement>(null)
  const drop4 = useRef<SVGSVGElement>(null)
  const pingRef = useRef<HTMLSpanElement>(null)
  const glowOrange = useRef<HTMLDivElement>(null)
  const glowBlue = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // floating drops — staggered bob
      gsap.to(drop1.current, { y: -13, duration: 7, ease: 'sine.inOut', repeat: -1, yoyo: true })
      gsap.to(drop2.current, { y: -13, duration: 5.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.6 })
      gsap.to(drop3.current, { y: -13, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.1 })
      gsap.to(drop4.current, { y: -13, duration: 6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.3 })

      // subtle glow pulse
      gsap.to(glowOrange.current, { opacity: 0.7, scale: 1.06, duration: 4, ease: 'sine.inOut', repeat: -1, yoyo: true })
      gsap.to(glowBlue.current, { opacity: 0.85, scale: 1.04, duration: 5.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1 })

      // entrance: stats counter fade-up
      gsap.fromTo(
        statsRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 }
      )
    })
    return () => ctx.revert()
  }, [])

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
  }

  function clearErrors() {
    setBanner(false)
    setEmailErr(false)
    setPassErr(false)
  }

  function triggerShake() {
    setShake(false)
    requestAnimationFrame(() => setShake(true))
    setTimeout(() => setShake(false), 500)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    clearErrors()

    const okEmail = isValidEmail(email)
    const okPass = password.length > 0
    if (!okEmail) setEmailErr(true)
    if (!okPass) setPassErr(true)
    if (!okEmail || !okPass) return

    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)

    if (result?.error) {
      setBanner(true)
      setEmailErr(true)
      setPassErr(true)
      triggerShake()
    } else {
      setView('welcome')
      setTimeout(() => { router.push('/'); router.refresh() }, 1200)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setResetEmailErr(false)
    if (!isValidEmail(resetEmail)) { setResetEmailErr(true); return }
    setResetLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.naijagodrop.com/api/v1'
      await fetch(`${apiUrl}/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      })
    } catch {
      // Swallow errors — always show the sent confirmation to prevent email enumeration
    }
    setResetLoading(false)
    setSentTo(resetEmail.trim())
    setView('sent')
  }

  function goToForgot() {
    setResetEmail(email)
    setResetEmailErr(false)
    setView('forgot')
  }

  function goToSignIn() {
    clearErrors()
    setView('signin')
  }

  const panelVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
  }

  return (
    <div
      className="min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
      style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ══════════════════════════════════════════════════════
          LEFT — BRAND MOTIF PANEL
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden flex flex-col justify-between p-[48px_56px] text-white max-lg:hidden"
        style={{ background: 'linear-gradient(155deg,#1E5FFF 0%,#0A3FD1 55%,#0B1F4A 100%)', isolation: 'isolate' }}
      >
        {/* Glows */}
        <div
          ref={glowOrange}
          className="absolute rounded-full pointer-events-none z-0"
          style={{
            top: -140, right: -120, width: 460, height: 460,
            background: 'radial-gradient(circle, rgba(255,106,44,.55), rgba(255,106,44,0) 68%)',
          }}
        />
        <div
          ref={glowBlue}
          className="absolute rounded-full pointer-events-none z-0"
          style={{
            bottom: -180, left: -140, width: 520, height: 520,
            background: 'radial-gradient(circle, rgba(80,140,255,.7), rgba(80,140,255,0) 70%)',
          }}
        />

        {/* Grid lines */}
        <svg className="absolute inset-0 z-0 opacity-50 w-full h-full" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="600" height="800" fill="url(#g)" />
          <path d="M-20 520 C 160 470, 240 600, 420 540 S 700 520, 720 470" fill="none" stroke="rgba(255,179,138,0.45)" strokeWidth="2" strokeDasharray="7 9" strokeLinecap="round" />
          <path d="M40 200 C 180 250, 300 160, 460 230 S 640 300, 700 260" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" strokeDasharray="5 8" />
        </svg>

        {/* Floating drops */}
        <Drop ref={drop1} fill="#FFB38A" className="absolute z-[2] w-[30px] opacity-90 drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)]" style={{ top: '20%', right: '14%' }} />
        <Drop ref={drop2} fill="#fff" className="absolute z-[2] w-[18px] opacity-60 drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)]" style={{ top: '54%', right: '30%' }} />
        <Drop ref={drop3} fill="#FF6A2C" className="absolute z-[2] w-[40px] opacity-85 drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)]" style={{ top: '72%', right: '10%' }} />
        <Drop ref={drop4} fill="#FFB38A" className="absolute z-[2] w-[14px] opacity-45 drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)]" style={{ top: '33%', right: '44%' }} />

        {/* Map pin */}
        <div className="absolute z-[2]" style={{ top: '60%', right: '20%' }}>
          <span
            ref={pingRef}
            className="absolute rounded-full border-[1.5px] border-[rgba(255,179,138,0.5)]"
            style={{
              left: '50%', top: '50%', width: 60, height: 60,
              marginLeft: -30, marginTop: -30,
              animation: 'ping 3s ease-out infinite',
            }}
          />
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" fill="#FF6A2C" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2.6" fill="#fff" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-[3] flex items-center gap-[13px]">
          <div
            className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.22)', backdropFilter: 'blur(12px)' }}
          >
            <GodropMark size={26} />
          </div>
          <div>
            <div className="text-[23px] font-extrabold tracking-[-0.6px] leading-none">GoDrop</div>
            <div
              className="text-[11px] font-semibold tracking-[2.4px] uppercase mt-[4px]"
              style={{ color: 'rgba(255,255,255,.62)', fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
            >
              Admin Dashboard
            </div>
          </div>
        </div>

        {/* Mid content */}
        <div className="relative z-[3] max-w-[440px]">
          <span
            className="inline-flex items-center gap-[8px] text-[11.5px] font-semibold tracking-[1.4px] uppercase rounded-full px-[13px] py-[7px] mb-[26px]"
            style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              color: 'rgba(255,255,255,.78)',
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.16)',
            }}
          >
            <span className="w-[7px] h-[7px] rounded-full bg-[#1DB980] shadow-[0_0_0_4px_rgba(29,185,128,0.25)]" />
            Network operational
          </span>
          <h1 className="text-[42px] font-extrabold leading-[1.08] tracking-[-1.4px]">
            Run the network<br />that <span style={{ color: '#FFB38A' }}>moves Nigeria.</span>
          </h1>
          <p className="mt-[20px] text-[16px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.74)' }}>
            Dispatch, fleet, merchants and payouts — one dashboard for every drop, across Lagos, Abuja, Port Harcourt and beyond.
          </p>
          <div ref={statsRef} className="flex gap-[30px] mt-[36px]">
            {[
              { n: '18.4', u: 'k', label: 'Drops today' },
              { n: '2,310', u: '', label: 'Riders online' },
              { n: '99.2', u: '%', label: 'On-time rate' },
            ].map(({ n, u, label }) => (
              <div key={label}>
                <div className="flex items-baseline gap-[3px] text-[26px] font-extrabold tracking-[-0.6px]">
                  {n}<span className="text-[14px] font-bold" style={{ color: '#FFB38A' }}>{u}</span>
                </div>
                <div className="text-[12px] font-medium mt-[4px]" style={{ color: 'rgba(255,255,255,.6)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative z-[3] flex items-center gap-[10px] text-[11.5px] tracking-[0.4px]"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", color: 'rgba(255,255,255,.55)' }}
        >
          <span>GoDrop Logistics</span>
          <span className="w-[4px] h-[4px] rounded-full bg-[rgba(255,255,255,0.35)]" />
          <span>Internal tooling</span>
         
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          RIGHT — FORM PANEL
      ══════════════════════════════════════════════════════ */}
      <main className="bg-white flex items-center justify-center p-6 sm:p-[40px] relative min-h-screen lg:min-h-0">
        <motion.div
          className={`w-full max-w-[392px] ${shake ? 'animate-shake' : ''}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-[11px] mb-[34px]">
            <div
              className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shadow-[0_6px_16px_rgba(30,95,255,0.3)]"
              style={{ background: 'linear-gradient(135deg,#1E5FFF 0%,#0A3FD1 100%)' }}
            >
              <GodropMark size={22} />
            </div>
            <div className="text-[19px] font-extrabold tracking-[-0.5px] text-[#0B1F4A]">
              GoDrop <span className="font-bold text-[#8A90A3]">Admin</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ── SIGN IN ── */}
            {view === 'signin' && (
              <motion.div key="signin" variants={panelVariants} initial="enter" animate="center" exit="exit">
                <div className="mb-[30px]">
                  <h2 className="text-[30px] font-extrabold tracking-[-1px] text-[#0B1F4A]">Sign in</h2>
                  <p className="text-[14.5px] text-[#4A5068] mt-[9px] leading-[1.5]">
                    Welcome back. Use your GoDrop admin credentials to continue.
                  </p>
                </div>

                {/* Error banner */}
                <AnimatePresence>
                  {banner && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-[11px] p-[13px_15px] rounded-[13px] mb-[20px]"
                      style={{ background: '#FFF1F0', border: '1px solid #FFD4D1' }}
                    >
                      <svg className="flex-shrink-0 mt-[1px]" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="#C42B22" strokeWidth="1.8" />
                        <path d="M12 7.5v5" stroke="#C42B22" strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1.1" fill="#C42B22" />
                      </svg>
                      <div>
                        <div className="text-[13.5px] font-bold text-[#C42B22]">Incorrect email or password</div>
                        <div className="text-[12.5px] text-[#A13C36] mt-[2px] leading-[1.45]">
                          Double-check your details and try again. Locked out after 5 attempts.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSignIn} noValidate>
                  <Field
                    id="email"
                    label="Work email"
                    icon={<IconMail />}
                    type="email"
                    placeholder="you@godrop.ng"
                    value={email}
                    onChange={(v) => { setEmail(v); clearErrors() }}
                    error={emailErr}
                    hint="Enter a valid email address."
                  />
                  <Field
                    id="password"
                    label="Password"
                    icon={<IconLock />}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(v) => { setPassword(v); clearErrors() }}
                    error={passErr}
                    hint="Password is required."
                    right={
                      <button
                        type="button"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPw(!showPw)}
                        className="flex items-center justify-center w-[46px] h-[46px] text-[#8A90A3] hover:text-[#4A5068] transition-colors flex-shrink-0 border-0 bg-transparent cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPw ? <IconEyeOff /> : <IconEyeOpen />}
                      </button>
                    }
                  />

                  <div className="flex items-center justify-between mt-[6px] mb-[24px]">
                    <Toggle checked={rememberMe} onChange={setRememberMe} label="Remember me" />
                    <button
                      type="button"
                      onClick={goToForgot}
                      className="text-[13.5px] font-bold text-[#1E5FFF] hover:text-[#0A3FD1] transition-colors bg-transparent border-0 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-[9px] h-[54px] rounded-[14px] text-white text-[15.5px] font-bold tracking-[-0.2px] disabled:opacity-85 disabled:cursor-default border-0 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg,#1E5FFF 0%,#0A3FD1 100%)',
                      boxShadow: '0 10px 26px rgba(30,95,255,.32)',
                    }}
                    whileHover={!loading ? { filter: 'brightness(1.05)', boxShadow: '0 14px 32px rgba(30,95,255,.4)' } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    transition={{ duration: 0.15 }}
                  >
                    {loading ? <Spinner /> : <><span>Sign in</span><IconArrow /></>}
                  </motion.button>
                </form>

                <div className="flex items-center gap-[8px] text-[#8A90A3] text-[12px] font-medium mt-[34px] whitespace-nowrap">
                  <IconShield />
                  <span>Authorized personnel only</span>
                 
                </div>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {view === 'forgot' && (
              <motion.div key="forgot" variants={panelVariants} initial="enter" animate="center" exit="exit">
                <button
                  onClick={goToSignIn}
                  className="inline-flex items-center gap-[7px] text-[13.5px] font-bold text-[#4A5068] hover:text-[#0B1F4A] transition-colors bg-transparent border-0 cursor-pointer mb-[22px]"
                >
                  <IconBack /> Back to sign in
                </button>
                <div className="mb-[28px]">
                  <h2 className="text-[30px] font-extrabold tracking-[-1px] text-[#0B1F4A]">Reset password</h2>
                  <p className="text-[14.5px] text-[#4A5068] mt-[9px] leading-[1.5]">
                    Enter your work email and we&apos;ll send a secure link to reset your password.
                  </p>
                </div>
                <form onSubmit={handleReset} noValidate>
                  <Field
                    id="remail"
                    label="Work email"
                    icon={<IconMail />}
                    type="email"
                    placeholder="you@godrop.ng"
                    value={resetEmail}
                    onChange={(v) => { setResetEmail(v); setResetEmailErr(false) }}
                    error={resetEmailErr}
                    hint="Enter a valid email address."
                  />
                  <motion.button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full flex items-center justify-center gap-[9px] h-[54px] rounded-[14px] text-white text-[15.5px] font-bold mt-[6px] disabled:opacity-85 border-0 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg,#1E5FFF 0%,#0A3FD1 100%)',
                      boxShadow: '0 10px 26px rgba(30,95,255,.32)',
                    }}
                    whileHover={!resetLoading ? { filter: 'brightness(1.05)' } : {}}
                    whileTap={!resetLoading ? { scale: 0.98 } : {}}
                  >
                    {resetLoading ? <Spinner /> : 'Send reset link'}
                  </motion.button>
                </form>
                <div className="flex items-center gap-[8px] text-[#8A90A3] text-[12px] font-medium mt-[34px]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  <span>Reset links expire after 30 minutes</span>
                </div>
              </motion.div>
            )}

            {/* ── RESET SENT ── */}
            {view === 'sent' && (
              <motion.div key="sent" variants={panelVariants} initial="enter" animate="center" exit="exit" className="text-center pt-[6px]">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="w-[76px] h-[76px] rounded-[24px] mx-auto mb-[22px] flex items-center justify-center"
                  style={{ background: '#EAF1FF' }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#1E5FFF" strokeWidth="1.7" />
                    <path d="M4 7l8 6 8-6" stroke="#1E5FFF" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <h2 className="text-[26px] font-extrabold tracking-[-0.7px] text-[#0B1F4A]">Check your inbox</h2>
                <p className="text-[14.5px] text-[#4A5068] mt-[10px] leading-[1.55]">
                  We&apos;ve sent a reset link to <strong className="text-[#0B1F4A]">{sentTo}</strong>. Follow it to set a new password.
                </p>
                <div className="mt-[26px]">
                  <button
                    onClick={goToSignIn}
                    className="text-[13.5px] font-bold text-[#1E5FFF] hover:text-[#0A3FD1] transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    Back to sign in
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── WELCOME ── */}
            {view === 'welcome' && (
              <motion.div key="welcome" variants={panelVariants} initial="enter" animate="center" exit="exit" className="text-center pt-[6px]">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                  className="w-[76px] h-[76px] rounded-[24px] mx-auto mb-[22px] flex items-center justify-center"
                  style={{ background: '#E2F7EE' }}
                >
                  <IconCheck />
                </motion.div>
                <h2 className="text-[26px] font-extrabold tracking-[-0.7px] text-[#0B1F4A]">Welcome back</h2>
                <p className="text-[14.5px] text-[#4A5068] mt-[10px] leading-[1.55]">
                  Signing you in to the <strong className="text-[#0B1F4A]">GoDrop Admin Dashboard</strong>…
                </p>
                <div className="mt-[28px] flex justify-center">
                  <Spinner />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* ── Global styles ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes ping {
          0%  { transform: scale(.4); opacity: .9; }
          100%{ transform: scale(1.6); opacity: 0; }
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-5px); }
          40%, 60% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.45s cubic-bezier(.36,.07,.19,.97); }

        @media (max-width: 1024px) {
          .max-lg\\:hidden { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  )
}
