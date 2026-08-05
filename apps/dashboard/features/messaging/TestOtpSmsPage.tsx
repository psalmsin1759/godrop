'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle2, XCircle, Smartphone } from 'lucide-react'
import { useTestOtpSmsMutation } from '@/store/services/adminApi'

interface Result {
  success: boolean
  message: string
}

function inputCls(extra = '') {
  return `w-full px-3 py-2 text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#0D1426] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] focus:border-[#1E5FFF] transition-colors ${extra}`
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="card p-5 space-y-4">{children}</div>
}

function ResultCard({ result }: { result: Result }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-xs ${
        result.success
          ? 'bg-[#DFF5EC] border-[#A8E6CC] text-[#0E6B49]'
          : 'bg-[#FFE3E1] border-[#FFB3AD] text-[#A13C36]'
      }`}
    >
      {result.success
        ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#0E8E60]" />
        : <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C42B22]" />}
      <p className="font-semibold">{result.message}</p>
    </div>
  )
}

export default function TestOtpSmsPage() {
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  const [testOtpSms, { isLoading: sending }] = useTestOtpSmsMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    try {
      const res = await testOtpSms({ phone: phone.trim() }).unwrap()
      setResult({ success: true, message: res.message })
    } catch (err: any) {
      setResult({ success: false, message: err?.data?.error ?? 'Failed to send test SMS' })
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-[#0D1426]">Test OTP SMS</h1>
        <p className="text-xs text-[#9AA1B4] mt-0.5">
          Send a real SMS in the exact OTP message format to any phone number, to confirm delivery is working —
          this does not create a real login code and can&apos;t be used to sign in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <SectionCard>
          <div className="flex items-start gap-2 bg-[#FBEDD7] border border-[#F6D9A8] rounded-lg px-3 py-2.5">
            <Smartphone className="w-3.5 h-3.5 text-[#FF6A2C] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#8A5A0A]">
              Sends: &ldquo;Your Godrop verification code is XXXXXX. Valid for 10 minutes. Do not share this code.&rdquo;
              — the same copy and provider used for real sign-in OTPs.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#525A72] mb-1">
              Phone number <span className="text-[#FF3B30]">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2348034142290"
              className={inputCls()}
            />
          </div>
        </SectionCard>

        {result && <ResultCard result={result} />}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending || !phone.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60 transition-colors"
            style={{ backgroundColor: '#1E5FFF' }}
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sending ? 'Sending…' : 'Send Test SMS'}
          </button>
        </div>
      </form>
    </div>
  )
}
