'use client'

import { useState } from 'react'
import {
  Send, Loader2, CheckCircle2, XCircle, Mail, Users, User, Radio,
} from 'lucide-react'
import {
  useSendEmailSingleMutation,
  useSendEmailBatchMutation,
  useSendEmailAllCustomersMutation,
} from '@/store/services/messagingApi'

type Mode = 'single' | 'batch' | 'all-customers'

interface Result {
  success: boolean
  message: string
  sent?: number
  failed?: number
  total?: number
}

function inputCls(extra = '') {
  return `w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#3454d1] focus:border-[#3454d1] transition-colors ${extra}`
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="card p-5 space-y-4">{children}</div>
}

function ResultCard({ result }: { result: Result }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-xs ${
        result.success
          ? 'bg-[#f0fdf4] border-[#86efac] text-[#166534]'
          : 'bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]'
      }`}
    >
      {result.success
        ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#16a34a]" />
        : <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#dc2626]" />}
      <div className="space-y-1">
        <p className="font-semibold">{result.message}</p>
        {result.sent !== undefined && (
          <p className="text-[11px] opacity-80">
            {result.sent} sent · {result.failed} failed · {result.total} total
          </p>
        )}
      </div>
    </div>
  )
}

export default function EmailPage() {
  const [mode, setMode] = useState<Mode>('single')
  const [to, setTo] = useState('')
  const [emails, setEmails] = useState('')
  const [subject, setSubject] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  const [sendSingle, { isLoading: sendingSingle }] = useSendEmailSingleMutation()
  const [sendBatch, { isLoading: sendingBatch }] = useSendEmailBatchMutation()
  const [sendAll, { isLoading: sendingAll }] = useSendEmailAllCustomersMutation()

  const sending = sendingSingle || sendingBatch || sendingAll

  function reset() {
    setTo('')
    setEmails('')
    setSubject('')
    setBodyText('')
    setResult(null)
  }

  const htmlBody = bodyText
    .split('\n')
    .map((line) => `<p style="margin:0 0 10px;font-size:14px;color:#374151;line-height:1.6;">${line || '&nbsp;'}</p>`)
    .join('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    try {
      let res: any
      const base = { subject, html: htmlBody, text: bodyText }
      if (mode === 'single') {
        res = await sendSingle({ ...base, to }).unwrap()
      } else if (mode === 'batch') {
        res = await sendBatch({ ...base, emails }).unwrap()
      } else {
        res = await sendAll(base).unwrap()
      }
      setResult({ success: true, message: res.message, sent: res.sent, failed: res.failed, total: res.total })
    } catch (err: any) {
      setResult({ success: false, message: err?.data?.error ?? 'Failed to send email' })
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-[#283c50]">Email</h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">Send emails to a single address, multiple recipients, or all customers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode */}
        <SectionCard>
          <p className="text-xs font-semibold text-[#283c50]">Recipient Mode</p>
          <div className="flex gap-3 flex-wrap">
            {([
              { id: 'single', label: 'Single', desc: 'One email address', icon: User },
              { id: 'batch', label: 'Multiple', desc: 'Comma-separated emails', icon: Mail },
              { id: 'all-customers', label: 'All Customers', desc: 'Every active customer', icon: Users },
            ] as { id: Mode; label: string; desc: string; icon: React.ElementType }[]).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); reset() }}
                className={`flex-1 min-w-[130px] flex flex-col items-start gap-0.5 px-3.5 py-3 rounded-lg border text-left transition-colors ${
                  mode === m.id
                    ? 'border-[#3454d1] bg-[#eef1fb]'
                    : 'border-[#e5e7eb] hover:border-[#3454d1]/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Radio className={`w-3 h-3 ${mode === m.id ? 'text-[#3454d1]' : 'text-[#9ca3af]'}`} />
                  <span className={`text-xs font-semibold ${mode === m.id ? 'text-[#3454d1]' : 'text-[#283c50]'}`}>
                    {m.label}
                  </span>
                </div>
                <p className="text-[11px] text-[#9ca3af] ml-[18px]">{m.desc}</p>
              </button>
            ))}
          </div>

          {mode === 'single' && (
            <div>
              <label className="block text-xs font-medium text-[#4b5563] mb-1">
                To <span className="text-[#ea4d4d]">*</span>
              </label>
              <input
                type="email"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="customer@example.com"
                className={inputCls()}
              />
            </div>
          )}

          {mode === 'batch' && (
            <div>
              <label className="block text-xs font-medium text-[#4b5563] mb-1">
                Email Addresses <span className="text-[#ea4d4d]">*</span>
              </label>
              <textarea
                required
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={3}
                placeholder="user1@example.com, user2@example.com, user3@example.com"
                className={inputCls('resize-none')}
              />
              <p className="text-[11px] text-[#9ca3af] mt-1">Separate multiple addresses with commas</p>
            </div>
          )}

          {mode === 'all-customers' && (
            <div className="flex items-start gap-2 bg-[#fff7ed] border border-[#fed7aa] rounded-lg px-3 py-2.5">
              <Users className="w-3.5 h-3.5 text-[#f97316] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#92400e]">
                This will send an email to every active customer with an email address on Godrop.
              </p>
            </div>
          )}
        </SectionCard>

        {/* Compose */}
        <SectionCard>
          <p className="text-xs font-semibold text-[#283c50]">Compose</p>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">
              Subject <span className="text-[#ea4d4d]">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Exciting news from Godrop!"
              maxLength={200}
              className={inputCls()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">
              Message <span className="text-[#ea4d4d]">*</span>
            </label>
            <textarea
              required
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={8}
              placeholder="Write your message here. Each line becomes a paragraph."
              className={inputCls('resize-y')}
            />
            <p className="text-[11px] text-[#9ca3af] mt-1">Each new line becomes a separate paragraph in the email</p>
          </div>
        </SectionCard>

        {result && <ResultCard result={result} />}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60 transition-colors"
            style={{ backgroundColor: '#3454d1' }}
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sending
              ? 'Sending…'
              : mode === 'single'
              ? 'Send Email'
              : mode === 'batch'
              ? 'Send to Recipients'
              : 'Broadcast to All Customers'}
          </button>
        </div>
      </form>
    </div>
  )
}
