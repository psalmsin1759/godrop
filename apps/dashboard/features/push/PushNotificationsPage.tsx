'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Send, Loader2, CheckCircle2, XCircle, Plus, Trash2, Radio, Users, Bike, X, Search,
} from 'lucide-react'
import {
  useBroadcastToCustomersMutation,
  useSendToCustomerBatchMutation,
  useSendToCustomerMutation,
  useBroadcastToRidersMutation,
  useSendToRiderBatchMutation,
  useSendToRiderMutation,
} from '@/store/services/pushApi'
import { useGetCustomersQuery } from '@/features/customers/store/customersApi'
import { useGetRidersQuery } from '@/store/services/ridersApi'
import type { PushSendResult } from '@/types/api'

type Audience = 'customers' | 'riders'
type Mode = 'broadcast' | 'batch' | 'single'
interface KVEntry { key: string; value: string }
interface SelectOption { id: string; label: string; sub: string }

// ─── Shared primitives ────────────────────────────────────────────────────────

function inputCls(extra = '') {
  return `w-full px-3 py-2 text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#0D1426] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] focus:border-[#1E5FFF] transition-colors ${extra}`
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="card p-5 space-y-4">{children}</div>
}

function ResultCard({ result }: { result: PushSendResult }) {
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
        {(result.successCount > 0 || result.failureCount > 0) && (
          <p className="text-[11px] opacity-80">
            {result.successCount} delivered · {result.failureCount} failed
          </p>
        )}
      </div>
    </div>
  )
}

// ─── User searchable combobox ─────────────────────────────────────────────────

