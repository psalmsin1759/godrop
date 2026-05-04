'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useGetAdminParcelVehicleTypesQuery,
  useCreateParcelVehicleTypeMutation,
  useUpdateParcelVehicleTypeMutation,
  useDeleteParcelVehicleTypeMutation,
  useGetParcelOrdersQuery,
} from './store/parcelsApi'
import type { ParcelVehicleType, OrderStatus } from '@/types/api'
import { formatNaira, formatDateTime } from '@/lib/utils'
import {
  Plus, Pencil, Trash2, Loader2, Package, X, ChevronLeft,
  ChevronRight, Search, CheckCircle2, ToggleLeft, ToggleRight,
  ExternalLink,
} from 'lucide-react'

// ─── Vehicle Type Form ─────────────────────────────────────────────────────

interface VehicleTypeFormData {
  name: string
  description: string
  imageUrl: string
  baseFeeKobo: string
  perKmKobo: string
  isActive: boolean
}

const EMPTY_FORM: VehicleTypeFormData = {
  name: '',
  description: '',
  imageUrl: '',
  baseFeeKobo: '',
  perKmKobo: '',
  isActive: true,
}

function typeToForm(t: ParcelVehicleType): VehicleTypeFormData {
  return {
    name: t.name,
    description: t.description ?? '',
    imageUrl: t.imageUrl ?? '',
    baseFeeKobo: String(t.baseFeeKobo / 100),
    perKmKobo: String(t.perKmKobo / 100),
    isActive: t.isActive,
  }
}

function VehicleTypeModal({
  editing,
  onClose,
}: {
  editing: ParcelVehicleType | null
  onClose: () => void
}) {
  const [form, setForm] = useState<VehicleTypeFormData>(
    editing ? typeToForm(editing) : EMPTY_FORM
  )
  const [create, { isLoading: creating }] = useCreateParcelVehicleTypeMutation()
  const [update, { isLoading: updating }] = useUpdateParcelVehicleTypeMutation()
  const [error, setError] = useState('')
  const saving = creating || updating

  function field(key: keyof VehicleTypeFormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const baseFeeKobo = Math.round(parseFloat(form.baseFeeKobo) * 100)
    const perKmKobo = Math.round(parseFloat(form.perKmKobo) * 100)
    if (isNaN(baseFeeKobo) || isNaN(perKmKobo)) {
      setError('Base fee and per-km rate must be valid numbers.')
      return
    }
    const payload = {
      name: form.name.trim(),
      ...(form.description && { description: form.description.trim() }),
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
            {editing ? 'Edit Vehicle Type' : 'New Vehicle Type'}
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
              placeholder="e.g. Motorcycle"
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={field('description')}
              placeholder="e.g. Best for small parcels under 5 kg"
              rows={2}
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb] resize-none"
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
                placeholder="500"
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
                placeholder="80"
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

function DeleteVehicleTypeConfirm({ vehicleType, onClose }: { vehicleType: ParcelVehicleType; onClose: () => void }) {
  const [deleteType, { isLoading }] = useDeleteParcelVehicleTypeMutation()
  const [error, setError] = useState('')

  async function confirm() {
    try {
      await deleteType(vehicleType.id).unwrap()
      onClose()
    } catch {
      setError('Failed to delete. It may have active orders.')
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
            <p className="text-sm font-bold text-[#283c50]">Delete "{vehicleType.name}"?</p>
            <p className="text-xs text-[#6b7885] mt-1">This action cannot be undone. Customers will no longer see this option.</p>
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

// ─── Vehicle Types Tab ─────────────────────────────────────────────────────

function VehicleTypesTab() {
  const { data: types = [], isLoading, isError } = useGetAdminParcelVehicleTypesQuery()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ParcelVehicleType | null>(null)
  const [deleting, setDeleting] = useState<ParcelVehicleType | null>(null)

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
              <Package style={{ color: s.color, width: 18, height: 18 }} />
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
          <h3 className="text-xs font-semibold text-[#283c50]">Vehicle Types</h3>
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
          <div className="text-center py-16 text-xs text-[#ea4d4d]">Failed to load vehicle types.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                  {['Type', 'Base Fee', 'Per km', 'Status', 'Last Updated', ''].map((h) => (
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
                      No vehicle types yet. Add one to get started.
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
                              <Package className="w-4 h-4 text-[#3454d1]" />
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
                        <span className="text-[11px] text-[#9ca3af]">{formatDateTime(t.updatedAt)}</span>
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
        <VehicleTypeModal
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
      {deleting && (
        <DeleteVehicleTypeConfirm vehicleType={deleting} onClose={() => setDeleting(null)} />
      )}
    </div>
  )
}

// ─── Orders Tab ────────────────────────────────────────────────────────────

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

function OrdersTab() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 15

  const { data, isLoading, isError } = useGetParcelOrdersQuery(
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
            <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">Failed to load parcel orders.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Tracking Code', 'Status', 'Amount', 'Placed At', ''].map((h) => (
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
                        No parcel orders found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => {
                      const s = ORDER_STATUS_CONFIG[order.status]
                      return (
                        <tr
                          key={order.id}
                          onClick={() => router.push(`/orders/${order.id}`)}
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
                {meta ? `${meta.total.toLocaleString()} total orders` : ''}
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

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ParcelsPage() {
  const [tab, setTab] = useState<'types' | 'orders'>('types')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50]">Parcels</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Manage parcel vehicle types and delivery orders</p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 p-1 bg-[#f3f4f6] rounded w-fit">
        {([
          { value: 'types', label: 'Vehicle Types' },
          { value: 'orders', label: 'Orders' },
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

      {tab === 'types' && <VehicleTypesTab />}
      {tab === 'orders' && <OrdersTab />}
    </div>
  )
}
