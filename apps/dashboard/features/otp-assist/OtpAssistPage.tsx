'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useIssueManualOtpMutation } from '@/store/services/adminApi'
import { KeyRound, ShieldAlert, PhoneCall, Copy, Check } from 'lucide-react'

function inputCls() {
  return 'w-full text-sm rounded border border-[#E7EAF1] bg-[#F7F9FC] px-3 py-2 text-[#0D1426] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]'
}

export default function OtpAssistPage() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.admin?.role === 'SUPER_ADMIN'

  const [phone, setPhone] = useState('')
  const [issueOtp, { isLoading }] = useIssueManualOtpMutation()
  const [result, setResult] = useState<{ phone: string; code: string; expiresIn: number } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#FFE3E1] flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-[#FF3B30]" />
        </div>
        <h1 className="text-base font-bold text-[#0D1426]">Super Admin access required</h1>
        <p className="text-xs text-[#9AA1B4] max-w-sm">
          OTP Assist can bypass phone verification for any account, so it&apos;s restricted to Super Admins only.
        </p>
      </div>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setCopied(false)
    if (phone.trim().length < 8) {
      setError('Enter a valid phone number.')
      return
    }
    try {
      const data = await issueOtp({ phone: phone.trim() }).unwrap()
      setResult(data)
    } catch (err: any) {
      setError(err?.data?.error ?? err?.data?.message ?? 'Failed to issue OTP.')
    }
  }

  function copyCode() {
    if (!result) return
    navigator.clipboard.writeText(result.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-lg font-bold text-[#0D1426] flex items-center gap-2">
          <KeyRound className="w-4.5 h-4.5 text-[#1E5FFF]" /> OTP Assist
        </h1>
        <p className="text-xs text-[#9AA1B4] mt-0.5">
          For customer service call-ins only. Generate a valid verification code for a phone number
          when a user can&apos;t receive the automated SMS, and read it out to them over the phone.
        </p>
      </div>

      <div className="card p-4 flex items-start gap-3 bg-[#FBEDD7] border border-[#F6D9A8]">
        <PhoneCall className="w-4 h-4 text-[#E8930C] shrink-0 mt-0.5" />
        <p className="text-xs text-[#7A5A12]">
          <strong>Before issuing a code:</strong> confirm the caller is phoning FROM the exact phone number
          they are trying to verify. Never read a code out to someone calling from a different number.
        </p>
      </div>

      <form onSubmit={submit} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#525A72] mb-1">Phone number to verify</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+2348001234567"
            className={inputCls()}
          />
        </div>
        {error && <p className="text-xs text-[#FF3B30]">{error}</p>}
        <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center disabled:opacity-60">
          {isLoading ? 'Generating…' : 'Generate OTP'}
        </button>
      </form>

      {result && (
        <div className="card p-5 space-y-3">
          <p className="text-xs text-[#9AA1B4]">
            Code for <span className="font-semibold text-[#0D1426]">{result.phone}</span> — valid for{' '}
            {Math.round(result.expiresIn / 60)} minutes
          </p>
          <div className="flex items-center justify-between rounded-lg border border-[#E7EAF1] bg-[#F7F9FC] px-4 py-3">
            <span className="text-2xl font-mono font-bold tracking-[0.4em] text-[#0D1426]">
              {result.code}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#EDF0F6]"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-[#1DB980]" /> : <Copy className="w-4 h-4 text-[#525A72]" />}
            </button>
          </div>
          <p className="text-[11px] text-[#9AA1B4]">
            Generating a new code invalidates any code previously sent to this number, including the automated SMS.
          </p>
        </div>
      )}
    </div>
  )
}