function useDebounce(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface UserSelectProps {
  audience: Audience
  multi: boolean
  onChange: (ids: string[]) => void
}

function UserSelect({ audience, multi, onChange }: UserSelectProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<SelectOption[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(search)

  // Reset when audience changes
  useEffect(() => {
    setSelected([])
    setSearch('')
    onChange([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience])

  const { data: customersData, isFetching: fetchingC } = useGetCustomersQuery(
    { search: debouncedSearch, limit: 20 },
    { skip: audience !== 'customers' },
  )
  const { data: ridersData, isFetching: fetchingR } = useGetRidersQuery(
    { search: debouncedSearch, limit: 20 },
    { skip: audience !== 'riders' },
  )

  const fetching = fetchingC || fetchingR

  const options: SelectOption[] = audience === 'customers'
    ? (customersData?.data ?? []).map((c) => ({
        id: c.id,
        label: `${c.firstName} ${c.lastName}`,
        sub: c.email ?? c.phone,
      }))
    : (ridersData?.data ?? []).map((r) => ({
        id: r.id,
        label: `${r.firstName} ${r.lastName}`,
        sub: r.email ?? r.phone,
      }))

  const filtered = options.filter((o) => !selected.some((s) => s.id === o.id))

  function pick(opt: SelectOption) {
    const next = multi ? [...selected, opt] : [opt]
    setSelected(next)
    onChange(next.map((s) => s.id))
    setSearch('')
    if (!multi) setOpen(false)
    else inputRef.current?.focus()
  }

  function remove(id: string) {
    const next = selected.filter((s) => s.id !== id)
    setSelected(next)
    onChange(next.map((s) => s.id))
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const entity = audience === 'customers' ? 'customer' : 'rider'

  return (
    <div ref={containerRef} className="relative">
      {/* Selected chips (multi) */}
      {multi && selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-medium bg-[#E7EEFF] text-[#1E5FFF]"
            >
              {s.label}
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#1E5FFF]/20 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Single selected display */}
      {!multi && selected.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 mb-2 rounded border border-[#1E5FFF]/30 bg-[#E7EEFF]">
          <div>
            <p className="text-xs font-semibold text-[#0D1426]">{selected[0].label}</p>
            <p className="text-[11px] text-[#525A72]">{selected[0].sub}</p>
          </div>
          <button
            type="button"
            onClick={() => { setSelected([]); onChange([]) }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#1E5FFF]/10 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#525A72]" />
          </button>
        </div>
      )}

      {/* Input */}
      {(multi || selected.length === 0) && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA1B4]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={`Search ${entity} by name or email…`}
            className="w-full pl-8 pr-3 py-2 text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#0D1426] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] focus:border-[#1E5FFF] transition-colors"
          />
          {fetching && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA1B4] animate-spin" />
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-40 top-full mt-1 left-0 right-0 bg-white border border-[#E7EAF1] rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-[11px] text-[#9AA1B4] text-center py-4">
              {fetching ? 'Searching…' : `No ${entity}s found`}
            </p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); pick(opt) }}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-[#EDF0F6] transition-colors border-b border-[#F7F9FC] last:border-0"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}
                >
                  {opt.label.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#0D1426] truncate">{opt.label}</p>
                  <p className="text-[11px] text-[#9AA1B4] truncate">{opt.sub}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PushNotificationsPage() {
  const [audience, setAudience] = useState<Audience>('customers')
  const [mode, setMode] = useState<Mode>('broadcast')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [kvPairs, setKvPairs] = useState<KVEntry[]>([])
  const [result, setResult] = useState<PushSendResult | null>(null)
  const [error, setError] = useState('')

  const [broadcastCustomers, { isLoading: bc }] = useBroadcastToCustomersMutation()
  const [batchCustomers, { isLoading: btc }] = useSendToCustomerBatchMutation()
  const [singleCustomer, { isLoading: sc }] = useSendToCustomerMutation()
  const [broadcastRiders, { isLoading: br }] = useBroadcastToRidersMutation()
  const [batchRiders, { isLoading: btr }] = useSendToRiderBatchMutation()
  const [singleRider, { isLoading: sr }] = useSendToRiderMutation()

  const sending = bc || btc || sc || br || btr || sr

  function buildPayload() {
    const data: Record<string, string> = {}
    for (const { key, value } of kvPairs) {
      if (key.trim()) data[key.trim()] = value
    }
    return { title: title.trim(), body: body.trim(), ...(Object.keys(data).length ? { data } : {}) }
  }

  function resetTarget() { setSelectedIds([]); setResult(null); setError('') }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    const payload = buildPayload()
    if (!payload.title || !payload.body) { setError('Title and body are required.'); return }

    try {
      let res: PushSendResult
      if (audience === 'customers') {
        if (mode === 'broadcast') {
          res = await broadcastCustomers(payload).unwrap()
        } else if (mode === 'batch') {
          if (!selectedIds.length) { setError('Select at least one customer.'); return }
          res = await batchCustomers({ ...payload, customerIds: selectedIds }).unwrap()
        } else {
          if (!selectedIds[0]) { setError('Select a customer.'); return }
          res = await singleCustomer({ ...payload, id: selectedIds[0] }).unwrap()
        }
      } else {
        if (mode === 'broadcast') {
          res = await broadcastRiders(payload).unwrap()
        } else if (mode === 'batch') {
          if (!selectedIds.length) { setError('Select at least one rider.'); return }
          res = await batchRiders({ ...payload, riderIds: selectedIds }).unwrap()
        } else {
          if (!selectedIds[0]) { setError('Select a rider.'); return }
          res = await singleRider({ ...payload, id: selectedIds[0] }).unwrap()
        }
      }
      setResult(res!)
    } catch (err: any) {
      setError(err?.data?.error ?? err?.data?.message ?? 'Failed to send notification.')
    }
  }

  function addKv() { setKvPairs((p) => [...p, { key: '', value: '' }]) }
  function removeKv(i: number) { setKvPairs((p) => p.filter((_, idx) => idx !== i)) }
  function setKv(i: number, field: 'key' | 'value', val: string) {
    setKvPairs((p) => p.map((entry, idx) => idx === i ? { ...entry, [field]: val } : entry))
  }

  const audienceLabel = audience === 'customers' ? 'Customers' : 'Riders'

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-[#0D1426]">Push Notifications</h1>
        <p className="text-xs text-[#9AA1B4] mt-0.5">Send FCM push notifications to customers or riders</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Audience */}
        <SectionCard>
          <p className="text-xs font-semibold text-[#0D1426]">Audience</p>
          <div className="flex gap-3">
            {(['customers', 'riders'] as Audience[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setAudience(a); resetTarget() }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  audience === a
                    ? 'border-[#1E5FFF] bg-[#E7EEFF] text-[#1E5FFF]'
                    : 'border-[#E7EAF1] text-[#525A72] hover:border-[#1E5FFF]/40 hover:text-[#1E5FFF]'
                }`}
              >
                {a === 'customers' ? <Users className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                {a === 'customers' ? 'Customers' : 'Riders'}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Mode */}
        <SectionCard>
          <p className="text-xs font-semibold text-[#0D1426]">Delivery Mode</p>
          <div className="flex gap-3 flex-wrap">
            {([
              { id: 'broadcast', label: `All ${audienceLabel}`, desc: 'Send to every registered device' },
              { id: 'batch', label: 'Batch', desc: 'Select multiple recipients' },
              { id: 'single', label: 'Single', desc: 'Select one specific recipient' },
            ] as { id: Mode; label: string; desc: string }[]).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); resetTarget() }}
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

          {/* Recipient selector */}
          {(mode === 'batch' || mode === 'single') && (
            <div>
              <label className="block text-xs font-medium text-[#525A72] mb-2">
                {mode === 'batch'
                  ? `Select ${audienceLabel}`
                  : `Select ${audience === 'customers' ? 'Customer' : 'Rider'}`}
                {mode === 'batch' && selectedIds.length > 0 && (
                  <span className="ml-1.5 font-normal text-[#9AA1B4]">({selectedIds.length} selected)</span>
                )}
              </label>
              <UserSelect
                key={`${audience}-${mode}`}
                audience={audience}
                multi={mode === 'batch'}
                onChange={setSelectedIds}
              />
            </div>
          )}
        </SectionCard>

        {/* Message */}
        <SectionCard>
          <p className="text-xs font-semibold text-[#0D1426]">Message</p>
          <div>
            <label className="block text-xs font-medium text-[#525A72] mb-1">
              Title <span className="text-[#FF3B30]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Order Update"
              maxLength={100}
              className={inputCls()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#525A72] mb-1">
              Body <span className="text-[#FF3B30]">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="e.g. Your order has been picked up."
              maxLength={500}
              className={inputCls('resize-none')}
            />
          </div>
        </SectionCard>

        {/* Data payload */}
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0D1426]">Data Payload</p>
              <p className="text-[11px] text-[#9AA1B4] mt-0.5">Optional key-value pairs (FCM data, string values only)</p>
            </div>
            <button
              type="button"
              onClick={addKv}
              className="flex items-center gap-1 text-[11px] font-medium text-[#1E5FFF] hover:underline"
            >
              <Plus className="w-3 h-3" /> Add field
            </button>
          </div>
          {kvPairs.length === 0 ? (
            <p className="text-[11px] text-[#DDE2EC] italic">No data fields added.</p>
          ) : (
            <div className="space-y-2">
              {kvPairs.map((kv, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={kv.key}
                    onChange={(e) => setKv(i, 'key', e.target.value)}
                    placeholder="key"
                    className={inputCls('font-mono flex-1')}
                  />
                  <input
                    type="text"
                    value={kv.value}
                    onChange={(e) => setKv(i, 'value', e.target.value)}
                    placeholder="value"
                    className={inputCls('font-mono flex-1')}
                  />
                  <button
                    type="button"
                    onClick={() => removeKv(i)}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFE3E1] transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#FF3B30]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {error && (
          <p className="text-xs text-[#C42B22] bg-[#FFE3E1] border border-[#FFB3AD] rounded-lg px-4 py-3">
            {error}
          </p>
        )}

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
              : mode === 'broadcast'
              ? `Broadcast to All ${audienceLabel}`
              : mode === 'batch'
              ? `Send to ${selectedIds.length || 0} ${audienceLabel}`
              : 'Send to Recipient'}
          </button>
        </div>
      </form>
    </div>
  )
}
