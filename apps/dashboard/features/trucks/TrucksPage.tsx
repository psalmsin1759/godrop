'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useGetTruckTypesQuery,
  useUploadTruckTypeImageMutation,
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
import { exportToCsv } from '@/lib/exportCsv'
import {
  Plus, Pencil, Trash2, Loader2, Truck, X, ChevronLeft,
  ChevronRight, Search, CheckCircle2, ToggleLeft, ToggleRight,
  Home, Gauge, Users, ExternalLink, ImageIcon, Upload, Download,
} from 'lucide-react'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function TruckTypeImageField({
  value,
  onChange,
  onClear,
}: {
  value: string
  onChange: (url: string) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadImage, { isLoading }] = useUploadTruckTypeImageMutation()
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setError('')
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 2 MB or smaller.')
      return
    }
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { url } = await uploadImage(fd).unwrap()
      onChange(url)
    } catch {
      setError('Upload failed. Please try again.')
    }
  }

  return (
    <div>
      <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">Image</label>
      <div
        className="relative mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors"
        style={{
          borderColor: error ? '#FF3B30' : '#E7EAF1',
          minHeight: 100,
          cursor: isLoading ? 'default' : 'pointer',
        }}
        onClick={() => !isLoading && inputRef.current?.click()}
      >
        {value ? (
          <div className="relative py-3">
            <img
              src={value}
              alt="Truck type preview"
              className="w-20 h-20 object-cover rounded-lg border border-[#E7EAF1]"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
              style={{ backgroundColor: '#FF3B30' }}
              title="Remove image"
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
              style={{ backgroundColor: '#1E5FFF' }}
              title="Replace image"
            >
              <Upload className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1E5FFF' }} />
            <span className="text-[11px] text-[#9AA1B4]">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E7EEFF' }}>
              <ImageIcon className="w-4.5 h-4.5" style={{ color: '#1E5FFF', width: 18, height: 18 }} />
            </div>
            <span className="text-[11px] text-[#525A72]">Click to upload (optional)</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </div>
      <p className="text-[11px] text-[#9AA1B4] mt-1">Max 2 MB · JPG, PNG, WebP</p>
      {error && <p className="text-[11px] mt-1" style={{ color: '#FF3B30' }}>{error}</p>}
    </div>
  )
}

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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDF0F6]">
          <h2 className="text-sm font-bold text-[#0D1426]">
            {editing ? 'Edit Truck Type' : 'New Truck Type'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#EDF0F6] transition-colors">
            <X className="w-4 h-4 text-[#9AA1B4]" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">Name *</label>
            <input
              required
              value={form.name}
              onChange={field('name')}
              placeholder="e.g. Mini Van"
              className="mt-1 w-full text-xs border border-[#E7EAF1] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={field('description')}
              placeholder="Short description of the truck type…"
              rows={2}
              className="mt-1 w-full text-xs border border-[#E7EAF1] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC] resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">Capacity</label>
            <input
              value={form.capacity}
              onChange={field('capacity')}
              placeholder="e.g. 1 tonne, 3 bedrooms"
              className="mt-1 w-full text-xs border border-[#E7EAF1] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">Base Fee (₦) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.baseFeeKobo}
                onChange={field('baseFeeKobo')}
                placeholder="5000"
                className="mt-1 w-full text-xs border border-[#E7EAF1] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">Per km (₦) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.perKmKobo}
                onChange={field('perKmKobo')}
                placeholder="200"
                className="mt-1 w-full text-xs border border-[#E7EAF1] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC]"
              />
            </div>
          </div>

          <TruckTypeImageField
            value={form.imageUrl}
            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            onClear={() => setForm((f) => ({ ...f, imageUrl: '' }))}
          />

          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-medium text-[#0D1426]">Active</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: form.isActive ? '#1DB980' : '#9AA1B4' }}
            >
              {form.isActive
                ? <ToggleRight className="w-5 h-5" />
                : <ToggleLeft className="w-5 h-5" />}
              {form.isActive ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {error && <p className="text-[11px] text-[#FF3B30]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
              style={{ backgroundColor: '#1E5FFF' }}
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
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#FFE3E1' }}>
            <Trash2 className="w-4 h-4" style={{ color: '#FF3B30' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0D1426]">Delete "{truckType.name}"?</p>
            <p className="text-xs text-[#525A72] mt-1">This action cannot be undone. Existing bookings may be affected.</p>
          </div>
        </div>
        {error && <p className="text-[11px] text-[#FF3B30]">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={isLoading}
            className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: '#FF3B30' }}
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
          { label: 'Total Types', value: types.length, color: '#1E5FFF', bg: '#E7EEFF' },
          { label: 'Active', value: active, color: '#1DB980', bg: '#DFF5EC' },
          { label: 'Inactive', value: types.length - active, color: '#9AA1B4', bg: '#EDF0F6' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <Truck style={{ color: s.color, width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0D1426] leading-none">{s.value}</p>
              <p className="text-[11px] text-[#525A72] mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDF0F6]">
          <h3 className="text-xs font-semibold text-[#0D1426]">Truck Types</h3>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Type
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9AA1B4]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#FF3B30]">Failed to load truck types.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                  {['Type', 'Capacity', 'Base Fee', 'Per km', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F9FC]">
                {types.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-xs text-[#9AA1B4]">
                      No truck types yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  types.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F7F9FC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {t.imageUrl ? (
                            <img src={t.imageUrl} alt={t.name} className="w-8 h-8 rounded object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-[#E7EEFF] flex items-center justify-center shrink-0">
                              <Truck className="w-4 h-4 text-[#1E5FFF]" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-[#0D1426]">{t.name}</p>
                            {t.description && (
                              <p className="text-[11px] text-[#9AA1B4] truncate max-w-[200px]">{t.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#525A72]">{t.capacity ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-[#0D1426]">{formatNaira(t.baseFeeKobo)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-[#0D1426]">{formatNaira(t.perKmKobo)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] font-medium rounded-full px-2 py-0.5"
                          style={
                            t.isActive
                              ? { backgroundColor: '#DFF5EC', color: '#1DB980' }
                              : { backgroundColor: '#EDF0F6', color: '#9AA1B4' }
                          }
                        >
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditing(t); setShowForm(true) }}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#E7EEFF] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#1E5FFF]" />
                          </button>
                          <button
                            onClick={() => setDeleting(t)}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#FFE3E1] transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#FF3B30]" />
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
  PENDING: { bg: '#FBEDD7', text: '#E8930C', label: 'Pending' },
  ACCEPTED: { bg: '#FFEAE1', text: '#FF6A2C', label: 'Accepted' },
  PREPARING: { bg: '#F0EAFA', text: '#7A5AE0', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready' },
  PICKED_UP: { bg: '#FBEDD7', text: '#E8930C', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#E7EEFF', text: '#1E5FFF', label: 'In Transit' },
  DELIVERED: { bg: '#DFF5EC', text: '#1DB980', label: 'Delivered' },
  CANCELLED: { bg: '#FFE3E1', text: '#FF3B30', label: 'Cancelled' },
  FAILED: { bg: '#EDF0F6', text: '#9AA1B4', label: 'Failed' },
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
          <div className="flex items-center gap-0.5 p-1 bg-[#EDF0F6] rounded overflow-x-auto">
            {STATUS_TABS.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1) }}
                className="text-xs font-medium px-3 py-1.5 rounded transition-all whitespace-nowrap"
                style={
                  statusFilter === s.value
                    ? { backgroundColor: '#fff', color: '#1E5FFF', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                    : { color: '#525A72' }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA1B4]" />
            <input
              type="text"
              placeholder="Search tracking code…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] w-52"
            />
          </div>
          <button
            type="button"
            onClick={() => exportToCsv('truck-bookings', filtered, [
              { header: 'Tracking Code', value: (o) => o.trackingCode },
              { header: 'Status', value: (o) => o.status },
              { header: 'Amount', value: (o) => formatNaira(o.totalKobo) },
              { header: 'Booked At', value: (o) => formatDateTime(o.createdAt) },
            ])}
            className="flex items-center gap-1.5 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded px-3 py-1.5 hover:bg-[#F7F9FC]"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9AA1B4]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading bookings…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#FF3B30]">Failed to load bookings.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                    {['Tracking Code', 'Status', 'Amount', 'Booked At', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F9FC]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-xs text-[#9AA1B4]">
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
                          className="hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold text-[#1E5FFF]">
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
                            <span className="text-xs font-semibold text-[#0D1426]">
                              {formatNaira(order.totalKobo)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-[#9AA1B4]">
                              {formatDateTime(order.createdAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <ExternalLink className="w-3.5 h-3.5 text-[#9AA1B4]" />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#EDF0F6]">
              <p className="text-xs text-[#9AA1B4]">
                {meta ? `${meta.total.toLocaleString()} total bookings` : ''}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-7 h-7 rounded flex items-center justify-center text-[#525A72] hover:bg-[#EDF0F6] disabled:opacity-40 disabled:cursor-not-allowed"
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
                        ? { backgroundColor: '#1E5FFF', color: '#fff', fontWeight: 600 }
                        : { color: '#525A72' }
                    }
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-7 h-7 rounded flex items-center justify-center text-[#525A72] hover:bg-[#EDF0F6] disabled:opacity-40 disabled:cursor-not-allowed"
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDF0F6]">
          <h2 className="text-sm font-bold text-[#0D1426]">
            {editing ? 'Edit Apartment Type' : 'New Apartment Type'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#EDF0F6] transition-colors">
            <X className="w-4 h-4 text-[#9AA1B4]" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">Name *</label>
            <input
              required
              value={form.name}
              onChange={field('name')}
              placeholder="e.g. 2 Bedroom Flat"
              className="mt-1 w-full text-xs border border-[#E7EAF1] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={field('description')}
              placeholder="Optional description…"
              rows={2}
              className="mt-1 w-full text-xs border border-[#E7EAF1] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC] resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">Fixed Price (₦) *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.priceKobo}
              onChange={field('priceKobo')}
              placeholder="80000"
              className="mt-1 w-full text-xs border border-[#E7EAF1] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-medium text-[#0D1426]">Active</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: form.isActive ? '#1DB980' : '#9AA1B4' }}
            >
              {form.isActive
                ? <ToggleRight className="w-5 h-5" />
                : <ToggleLeft className="w-5 h-5" />}
              {form.isActive ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {error && <p className="text-[11px] text-[#FF3B30]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
              style={{ backgroundColor: '#1E5FFF' }}
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
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#FFE3E1' }}>
            <Trash2 className="w-4 h-4" style={{ color: '#FF3B30' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0D1426]">Delete "{apt.name}"?</p>
            <p className="text-xs text-[#525A72] mt-1">This cannot be undone. Customers will no longer see this option.</p>
          </div>
        </div>
        {error && <p className="text-[11px] text-[#FF3B30]">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={isLoading}
            className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: '#FF3B30' }}
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
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E7EEFF' }}>
        <Icon className="w-4.5 h-4.5 text-[#1E5FFF]" style={{ width: 18, height: 18 }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[#9AA1B4]">₦</span>
            <input
              type="number"
              min="0"
              step="0.01"
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError('') }}
              className="w-28 text-xs border border-[#E7EAF1] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC]"
            />
            {error && <span className="text-[11px] text-[#FF3B30]">{error}</span>}
          </div>
        ) : (
          <p className="text-lg font-bold text-[#0D1426] leading-tight mt-0.5">{formatNaira(currentKobo)}</p>
        )}
        <p className="text-[11px] text-[#9AA1B4] mt-0.5">{hint}</p>
      </div>
      {editing ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setEditing(false)}
            className="text-xs px-2.5 py-1.5 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="text-xs px-2.5 py-1.5 rounded text-white font-semibold disabled:opacity-50 flex items-center gap-1"
            style={{ backgroundColor: '#1E5FFF' }}
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Save
          </button>
        </div>
      ) : (
        <button
          onClick={startEdit}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#E7EEFF] transition-colors shrink-0"
          title="Edit rate"
        >
          <Pencil className="w-3.5 h-3.5 text-[#1E5FFF]" />
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
      <div className="flex items-center justify-center py-24 gap-2 text-xs text-[#9AA1B4]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading pricing…
      </div>
    )
  }

  if (isError || !pricing) {
    return <div className="text-center py-24 text-xs text-[#FF3B30]">Failed to load pricing config.</div>
  }

  return (
    <div className="space-y-6">
      {/* Global rates */}
      <div>
        <h3 className="text-xs font-semibold text-[#0D1426] mb-3">Global Rates</h3>
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
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDF0F6]">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-semibold text-[#0D1426]">Apartment Types</h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: '#DFF5EC', color: '#1DB980' }}>
                  {activeApt} active
                </span>
                <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: '#EDF0F6', color: '#9AA1B4' }}>
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
            <div className="flex items-center justify-center py-12 gap-2 text-xs text-[#9AA1B4]">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                    {['Apartment Type', 'Fixed Price', 'Status', 'Last Updated', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F9FC]">
                  {allAptTypes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-xs text-[#9AA1B4]">
                        No apartment types yet. Add one to get started.
                      </td>
                    </tr>
                  ) : (
                    allAptTypes.map((a) => (
                      <tr key={a.id} className="hover:bg-[#F7F9FC] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-[#E7EEFF] flex items-center justify-center shrink-0">
                              <Home className="w-3.5 h-3.5 text-[#1E5FFF]" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#0D1426]">{a.name}</p>
                              {a.description && (
                                <p className="text-[11px] text-[#9AA1B4] truncate max-w-[200px]">{a.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-[#0D1426]">{formatNaira(a.priceKobo)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[11px] font-medium rounded-full px-2 py-0.5"
                            style={
                              a.isActive
                                ? { backgroundColor: '#DFF5EC', color: '#1DB980' }
                                : { backgroundColor: '#EDF0F6', color: '#9AA1B4' }
                            }
                          >
                            {a.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-[#9AA1B4]">{formatDateTime(a.updatedAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditingApt(a); setShowAptForm(true) }}
                              className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#E7EEFF] transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#1E5FFF]" />
                            </button>
                            <button
                              onClick={() => setDeletingApt(a)}
                              className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#FFE3E1] transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#FF3B30]" />
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
          <h1 className="text-lg font-bold text-[#0D1426]">Trucks</h1>
          <p className="text-xs text-[#9AA1B4] mt-0.5">Manage truck types, pricing, and booking orders</p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 p-1 bg-[#EDF0F6] rounded w-fit">
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
                ? { backgroundColor: '#fff', color: '#1E5FFF', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                : { color: '#525A72' }
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
