'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useGetTruckTypesQuery,
  useCreateTruckTypeMutation,
  useUpdateTruckTypeMutation,
  useDeleteTruckTypeMutation,
  useGetTruckOrdersQuery,
  useGetAdminApartmentTypesQuery,
  useCreateApartmentTypeMutation,
  useUpdateApartmentTypeMutation,
  useDeleteApartmentTypeMutation,
  useUpdatePerKmRateMutation,
  useUpdatePerLoaderRateMutation,
  useGetTruckPricingQuery,
} from './store/trucksApi'
import type { TruckType, ApartmentType, OrderStatus } from '@/types/api'
import { formatNaira, formatDateTime } from '@/lib/utils'
import {
  Plus, Pencil, Trash2, Loader2, Truck, X, ChevronLeft,
  ChevronRight, Search, CheckCircle2, ToggleLeft, ToggleRight,
  Home, Gauge, Users, ExternalLink,
} from 'lucide-react'

// ─── Truck Type Form ───────────────────────────────────────────────────────

interface TruckTypeFormData {
  name: string
  description: string
  capacity: string
  imageUrl: string
  baseFeeKobo: string
  perKmKobo: string
  isActive: boolean
}

const EMPTY_TRUCK_FORM: TruckTypeFormData = {
  name: '',
  description: '',
  capacity: '',
  imageUrl: '',
  baseFeeKobo: '',
  perKmKobo: '',
  isActive: true,
}

function typeToForm(t: TruckType): TruckTypeFormData {
  return {
    name: t.name,
    description: t.description ?? '',
    capacity: t.capacity ?? '',
    imageUrl: t.imageUrl ?? '',
    baseFeeKobo: String(t.baseFeeKobo / 100),
    perKmKobo: String(t.perKmKobo / 100),
    isActive: t.isActive,
  }
}

