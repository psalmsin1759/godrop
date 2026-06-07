'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

// ─── Icons ────────────────────────────────────────────────────

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

function IconCheck() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
      <path d="M4 12l5 5L20 6" stroke="#1DB980" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconWarning() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
      <path d="M12 9v4" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.2" fill="#dc2626" />
      <path d="M10.3 4.2L2.5 18A2 2 0 0 0 4.2 21h15.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" stroke="#dc2626" strokeWidth="1.8" strokeLinejoin="round" />
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

function GodropMark({ size = 26, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3.5A10.5 10.5 0 1 0 24.5 14H14" stroke={color} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M20.5 6.5c1.5 1.6 2.6 3.4 2.6 4.9a2.6 2.6 0 1 1-5.2 0c0-1.5 1.1-3.3 2.6-4.9z" fill="#FFB38A" />
    </svg>
  )
}

// ─── Field ────────────────────────────────────────────────────

function Field({
  id, label, icon, type = 'text', placeholder, value, onChange, error, hint, right,
}: {
  id: string; label: string; icon: React.ReactNode; type?: string
  placeholder: string; value: string; onChange: (v: string) => void
  error?: boolean; hint?: string; right?: React.ReactNode
}) {
  return (
    <div className="mb-[17px]">
      <label htmlFor={id} className="block text-[12px] font-semibold tracking-[0.3px] text-[#4A5068] mb-[7px]">
        {label}
      </label>
      <div className={[
        'relative flex items-center bg-white border-[1.5px] rounded-[13px] transition-all duration-150',
        error
          ? 'border-[#FF3B30] shadow-[0_0_0_4px_rgba(255,59,48,0.12)]'
          : 'border-[#E6E8EF] focus-within:border-[#1E5FFF] focus-within:shadow-[0_0_0_4px_rgba(30,95,255,0.14)]',
      ].join(' ')}>
        <span className="flex items-center pl-[14px] text-[#8A90A3]">{icon}</span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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

// ─── Inner component (uses useSearchParams) ───────────────────

function ResetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'form' | 'success' | 'error'>(token ? 'form' : 'error')
  const [errorMsg, setErrorMsg] = useState('')
  const [pwErr, setPwErr] = useState(false)
  const [confirmErr, setConfirmErr] = useState(false)

  const panelVariants = {
    enter: { opacity: 0, y: 16 },
    center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPwErr(false)
    setConfirmErr(false)
    setErrorMsg('')

    let valid = true
    if (password.length < 8) { setPwErr(true); valid = false }
    if (password !== confirm) { setConfirmErr(true); valid = false }
    if (!valid) return

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.naijagodrop.com/api/v1'
      const res = await fetch(`${apiUrl}/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        setErrorMsg(json.error ?? 'The reset link is invalid or has expired.')
        setView('error')
      } else {
        setView('success')
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setView('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-6"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center gap-[11px] mb-[36px] justify-center">
          <div
            className="w-[44px] h-[44px] rounded-[13px] flex items-center justify-center shadow-[0_6px_20px_rgba(30,95,255,0.3)]"
            style={{ background: 'linear-gradient(135deg,#1E5FFF 0%,#0A3FD1 100%)' }}
          >
            <GodropMark size={24} />
          </div>
          <div className="text-[20px] font-extrabold tracking-[-0.5px] text-[#0B1F4A]">
            GoDrop <span className="font-bold text-[#8A90A3]">Admin</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_32px_rgba(0,0,0,0.08)] overflow-hidden">

          {view === 'form' && (
            <motion.div key="form" variants={panelVariants} initial="enter" animate="center">
              {/* Card header stripe */}
              <div
                className="px-[36px] py-[28px]"
                style={{ background: 'linear-gradient(135deg,#1E5FFF,#0A3FD1)' }}
              >
                <h1 className="text-[21px] font-bold text-white m-0 leading-snug">Set a new password</h1>
                <p className="text-[13.5px] mt-[6px] m-0" style={{ color: 'rgba(255,255,255,.75)' }}>
                  Choose a strong password for your admin account.
                </p>
              </div>

              <div className="px-[36px] py-[32px]">
                <form onSubmit={handleSubmit} noValidate>
                  <Field
                    id="new-password"
                    label="New password"
                    icon={<IconLock />}
                    type={showPw ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(v) => { setPassword(v); setPwErr(false) }}
                    error={pwErr}
                    hint="Password must be at least 8 characters."
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="flex items-center justify-center w-[46px] h-[46px] text-[#8A90A3] hover:text-[#4A5068] transition-colors flex-shrink-0 border-0 bg-transparent cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPw ? <IconEyeOff /> : <IconEyeOpen />}
                      </button>
                    }
                  />
                  <Field
                    id="confirm-password"
                    label="Confirm new password"
                    icon={<IconLock />}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(v) => { setConfirm(v); setConfirmErr(false) }}
                    error={confirmErr}
                    hint="Passwords do not match."
                    right={
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="flex items-center justify-center w-[46px] h-[46px] text-[#8A90A3] hover:text-[#4A5068] transition-colors flex-shrink-0 border-0 bg-transparent cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirm ? <IconEyeOff /> : <IconEyeOpen />}
                      </button>
                    }
                  />

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-[9px] h-[54px] rounded-[14px] text-white text-[15.5px] font-bold tracking-[-0.2px] mt-[8px] disabled:opacity-85 disabled:cursor-default border-0 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg,#1E5FFF 0%,#0A3FD1 100%)',
                      boxShadow: '0 10px 26px rgba(30,95,255,.3)',
                    }}
                    whileHover={!loading ? { filter: 'brightness(1.05)' } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? <Spinner /> : 'Set new password'}
                  </motion.button>
                </form>

                <div className="flex items-center gap-[8px] text-[#8A90A3] text-[12px] font-medium mt-[28px]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  <span>Reset links expire after 30 minutes</span>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'success' && (
            <motion.div
              key="success"
              variants={panelVariants}
              initial="enter"
              animate="center"
              className="px-[36px] py-[52px] text-center"
            >
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="w-[76px] h-[76px] rounded-[24px] mx-auto mb-[22px] flex items-center justify-center"
                style={{ background: '#E2F7EE' }}
              >
                <IconCheck />
              </motion.div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.6px] text-[#0B1F4A] mb-[10px]">Password updated</h2>
              <p className="text-[14.5px] text-[#4A5068] leading-[1.55]">
                Your password has been changed successfully.
                Redirecting you to the sign in page…
              </p>
              <div className="mt-[28px] flex justify-center">
                <Spinner />
              </div>
            </motion.div>
          )}

          {view === 'error' && (
            <motion.div
              key="error"
              variants={panelVariants}
              initial="enter"
              animate="center"
              className="px-[36px] py-[52px] text-center"
            >
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="w-[76px] h-[76px] rounded-[24px] mx-auto mb-[22px] flex items-center justify-center"
                style={{ background: '#fef2f2' }}
              >
                <IconWarning />
              </motion.div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.6px] text-[#0B1F4A] mb-[10px]">Link invalid</h2>
              <p className="text-[14.5px] text-[#4A5068] leading-[1.55]">
                {errorMsg || 'This reset link is invalid or has expired. Please request a new one.'}
              </p>
              <motion.button
                onClick={() => router.push('/login')}
                className="mt-[28px] inline-flex items-center justify-center h-[48px] px-[28px] rounded-[12px] text-white text-[14.5px] font-bold border-0 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#1E5FFF 0%,#0A3FD1 100%)' }}
                whileHover={{ filter: 'brightness(1.05)' }}
                whileTap={{ scale: 0.98 }}
              >
                Back to sign in
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[#9ca3af] mt-[24px]">
          © {new Date().getFullYear()} Godrop Technologies Ltd · Lagos, Nigeria
        </p>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}

// ─── Main export (Suspense boundary for useSearchParams) ──────

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="w-8 h-8 rounded-full border-[3px] border-[#1E5FFF]/30 border-t-[#1E5FFF] animate-spin" />
      </div>
    }>
      <ResetPasswordInner />
    </Suspense>
  )
}
