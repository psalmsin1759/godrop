'use client'

import { useState } from 'react'
import {
  useListPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} from '@/features/coupons/store/couponsApi'
import type { Promotion, PromotionType, CreatePromotionRequest, UpdatePromotionRequest } from '@/types/api'
import { formatNaira } from '@/lib/utils'
import { exportToCsv } from '@/lib/exportCsv'
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  X,
  TicketPercent,
  CheckCircle2,
  XCircle,
  BadgePercent,
  Clock,
  Download,
} from 'lucide-react'

const ORDER_TYPES = ['FOOD', 'GROCERY', 'RETAIL', 'PHARMACY', 'PARCEL', 'TRUCK'] as const

function inp(extra = '') {
  return `w-full text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] px-3 py-1.5 text-[#0D1426] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] ${extra}`
}

function toDateInputValue(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function couponStatus(promo: Promotion): { label: string; bg: string; text: string } {
  const now = new Date()
  const validUntil = new Date(promo.validUntil)
  const validFrom = new Date(promo.validFrom)
  if (!promo.isActive) return { label: 'Disabled', bg: '#EDF0F6', text: '#9AA1B4' }
  if (validUntil < now) return { label: 'Expired', bg: '#FFE3E1', text: '#FF3B30' }
  if (validFrom > now) return { label: 'Scheduled', bg: '#FBEDD7', text: '#E8930C' }
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return { label: 'Used up', bg: '#EDF0F6', text: '#9AA1B4' }
  return { label: 'Active', bg: '#DFF5EC', text: '#1DB980' }
}

// ─── Coupon form dialog ───────────────────────────────────────────────────────

interface FormState {
  code: string
  description: string
  type: PromotionType
  valueInput: string // percent as-is, fixed entered in Naira
  maxDiscountNaira: string
  minOrderNaira: string
  orderTypes: string[]
  usageLimit: string
  validFrom: string
  validUntil: string
  isActive: boolean
}

function initialFormState(initial?: Promotion): FormState {
  return {
    code: initial?.code ?? '',
    description: initial?.description ?? '',
    type: initial?.type ?? 'percent',
    valueInput: initial ? (initial.type === 'percent' ? String(initial.value) : String(initial.value / 100)) : '',
    maxDiscountNaira: initial?.maxDiscount ? String(initial.maxDiscount / 100) : '',
    minOrderNaira: initial?.minOrderKobo ? String(initial.minOrderKobo / 100) : '',
    orderTypes: initial?.orderTypes ?? [],
    usageLimit: initial?.usageLimit ? String(initial.usageLimit) : '',
    validFrom: toDateInputValue(initial?.validFrom) || toDateInputValue(new Date().toISOString()),
    validUntil: toDateInputValue(initial?.validUntil),
    isActive: initial?.isActive ?? true,
  }
}

function CouponFormDialog({ initial, onClose }: { initial?: Promotion; onClose: () => void }) {
  const isEdit = !!initial
  const [createPromotion, { isLoading: creating }] = useCreatePromotionMutation()
  const [updatePromotion, { isLoading: updating }] = useUpdatePromotionMutation()
  const [form, setForm] = useState<FormState>(initialFormState(initial))
  const [error, setError] = useState('')

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function toggleOrderType(t: string) {
    setForm((f) => ({
      ...f,
      orderTypes: f.orderTypes.includes(t) ? f.orderTypes.filter((x) => x !== t) : [...f.orderTypes, t],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.code.trim()) { setError('Coupon code is required'); return }
    if (!form.description.trim()) { setError('Description is required'); return }
    const rawValue = parseFloat(form.valueInput)
    if (!rawValue || rawValue <= 0) { setError('Enter a value greater than 0'); return }
    if (form.type === 'percent' && rawValue > 100) { setError('Percent value must be between 1 and 100'); return }
    if (!form.validFrom || !form.validUntil) { setError('Valid from and valid until dates are required'); return }
    if (new Date(form.validUntil) <= new Date(form.validFrom)) { setError('Valid until must be after valid from'); return }

    const value = form.type === 'percent' ? Math.round(rawValue) : Math.round(rawValue * 100)
    const maxDiscount = form.maxDiscountNaira ? Math.round(parseFloat(form.maxDiscountNaira) * 100) : undefined
    const minOrderKobo = form.minOrderNaira ? Math.round(parseFloat(form.minOrderNaira) * 100) : undefined
    const usageLimit = form.usageLimit ? parseInt(form.usageLimit, 10) : undefined

    try {
      if (isEdit) {
        const payload: UpdatePromotionRequest = {
          code: form.code.trim(),
          description: form.description.trim(),
          type: form.type,
          value,
          maxDiscount: maxDiscount ?? null,
          minOrderKobo: minOrderKobo ?? null,
          orderTypes: form.orderTypes,
          usageLimit: usageLimit ?? null,
          validFrom: new Date(form.validFrom).toISOString(),
          validUntil: new Date(form.validUntil).toISOString(),
          isActive: form.isActive,
        }
        await updatePromotion({ id: initial.id, body: payload }).unwrap()
      } else {
        const payload: CreatePromotionRequest = {
          code: form.code.trim(),
          description: form.description.trim(),
          type: form.type,
          value,
          maxDiscount,
          minOrderKobo,
          orderTypes: form.orderTypes,
          usageLimit,
          validFrom: new Date(form.validFrom).toISOString(),
          validUntil: new Date(form.validUntil).toISOString(),
          isActive: form.isActive,
        }
        await createPromotion(payload).unwrap()
      }
      onClose()
    } catch (err: any) {
      setError(err?.data?.error ?? 'Something went wrong')
    }
  }

  const busy = creating || updating

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF1F7]">
          <h2 className="text-sm font-semibold text-[#0D1426]">{isEdit ? 'Edit Coupon' : 'New Coupon'}</h2>
          <button onClick={onClose} className="text-[#9AA1B4] hover:text-[#0D1426] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Code + description */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Coupon Code <span className="text-red-500">*</span></label>
              <input
                className={inp('uppercase')}
                placeholder="GODROP5"
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Usage Limit <span className="text-[#9AA1B4] normal-case">(optional)</span></label>
              <input
                type="number"
                min={1}
                className={inp()}
                placeholder="Unlimited"
                value={form.usageLimit}
                onChange={(e) => set('usageLimit', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Description <span className="text-red-500">*</span></label>
            <input
              className={inp()}
              placeholder="₦5 off delivery on your first order"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            <p className="text-[10px] text-[#9AA1B4] mt-0.5">Shown to the customer when the coupon is applied</p>
          </div>

          {/* Type + value */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Discount Type</label>
            <div className="flex gap-2 mb-2">
              {(['percent', 'fixed'] as PromotionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={`flex-1 border rounded py-1.5 text-xs font-medium transition-colors ${
                    form.type === t
                      ? 'border-[#1E5FFF] bg-[#E7EEFF] text-[#1E5FFF]'
                      : 'border-[#E7EAF1] text-[#9AA1B4] hover:border-[#1E5FFF]'
                  }`}
                >
                  {t === 'percent' ? 'Percent off delivery fee' : 'Fixed amount off delivery fee'}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={form.type === 'percent' ? 1 : 0.01}
                className={inp('pr-10')}
                placeholder={form.type === 'percent' ? '20' : '500'}
                value={form.valueInput}
                onChange={(e) => set('valueInput', e.target.value)}
              />
              <span className="absolute right-3 top-1.5 text-[10px] font-semibold text-[#9AA1B4]">
                {form.type === 'percent' ? '%' : '₦'}
              </span>
            </div>
            <p className="text-[10px] text-[#9AA1B4] mt-0.5">
              Discounts the delivery fee only — the rider is always paid their full share, even at 100% off.
            </p>
          </div>

          {/* Max discount + min order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">
                Max Discount <span className="text-[#9AA1B4] normal-case">(₦, optional)</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                className={inp()}
                placeholder="No cap"
                disabled={form.type === 'fixed'}
                value={form.maxDiscountNaira}
                onChange={(e) => set('maxDiscountNaira', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">
                Min Order Value <span className="text-[#9AA1B4] normal-case">(₦, optional)</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                className={inp()}
                placeholder="No minimum"
                value={form.minOrderNaira}
                onChange={(e) => set('minOrderNaira', e.target.value)}
              />
            </div>
          </div>

          {/* Order types */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">
              Applies To <span className="text-[#9AA1B4] normal-case">(none selected = all order types)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ORDER_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleOrderType(t)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                    form.orderTypes.includes(t)
                      ? 'border-[#1E5FFF] bg-[#E7EEFF] text-[#1E5FFF]'
                      : 'border-[#E7EAF1] text-[#9AA1B4] hover:border-[#1E5FFF]'
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Validity window */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Valid From <span className="text-red-500">*</span></label>
              <input type="date" className={inp()} value={form.validFrom} onChange={(e) => set('validFrom', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Valid Until <span className="text-red-500">*</span></label>
              <input type="date" className={inp()} value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${form.isActive ? 'bg-[#1E5FFF]' : 'bg-[#E7EAF1]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
            <span className="text-xs text-[#0D1426]">{form.isActive ? 'Enabled — customers can redeem it' : 'Disabled — cannot be redeemed'}</span>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EEF1F7]">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-xs border border-[#E7EAF1] rounded text-[#9AA1B4] hover:border-[#0D1426] transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-[#1E5FFF] text-white rounded hover:bg-[#0A3FD1] disabled:opacity-50 transition-colors"
            >
              {busy && <Loader2 className="w-3 h-3 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteDialog({ promo, onClose }: { promo: Promotion; onClose: () => void }) {
  const [deletePromotion, { isLoading }] = useDeletePromotionMutation()

  async function confirm() {
    await deletePromotion(promo.id).unwrap()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-sm font-semibold text-[#0D1426] mb-2">Delete coupon?</h3>
        <p className="text-xs text-[#9AA1B4] mb-5">
          <strong className="text-[#0D1426]">{promo.code}</strong> will be permanently removed and customers will no longer be able to redeem it.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-xs border border-[#E7EAF1] rounded text-[#9AA1B4] hover:border-[#0D1426] transition-colors">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const { data: promotions = [], isLoading, isError } = useListPromotionsQuery()
  const [updatePromotion] = useUpdatePromotionMutation()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [deleting, setDeleting] = useState<Promotion | null>(null)

  function toggleActive(promo: Promotion) {
    updatePromotion({ id: promo.id, body: { isActive: !promo.isActive } })
  }

  const now = new Date()
  const activeCount = promotions.filter((p) => p.isActive && new Date(p.validUntil) >= now && new Date(p.validFrom) <= now).length
  const expiredCount = promotions.filter((p) => new Date(p.validUntil) < now).length
  const totalRedemptions = promotions.reduce((sum, p) => sum + p.usageCount, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0D1426]">Coupons</h1>
          <p className="text-xs text-[#9AA1B4] mt-0.5">Manage delivery-fee discount codes customers can redeem at checkout</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCsv('coupons', promotions, [
              { header: 'Code', value: (p) => p.code },
              { header: 'Description', value: (p) => p.description },
              { header: 'Type', value: (p) => p.type },
              { header: 'Value', value: (p) => p.value },
              { header: 'Uses', value: (p) => p.usageCount },
              { header: 'Valid From', value: (p) => new Date(p.validFrom).toLocaleDateString('en-NG') },
              { header: 'Valid Until', value: (p) => new Date(p.validUntil).toLocaleDateString('en-NG') },
              { header: 'Status', value: (p) => p.isActive ? 'Active' : 'Inactive' },
            ])}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded-lg hover:bg-[#F7F9FC] font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-[#1E5FFF] text-white rounded-lg hover:bg-[#0A3FD1] transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            New Coupon
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Coupons', value: promotions.length, icon: <TicketPercent className="w-4 h-4" />, color: '#1E5FFF', bg: '#E7EEFF' },
          { label: 'Active', value: activeCount, icon: <CheckCircle2 className="w-4 h-4" />, color: '#1DB980', bg: '#DFF5EC' },
          { label: 'Expired', value: expiredCount, icon: <XCircle className="w-4 h-4" />, color: '#FF3B30', bg: '#FFE3E1' },
          { label: 'Total Redemptions', value: totalRedemptions, icon: <BadgePercent className="w-4 h-4" />, color: '#FF6A2C', bg: '#FBEDD7' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-[11px] text-[#9AA1B4] font-medium">{s.label}</p>
              <p className="text-lg font-bold text-[#0D1426] leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-[#E7EEFF] border border-[#C7D9FF] rounded-lg px-4 py-3 text-xs text-[#1E5FFF]">
        <strong>Tip:</strong> Coupons only discount the delivery fee shown to the customer — riders are always paid their full share of the original fee, regardless of the discount applied.
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9AA1B4]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading coupons…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#FF3B30]">Failed to load coupons.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                  {['Code', 'Discount', 'Applies To', 'Usage', 'Valid Until', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F9FC]">
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-xs text-[#9AA1B4]">No coupons yet.</td>
                  </tr>
                ) : (
                  promotions.map((promo) => {
                    const status = couponStatus(promo)
                    return (
                      <tr key={promo.id} className="hover:bg-[#F7F9FC] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-[#0D1426] font-mono">{promo.code}</p>
                          <p className="text-[11px] text-[#9AA1B4] mt-0.5 line-clamp-1 max-w-[220px]">{promo.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-[#0D1426]">
                            {promo.type === 'percent' ? `${promo.value}% off` : `${formatNaira(promo.value)} off`}
                          </p>
                          {promo.type === 'percent' && promo.maxDiscount && (
                            <p className="text-[10px] text-[#9AA1B4]">up to {formatNaira(promo.maxDiscount)}</p>
                          )}
                          {promo.minOrderKobo && (
                            <p className="text-[10px] text-[#9AA1B4]">min. order {formatNaira(promo.minOrderKobo)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {promo.orderTypes.length === 0 ? (
                              <span className="text-[10px] text-[#9AA1B4]">All order types</span>
                            ) : (
                              promo.orderTypes.map((t) => (
                                <span key={t} className="text-[10px] font-medium rounded-full px-1.5 py-0.5 bg-[#E7EEFF] text-[#1E5FFF]">
                                  {t.charAt(0) + t.slice(1).toLowerCase()}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#525A72]">
                            {promo.usageCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-[11px] text-[#9AA1B4]">
                            <Clock className="w-3 h-3" />
                            {new Date(promo.validUntil).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActive(promo)}
                            className="text-[11px] font-medium rounded-full px-2 py-0.5 transition-colors"
                            style={{ backgroundColor: status.bg, color: status.text }}
                            title="Click to toggle enabled/disabled"
                          >
                            {status.label}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => setEditing(promo)} className="p-1.5 rounded hover:bg-[#EEF1F7] text-[#9AA1B4] hover:text-[#1E5FFF] transition-colors" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleting(promo)} className="p-1.5 rounded hover:bg-red-50 text-[#9AA1B4] hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showCreate && <CouponFormDialog onClose={() => setShowCreate(false)} />}
      {editing && <CouponFormDialog initial={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteDialog promo={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