function TruckTypeModal({
  editing,
  onClose,
}: {
  editing: TruckType | null
  onClose: () => void
}) {
  const [form, setForm] = useState<TruckTypeFormData>(
    editing ? typeToForm(editing) : EMPTY_TRUCK_FORM
  )
  const [create, { isLoading: creating }] = useCreateTruckTypeMutation()
  const [update, { isLoading: updating }] = useUpdateTruckTypeMutation()
  const [error, setError] = useState('')
  const saving = creating || updating

  function field(key: keyof TruckTypeFormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const baseFeeKobo = Math.round(parseFloat(form.baseFeeKobo) * 100)
    const perKmKobo = Math.round(parseFloat(form.perKmKobo) * 100)
    if (isNaN(baseFeeKobo) || isNaN(perKmKobo)) {
      setError('Base fee and per-km fee must be valid numbers.')
      return
    }
    const payload = {
      name: form.name.trim(),
      ...(form.description && { description: form.description.trim() }),
      ...(form.capacity && { capacity: form.capacity.trim() }),
      ...(form.imageUrl && { imageUrl: form.imageUrl.trim() }),
      baseFeeKobo,
      perKmKobo,
      isActive: form.isActive,
    }
    try {
      if (editing) {
        await update({ id: editing.id, ...payload }).unwrap()
      } else {
        await create(payload).unwrap()
      }
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <h2 className="text-sm font-bold text-[#283c50]">
            {editing ? 'Edit Truck Type' : 'New Truck Type'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors">
            <X className="w-4 h-4 text-[#9ca3af]" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Name *</label>
            <input
              required
              value={form.name}
              onChange={field('name')}
              placeholder="e.g. Mini Van"
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={field('description')}
              placeholder="Short description of the truck type…"
              rows={2}
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb] resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Capacity</label>
            <input
              value={form.capacity}
              onChange={field('capacity')}
              placeholder="e.g. 1 tonne, 3 bedrooms"
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Base Fee (₦) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.baseFeeKobo}
                onChange={field('baseFeeKobo')}
                placeholder="5000"
                className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Per km (₦) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.perKmKobo}
                onChange={field('perKmKobo')}
                placeholder="200"
                className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={field('imageUrl')}
              placeholder="https://…"
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-medium text-[#283c50]">Active</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: form.isActive ? '#17c666' : '#9ca3af' }}
            >
              {form.isActive
                ? <ToggleRight className="w-5 h-5" />
                : <ToggleLeft className="w-5 h-5" />}
              {form.isActive ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {error && <p className="text-[11px] text-[#ea4d4d]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
              style={{ backgroundColor: '#3454d1' }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {editing ? 'Save Changes' : 'Create Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm ────────────────────────────────────────────────────────

function DeleteTruckTypeConfirm({ truckType, onClose }: { truckType: TruckType; onClose: () => void }) {
  const [deleteType, { isLoading }] = useDeleteTruckTypeMutation()
  const [error, setError] = useState('')

  async function confirm() {
    try {
      await deleteType(truckType.id).unwrap()
      onClose()
    } catch {
      setError('Failed to delete. It may have active bookings.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#fdf0f0' }}>
            <Trash2 className="w-4 h-4" style={{ color: '#ea4d4d' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#283c50]">Delete "{truckType.name}"?</p>
            <p className="text-xs text-[#6b7885] mt-1">This action cannot be undone. Existing bookings may be affected.</p>
          </div>
        </div>
        {error && <p className="text-[11px] text-[#ea4d4d]">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={isLoading}
            className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: '#ea4d4d' }}
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Truck Types Tab ───────────────────────────────────────────────────────

function TruckTypesTab() {
  const { data: types = [], isLoading, isError } = useGetTruckTypesQuery()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TruckType | null>(null)
  const [deleting, setDeleting] = useState<TruckType | null>(null)

  const active = types.filter((t) => t.isActive).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Types', value: types.length, color: '#3454d1', bg: '#eef1fb' },
          { label: 'Active', value: active, color: '#17c666', bg: '#e8faf2' },
          { label: 'Inactive', value: types.length - active, color: '#9ca3af', bg: '#f3f4f6' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <Truck style={{ color: s.color, width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#283c50] leading-none">{s.value}</p>
              <p className="text-[11px] text-[#6b7885] mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6]">
          <h3 className="text-xs font-semibold text-[#283c50]">Truck Types</h3>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Type
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">Failed to load truck types.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                  {['Type', 'Capacity', 'Base Fee', 'Per km', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {types.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-xs text-[#9ca3af]">
                      No truck types yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  types.map((t) => (
                    <tr key={t.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {t.imageUrl ? (
                            <img src={t.imageUrl} alt={t.name} className="w-8 h-8 rounded object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-[#eef1fb] flex items-center justify-center shrink-0">
                              <Truck className="w-4 h-4 text-[#3454d1]" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-[#283c50]">{t.name}</p>
                            {t.description && (
                              <p className="text-[11px] text-[#9ca3af] truncate max-w-[200px]">{t.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#6b7885]">{t.capacity ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-[#283c50]">{formatNaira(t.baseFeeKobo)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-[#283c50]">{formatNaira(t.perKmKobo)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] font-medium rounded-full px-2 py-0.5"
                          style={
                            t.isActive
                              ? { backgroundColor: '#e8faf2', color: '#17c666' }
                              : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                          }
                        >
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditing(t); setShowForm(true) }}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#eef1fb] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#3454d1]" />
                          </button>
                          <button
                            onClick={() => setDeleting(t)}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#fdf0f0] transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#ea4d4d]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <TruckTypeModal
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
      {deleting && (
        <DeleteTruckTypeConfirm truckType={deleting} onClose={() => setDeleting(null)} />
      )}
    </div>
  )
}

// ─── Bookings Tab ──────────────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#fff6e8', text: '#ffa21d', label: 'Pending' },
  ACCEPTED: { bg: '#e0f9f7', text: '#3dc7be', label: 'Accepted' },
  PREPARING: { bg: '#f3eeff', text: '#8b5cf6', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready' },
  PICKED_UP: { bg: '#fef3c7', text: '#f59e0b', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#eef1fb', text: '#3454d1', label: 'In Transit' },
  DELIVERED: { bg: '#e8faf2', text: '#17c666', label: 'Delivered' },
  CANCELLED: { bg: '#fdf0f0', text: '#ea4d4d', label: 'Cancelled' },
  FAILED: { bg: '#f3f4f6', text: '#6b7280', label: 'Failed' },
}

const STATUS_TABS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

function BookingsTab() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 15

  const { data, isLoading, isError } = useGetTruckOrdersQuery(
    {
      page,
      limit,
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { pollingInterval: 30000 }
  )

  const orders = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const filtered = search
    ? orders.filter((o) => o.trackingCode.toLowerCase().includes(search.toLowerCase()))
    : orders

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-0.5 p-1 bg-[#f3f4f6] rounded overflow-x-auto">
            {STATUS_TABS.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1) }}
                className="text-xs font-medium px-3 py-1.5 rounded transition-all whitespace-nowrap"
                style={
                  statusFilter === s.value
                    ? { backgroundColor: '#fff', color: '#3454d1', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                    : { color: '#6b7885' }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search tracking code…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#3454d1] w-52"
            />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading bookings…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">Failed to load bookings.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Tracking Code', 'Status', 'Amount', 'Booked At', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9fafb]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-xs text-[#9ca3af]">
                        No truck bookings found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => {
                      const s = ORDER_STATUS_CONFIG[order.status]
                      return (
                        <tr
                          key={order.id}
                          onClick={() => router.push(`/trucks/${order.id}`)}
                          className="hover:bg-[#fafafa] transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold text-[#3454d1]">
                              {order.trackingCode}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-[11px] font-medium rounded-full px-2 py-0.5"
                              style={{ backgroundColor: s.bg, color: s.text }}
                            >
                              {s.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold text-[#283c50]">
                              {formatNaira(order.totalKobo)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-[#9ca3af]">
                              {formatDateTime(order.createdAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <ExternalLink className="w-3.5 h-3.5 text-[#9ca3af]" />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#f3f4f6]">
              <p className="text-xs text-[#9ca3af]">
                {meta ? `${meta.total.toLocaleString()} total bookings` : ''}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-7 h-7 rounded flex items-center justify-center text-[#6b7885] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-7 h-7 rounded text-xs"
                    style={
                      page === n
                        ? { backgroundColor: '#3454d1', color: '#fff', fontWeight: 600 }
                        : { color: '#6b7885' }
                    }
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-7 h-7 rounded flex items-center justify-center text-[#6b7885] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Pricing Tab ───────────────────────────────────────────────────────────

interface ApartmentTypeFormData {
  name: string
  description: string
  priceKobo: string
  isActive: boolean
}

const EMPTY_APT_FORM: ApartmentTypeFormData = {
  name: '',
  description: '',
  priceKobo: '',
  isActive: true,
}

function aptTypeToForm(a: ApartmentType): ApartmentTypeFormData {
  return {
    name: a.name,
    description: a.description ?? '',
    priceKobo: String(a.priceKobo / 100),
    isActive: a.isActive,
  }
}

function ApartmentTypeModal({
  editing,
  onClose,
}: {
  editing: ApartmentType | null
  onClose: () => void
}) {
  const [form, setForm] = useState<ApartmentTypeFormData>(
    editing ? aptTypeToForm(editing) : EMPTY_APT_FORM
  )
  const [create, { isLoading: creating }] = useCreateApartmentTypeMutation()
  const [update, { isLoading: updating }] = useUpdateApartmentTypeMutation()
  const [error, setError] = useState('')
  const saving = creating || updating

  function field(key: keyof ApartmentTypeFormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const priceKobo = Math.round(parseFloat(form.priceKobo) * 100)
    if (isNaN(priceKobo) || priceKobo < 0) {
      setError('Price must be a valid positive number.')
      return
    }
    const payload = {
      name: form.name.trim(),
      ...(form.description && { description: form.description.trim() }),
      priceKobo,
      isActive: form.isActive,
    }
    try {
      if (editing) {
        await update({ id: editing.id, ...payload }).unwrap()
      } else {
        await create(payload).unwrap()
      }
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <h2 className="text-sm font-bold text-[#283c50]">
            {editing ? 'Edit Apartment Type' : 'New Apartment Type'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors">
            <X className="w-4 h-4 text-[#9ca3af]" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Name *</label>
            <input
              required
              value={form.name}
              onChange={field('name')}
              placeholder="e.g. 2 Bedroom Flat"
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={field('description')}
              placeholder="Optional description…"
              rows={2}
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb] resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Fixed Price (₦) *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.priceKobo}
              onChange={field('priceKobo')}
              placeholder="80000"
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-medium text-[#283c50]">Active</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: form.isActive ? '#17c666' : '#9ca3af' }}
            >
              {form.isActive
                ? <ToggleRight className="w-5 h-5" />
                : <ToggleLeft className="w-5 h-5" />}
              {form.isActive ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {error && <p className="text-[11px] text-[#ea4d4d]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
              style={{ backgroundColor: '#3454d1' }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {editing ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteApartmentTypeConfirm({ apt, onClose }: { apt: ApartmentType; onClose: () => void }) {
  const [deleteApt, { isLoading }] = useDeleteApartmentTypeMutation()
  const [error, setError] = useState('')

  async function confirm() {
    try {
      await deleteApt(apt.id).unwrap()
      onClose()
    } catch {
      setError('Failed to delete. It may be in use.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#fdf0f0' }}>
            <Trash2 className="w-4 h-4" style={{ color: '#ea4d4d' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#283c50]">Delete "{apt.name}"?</p>
            <p className="text-xs text-[#6b7885] mt-1">This cannot be undone. Customers will no longer see this option.</p>
          </div>
        </div>
        {error && <p className="text-[11px] text-[#ea4d4d]">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={isLoading}
            className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: '#ea4d4d' }}
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RateEditor({
  label,
  icon: Icon,
  currentKobo,
  hint,
  onSave,
  saving,
}: {
  label: string
  icon: React.ElementType
  currentKobo: number
  hint: string
  onSave: (kobo: number) => Promise<unknown>
  saving: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function startEdit() {
    setValue(String(currentKobo / 100))
    setError('')
    setEditing(true)
  }

  async function save() {
    const kobo = Math.round(parseFloat(value) * 100)
    if (isNaN(kobo) || kobo < 0) {
      setError('Enter a valid amount.')
      return
    }
    try {
      await onSave(kobo)
      setEditing(false)
    } catch {
      setError('Failed to save.')
    }
  }

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#eef1fb' }}>
        <Icon className="w-4.5 h-4.5 text-[#3454d1]" style={{ width: 18, height: 18 }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[#9ca3af]">₦</span>
            <input
              type="number"
              min="0"
              step="0.01"
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError('') }}
              className="w-28 text-xs border border-[#e5e7eb] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb]"
            />
            {error && <span className="text-[11px] text-[#ea4d4d]">{error}</span>}
          </div>
        ) : (
          <p className="text-lg font-bold text-[#283c50] leading-tight mt-0.5">{formatNaira(currentKobo)}</p>
        )}
        <p className="text-[11px] text-[#9ca3af] mt-0.5">{hint}</p>
      </div>
      {editing ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setEditing(false)}
            className="text-xs px-2.5 py-1.5 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="text-xs px-2.5 py-1.5 rounded text-white font-semibold disabled:opacity-50 flex items-center gap-1"
            style={{ backgroundColor: '#3454d1' }}
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Save
          </button>
        </div>
      ) : (
        <button
          onClick={startEdit}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#eef1fb] transition-colors shrink-0"
          title="Edit rate"
        >
          <Pencil className="w-3.5 h-3.5 text-[#3454d1]" />
        </button>
      )}
    </div>
  )
}

function PricingTab() {
  const { data: pricing, isLoading, isError } = useGetTruckPricingQuery()
  const { data: allAptTypes = [], isLoading: loadingApt } = useGetAdminApartmentTypesQuery()
  const [updatePerKm, { isLoading: savingKm }] = useUpdatePerKmRateMutation()
  const [updatePerLoader, { isLoading: savingLoader }] = useUpdatePerLoaderRateMutation()
  const [showAptForm, setShowAptForm] = useState(false)
  const [editingApt, setEditingApt] = useState<ApartmentType | null>(null)
  const [deletingApt, setDeletingApt] = useState<ApartmentType | null>(null)

  const activeApt = allAptTypes.filter((a) => a.isActive).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-xs text-[#9ca3af]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading pricing…
      </div>
    )
  }

  if (isError || !pricing) {
    return <div className="text-center py-24 text-xs text-[#ea4d4d]">Failed to load pricing config.</div>
  }

  return (
    <div className="space-y-6">
      {/* Global rates */}
      <div>
        <h3 className="text-xs font-semibold text-[#283c50] mb-3">Global Rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RateEditor
            label="Per-km Rate"
            icon={Gauge}
            currentKobo={pricing.perKmKobo}
            hint="Charged per kilometre of route distance"
            onSave={(kobo) => updatePerKm({ perKmKobo: kobo }).unwrap()}
            saving={savingKm}
          />
          <RateEditor
            label="Per-loader Rate"
            icon={Users}
            currentKobo={pricing.perLoaderKobo}
            hint="Charged per loader requested by the customer"
            onSave={(kobo) => updatePerLoader({ perLoaderKobo: kobo }).unwrap()}
            saving={savingLoader}
          />
        </div>
      </div>

      {/* Apartment types */}
      <div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6]">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-semibold text-[#283c50]">Apartment Types</h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: '#e8faf2', color: '#17c666' }}>
                  {activeApt} active
                </span>
                <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                  {allAptTypes.length - activeApt} inactive
                </span>
              </div>
            </div>
            <button
              onClick={() => { setEditingApt(null); setShowAptForm(true) }}
              className="btn-primary flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Type
            </button>
          </div>

          {loadingApt ? (
            <div className="flex items-center justify-center py-12 gap-2 text-xs text-[#9ca3af]">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Apartment Type', 'Fixed Price', 'Status', 'Last Updated', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9fafb]">
                  {allAptTypes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-xs text-[#9ca3af]">
                        No apartment types yet. Add one to get started.
                      </td>
                    </tr>
                  ) : (
                    allAptTypes.map((a) => (
                      <tr key={a.id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-[#eef1fb] flex items-center justify-center shrink-0">
                              <Home className="w-3.5 h-3.5 text-[#3454d1]" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#283c50]">{a.name}</p>
                              {a.description && (
                                <p className="text-[11px] text-[#9ca3af] truncate max-w-[200px]">{a.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-[#283c50]">{formatNaira(a.priceKobo)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[11px] font-medium rounded-full px-2 py-0.5"
                            style={
                              a.isActive
                                ? { backgroundColor: '#e8faf2', color: '#17c666' }
                                : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                            }
                          >
                            {a.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-[#9ca3af]">{formatDateTime(a.updatedAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditingApt(a); setShowAptForm(true) }}
                              className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#eef1fb] transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#3454d1]" />
                            </button>
                            <button
                              onClick={() => setDeletingApt(a)}
                              className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#fdf0f0] transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#ea4d4d]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAptForm && (
        <ApartmentTypeModal
          editing={editingApt}
          onClose={() => { setShowAptForm(false); setEditingApt(null) }}
        />
      )}
      {deletingApt && (
        <DeleteApartmentTypeConfirm apt={deletingApt} onClose={() => setDeletingApt(null)} />
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TrucksPage() {
  const [tab, setTab] = useState<'types' | 'bookings' | 'pricing'>('types')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50]">Trucks</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Manage truck types, pricing, and booking orders</p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 p-1 bg-[#f3f4f6] rounded w-fit">
        {([
          { value: 'types', label: 'Truck Types' },
          { value: 'bookings', label: 'Bookings' },
          { value: 'pricing', label: 'Pricing' },
        ] as const).map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="text-xs font-medium px-4 py-1.5 rounded transition-all"
            style={
              tab === t.value
                ? { backgroundColor: '#fff', color: '#3454d1', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                : { color: '#6b7885' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'types' && <TruckTypesTab />}
      {tab === 'bookings' && <BookingsTab />}
      {tab === 'pricing' && <PricingTab />}
    </div>
  )
}
