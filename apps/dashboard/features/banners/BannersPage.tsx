'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  useListBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useUploadBannerImageMutation,
  useDeleteBannerMutation,
} from '@/features/banners/store/bannersApi'
import type { Banner, CreateBannerRequest, UpdateBannerRequest } from '@/types/api'
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  ImagePlus,
  Eye,
  EyeOff,
  GripVertical,
  X,
  Tag,
} from 'lucide-react'

// ─── helpers ──────────────────────────────────────────────────────────────────

function inp(extra = '') {
  return `w-full text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] px-3 py-1.5 text-[#0D1426] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] ${extra}`
}

// ─── Banner form dialog ───────────────────────────────────────────────────────

interface BannerFormProps {
  initial?: Banner
  onClose: () => void
}

function BannerFormDialog({ initial, onClose }: BannerFormProps) {
  const isEdit = !!initial
  const [createBanner, { isLoading: creating }] = useCreateBannerMutation()
  const [updateBanner, { isLoading: updating }] = useUpdateBannerMutation()
  const [uploadImage, { isLoading: uploading }] = useUploadBannerImageMutation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.imageUrl ?? null)
  const [error, setError] = useState('')

  const [form, setForm] = useState<CreateBannerRequest>({
    badge: initial?.badge ?? '',
    title: initial?.title ?? '',
    ctaLabel: initial?.ctaLabel ?? '',
    linkType: initial?.linkType ?? '',
    linkValue: initial?.linkValue ?? '',
    isActive: initial?.isActive ?? true,
    sortOrder: initial?.sortOrder ?? 0,
  })

  function set<K extends keyof CreateBannerRequest>(k: K, v: CreateBannerRequest[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.badge?.trim() && !form.title?.trim() && !form.ctaLabel?.trim() && !imageFile && !imagePreview) {
      setError('Add at least a badge, title, CTA label, or image so the card has content')
      return
    }

    try {
      const payload: CreateBannerRequest = {
        ...form,
        badge: form.badge?.trim() || null,
        title: form.title?.trim() || null,
        ctaLabel: form.ctaLabel?.trim() || null,
        linkType: form.linkType?.trim() || null,
        linkValue: form.linkValue?.trim() || null,
      }

      let saved: Banner
      if (isEdit) {
        saved = await updateBanner({ id: initial.id, body: payload as UpdateBannerRequest }).unwrap()
      } else {
        saved = await createBanner(payload).unwrap()
      }

      if (imageFile) {
        await uploadImage({ id: saved.id, file: imageFile }).unwrap()
      }

      onClose()
    } catch (err: any) {
      setError(err?.data?.error ?? 'Something went wrong')
    }
  }

  const busy = creating || updating || uploading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF1F7]">
          <h2 className="text-sm font-semibold text-[#0D1426]">{isEdit ? 'Edit Promo Banner' : 'New Promo Banner'}</h2>
          <button onClick={onClose} className="text-[#9AA1B4] hover:text-[#0D1426] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image upload */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] mb-2">
              Background Image <span className="text-[#9AA1B4] normal-case">(optional — falls back to the orange gradient)</span>
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-[#E7EAF1] rounded-lg overflow-hidden cursor-pointer hover:border-[#1E5FFF] transition-colors"
              style={{ height: 120 }}
            >
              {imagePreview ? (
                <Image src={imagePreview} alt="preview" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#9AA1B4]">
                  <ImagePlus className="w-6 h-6 mb-1" />
                  <span className="text-xs">Click to upload image</span>
                  <span className="text-[10px] mt-0.5">JPG, PNG — max 5 MB</span>
                </div>
              )}
              {imagePreview && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <ImagePlus className="w-5 h-5 text-white" />
                  <span className="text-white text-xs ml-1">Change image</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            {imageFile && <p className="text-[10px] text-[#9AA1B4] mt-1">{imageFile.name}</p>}
          </div>

          {/* Badge */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Badge <span className="text-[#9AA1B4] normal-case">(optional)</span></label>
            <input className={inp()} placeholder="LIMITED · ENDS SOON" value={form.badge ?? ''} onChange={(e) => set('badge', e.target.value)} />
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Title <span className="text-[#9AA1B4] normal-case">(optional)</span></label>
            <textarea className={inp('resize-none')} rows={2} placeholder="FREE delivery on&#10;parcels under 5kg" value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} />
            <p className="text-[10px] text-[#9AA1B4] mt-0.5">Use a new line for line breaks in the card</p>
          </div>

          {/* CTA label */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">CTA Label <span className="text-[#9AA1B4] normal-case">(optional)</span></label>
            <input className={inp()} placeholder="Use code GODROP5" value={form.ctaLabel ?? ''} onChange={(e) => set('ctaLabel', e.target.value)} />
          </div>

          {/* Link type + value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Link Type <span className="text-[#9AA1B4] normal-case">(optional)</span></label>
              <input className={inp()} placeholder="route / promo / url" value={form.linkType ?? ''} onChange={(e) => set('linkType', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Link Value <span className="text-[#9AA1B4] normal-case">(optional)</span></label>
              <input className={inp()} placeholder="/parcel or GODROP5" value={form.linkValue ?? ''} onChange={(e) => set('linkValue', e.target.value)} />
            </div>
          </div>

          {/* Sort order */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] block mb-1">Sort Order</label>
            <input type="number" min={0} className={inp()} value={form.sortOrder} onChange={(e) => set('sortOrder', parseInt(e.target.value) || 0)} />
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
            <span className="text-xs text-[#0D1426]">{form.isActive ? 'Active — visible on customer home screen' : 'Inactive — hidden from customer home screen'}</span>
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
              {isEdit ? 'Save Changes' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteDialog({ banner, onClose }: { banner: Banner; onClose: () => void }) {
  const [deleteBanner, { isLoading }] = useDeleteBannerMutation()

  async function confirm() {
    await deleteBanner(banner.id).unwrap()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-sm font-semibold text-[#0D1426] mb-2">Delete promo banner?</h3>
        <p className="text-xs text-[#9AA1B4] mb-5">
          <strong className="text-[#0D1426]">"{banner.title?.split('\n')[0] || banner.badge || 'This banner'}"</strong> will be permanently removed from the customer app home screen.
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

// ─── Banner card ──────────────────────────────────────────────────────────────

function BannerCard({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  banner: Banner
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-colors ${banner.isActive ? 'border-[#E7EAF1]' : 'border-dashed border-[#E7EAF1] opacity-60'}`}>
      {/* Preview strip */}
      <div className="relative h-28 overflow-hidden" style={{ background: 'linear-gradient(135deg,#FF6A2C,#FF8A50)' }}>
        {banner.imageUrl && (
          <Image src={banner.imageUrl} alt={banner.title ?? 'banner'} fill className="object-cover opacity-80" />
        )}
        {banner.badge && (
          <div className="absolute top-2 left-2 bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {banner.badge}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/40 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
          <GripVertical className="w-2.5 h-2.5" />
          {banner.sortOrder}
        </div>
        {banner.ctaLabel && (
          <div className="absolute bottom-2 left-2 bg-white text-[#FF6A2C] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {banner.ctaLabel}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs font-bold text-[#0D1426] leading-tight mb-2 line-clamp-2 min-h-[2rem]" style={{ whiteSpace: 'pre-line' }}>
          {banner.title || <span className="text-[#9AA1B4] font-normal italic">No title</span>}
        </p>

        {(banner.linkType || banner.linkValue) && (
          <div className="flex items-center gap-1 text-[10px] text-[#9AA1B4] mb-3">
            <Tag className="w-3 h-3" />
            <span className="truncate">{banner.linkType ?? 'link'}: {banner.linkValue ?? '—'}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleActive}
            title={banner.isActive ? 'Deactivate' : 'Activate'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              banner.isActive
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-[#F7F9FC] text-[#9AA1B4] hover:bg-[#EEF1F7]'
            }`}
          >
            {banner.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {banner.isActive ? 'Active' : 'Inactive'}
          </button>
          <div className="ml-auto flex gap-1">
            <button onClick={onEdit} className="p-1.5 rounded hover:bg-[#EEF1F7] text-[#9AA1B4] hover:text-[#1E5FFF] transition-colors" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 text-[#9AA1B4] hover:text-red-500 transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BannersPage() {
  const { data: banners = [], isLoading, isError } = useListBannersQuery()
  const [updateBanner] = useUpdateBannerMutation()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [deleting, setDeleting] = useState<Banner | null>(null)

  function toggleActive(banner: Banner) {
    updateBanner({ id: banner.id, body: { isActive: !banner.isActive } })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0D1426]">Promo Banners</h1>
          <p className="text-xs text-[#9AA1B4] mt-0.5">
            Manage the "use code" promo card on the customer app home screen — {banners.filter((b) => b.isActive).length} of {banners.length} active
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs bg-[#1E5FFF] text-white rounded-lg hover:bg-[#0A3FD1] transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          New Banner
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-[#E7EEFF] border border-[#C7D9FF] rounded-lg px-4 py-3 text-xs text-[#1E5FFF]">
        <strong>Tip:</strong> The customer app shows the first active banner, ordered by Sort Order (lowest first). If no banner is active, the section is hidden entirely from the home screen.
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E5FFF]" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-red-500">Failed to load banners. Refresh to try again.</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-[#9AA1B4] mb-4">No promo banners yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#1E5FFF] text-white rounded-lg hover:bg-[#0A3FD1] mx-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Create your first banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...banners].sort((a, b) => a.sortOrder - b.sortOrder).map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onEdit={() => setEditing(banner)}
              onDelete={() => setDeleting(banner)}
              onToggleActive={() => toggleActive(banner)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showCreate && <BannerFormDialog onClose={() => setShowCreate(false)} />}
      {editing && <BannerFormDialog initial={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteDialog banner={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
