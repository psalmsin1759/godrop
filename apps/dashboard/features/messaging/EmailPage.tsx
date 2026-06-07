'use client'

import { useState } from 'react'
import {
  Send, Loader2, CheckCircle2, XCircle, Mail, Users, User, Radio, Store, Bike,
} from 'lucide-react'
import {
  useSendEmailSingleMutation,
  useSendEmailBatchMutation,
  useSendEmailAllCustomersMutation,
  useSendEmailAllVendorsMutation,
  useSendEmailAllRidersMutation,
} from '@/store/services/messagingApi'

type Mode = 'single' | 'batch' | 'all-customers' | 'all-vendors' | 'all-riders'

interface Result {
  success: boolean
  message: string
  sent?: number
  failed?: number
  total?: number
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
  const [sendAllCustomers, { isLoading: sendingAllCustomers }] = useSendEmailAllCustomersMutation()
  const [sendAllVendors, { isLoading: sendingAllVendors }] = useSendEmailAllVendorsMutation()
  const [sendAllRiders, { isLoading: sendingAllRiders }] = useSendEmailAllRidersMutation()

  const sending = sendingSingle || sendingBatch || sendingAllCustomers || sendingAllVendors || sendingAllRiders

  function reset() {
    setTo('')
    setEmails('')
    setSubject('')
    setBodyText('')
    setResult(null)
  }

  const htmlBody = bodyText
    .split('\n')
    .map((line) => `<p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">${line || '&nbsp;'}</p>`)
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
      } else if (mode === 'all-customers') {
        res = await sendAllCustomers(base).unwrap()
      } else if (mode === 'all-vendors') {
        res = await sendAllVendors(base).unwrap()
      } else {
        res = await sendAllRiders(base).unwrap()
      }
      setResult({ success: true, message: res.message, sent: res.sent, failed: res.failed, total: res.total })
    } catch (err: any) {
      setResult({ success: false, message: err?.data?.error ?? 'Failed to send email' })
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-[#0D1426]">Email</h1>
        <p className="text-xs text-[#9AA1B4] mt-0.5">Send emails to a single address, multiple recipients, or broadcast to all customers, vendors, or riders</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode */}
        <SectionCard>
          <p className="text-xs font-semibold text-[#0D1426]">Recipient Mode</p>
          <div className="flex gap-3 flex-wrap">
            {([
              { id: 'single', label: 'Single', desc: 'One email address', icon: User },
              { id: 'batch', label: 'Multiple', desc: 'Comma-separated emails', icon: Mail },
              { id: 'all-customers', label: 'All Customers', desc: 'Every active customer', icon: Users },
              { id: 'all-vendors', label: 'All Vendors', desc: 'Every active vendor owner', icon: Store },
              { id: 'all-riders', label: 'All Riders', desc: 'Every active rider', icon: Bike },
            ] as { id: Mode; label: string; desc: string; icon: React.ElementType }[]).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); reset() }}
                className={`flex-1 min-w-[130px] flex flex-col items-start gap-0.5 px-3.5 py-3 rounded-lg border text-left transition-colors ${
                  mode === m.id
                    ? 'border-[#1E5FFF] bg-[#E7EEFF]'
                    : 'border-[#E7EAF1] hover:border-[#1E5FFF]/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Radio className={`w-3 h-3 ${mode === m.id ? 'text-[#1E5FFF]' : 'text-[#9AA1B4]'}`} />
                  <span className={`text-xs font-semibold ${mode === m.id ? 'text-[#1E5FFF]' : 'text-[#0D1426]'}`}>
                    {m.label}
                  </span>
                </div>
                <p className="text-[11px] text-[#9AA1B4] ml-[18px]">{m.desc}</p>
              </button>
            ))}
          </div>

          {mode === 'single' && (
            <div>
              <label className="block text-xs font-medium text-[#525A72] mb-1">
                To <span className="text-[#FF3B30]">*</span>
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
              <label className="block text-xs font-medium text-[#525A72] mb-1">
                Email Addresses <span className="text-[#FF3B30]">*</span>
              </label>
              <textarea
                required
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={3}
                placeholder="user1@example.com, user2@example.com, user3@example.com"
                className={inputCls('resize-none')}
              />
              <p className="text-[11px] text-[#9AA1B4] mt-1">Separate multiple addresses with commas</p>
            </div>
          )}

          {mode === 'all-customers' && (
            <div className="flex items-start gap-2 bg-[#FBEDD7] border border-[#F6D9A8] rounded-lg px-3 py-2.5">
              <Users className="w-3.5 h-3.5 text-[#FF6A2C] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#8A5A0A]">
                This will send an email to every active customer with an email address on Godrop.
              </p>
            </div>
          )}

          {mode === 'all-vendors' && (
            <div className="flex items-start gap-2 bg-[#FBEDD7] border border-[#F6D9A8] rounded-lg px-3 py-2.5">
              <Store className="w-3.5 h-3.5 text-[#FF6A2C] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#8A5A0A]">
                This will send an email to the owner of every active vendor on Godrop.
              </p>
            </div>
          )}

          {mode === 'all-riders' && (
            <div className="flex items-start gap-2 bg-[#FBEDD7] border border-[#F6D9A8] rounded-lg px-3 py-2.5">
              <Bike className="w-3.5 h-3.5 text-[#FF6A2C] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#8A5A0A]">
                This will send an email to every active rider with an email address on Godrop.
              </p>
            </div>
          )}
        </SectionCard>

        {/* Compose */}
        <SectionCard>
          <p className="text-xs font-semibold text-[#0D1426]">Compose</p>
          <div>
            <label className="block text-xs font-medium text-[#525A72] mb-1">
              Subject <span className="text-[#FF3B30]">*</span>
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
            <label className="block text-xs font-medium text-[#525A72] mb-1">
              Message <span className="text-[#FF3B30]">*</span>
            </label>
            <textarea
              required
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={8}
              placeholder="Write your message here. Each line becomes a paragraph."
              className={inputCls('resize-y')}
            />
            <p className="text-[11px] text-[#9AA1B4] mt-1">Each new line becomes a separate paragraph in the email</p>
          </div>
        </SectionCard>

        {result && <ResultCard result={result} />}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60 transition-colors"
            style={{ backgroundColor: '#1E5FFF' }}
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sending
              ? 'Sending…'
              : mode === 'single'
              ? 'Send Email'
              : mode === 'batch'
              ? 'Send to Recipients'
              : mode === 'all-customers'
              ? 'Broadcast to All Customers'
              : mode === 'all-vendors'
              ? 'Broadcast to All Vendors'
              : 'Broadcast to All Riders'}
          </button>
        </div>
      </form>
    </div>
  )
}
