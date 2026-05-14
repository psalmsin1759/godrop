'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  useListHeroesQuery,
  useCreateHeroMutation,
  useUpdateHeroMutation,
  useUploadHeroImageMutation,
  useDeleteHeroMutation,
} from '@/features/heroes/store/heroesApi'
import type { Hero, CreateHeroRequest, UpdateHeroRequest, HeroAlign } from '@/types/api'
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
  AlignLeft,
  AlignCenter,
} from 'lucide-react'

// ─── helpers ──────────────────────────────────────────────────────────────────

function inp(extra = '') {
  return `w-full text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1.5 text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#3454d1] ${extra}`
}

// ─── Hero form dialog ─────────────────────────────────────────────────────────

interface HeroFormProps {
  initial?: Hero
  onClose: () => void
}

function HeroFormDialog({ initial, onClose }: HeroFormProps) {
  const isEdit = !!initial
  const [createHero, { isLoading: creating }] = useCreateHeroMutation()
  const [updateHero, { isLoading: updating }] = useUpdateHeroMutation()
  const [uploadImage, { isLoading: uploading }] = useUploadHeroImageMutation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.imageUrl ?? null)
  const [error, setError] = useState('')

  const [form, setForm] = useState<CreateHeroRequest>({
    badge: initial?.badge ?? '',
    heading: initial?.heading ?? '',
    subheading: initial?.subheading ?? '',
    align: initial?.align ?? 'left',
    isActive: initial?.isActive ?? true,
    sortOrder: initial?.sortOrder ?? 0,
    ctaLabel: initial?.ctaLabel ?? '',
    ctaLink: initial?.ctaLink ?? '',
  })

  function set<K extends keyof CreateHeroRequest>(k: K, v: CreateHeroRequest[K]) {
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
    if (!form.heading.trim()) { setError('Heading is required'); return }
    if (!form.subheading.trim()) { setError('Subheading is required'); return }

    try {
      const payload: CreateHeroRequest = {
        ...form,
        badge: form.badge?.trim() || null,
        ctaLabel: form.ctaLabel?.trim() || null,
        ctaLink: form.ctaLink?.trim() || null,
      }

      let saved: Hero
      if (isEdit) {
        saved = await updateHero({ id: initial.id, body: payload as UpdateHeroRequest }).unwrap()
      } else {
        saved = await createHero(payload).unwrap()
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
          <h2 className="text-sm font-semibold text-[#283c50]">{isEdit ? 'Edit Hero Slide' : 'New Hero Slide'}</h2>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#283c50] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image upload */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] mb-2">Background Image</p>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-[#e5e7eb] rounded-lg overflow-hidden cursor-pointer hover:border-[#3454d1] transition-colors"
              style={{ height: 140 }}
            >
              {imagePreview ? (
                <Image src={imagePreview} alt="preview" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#9ca3af]">
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
            {imageFile && <p className="text-[10px] text-[#6b7280] mt-1">{imageFile.name}</p>}
          </div>

          {/* Badge */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] block mb-1">Badge <span className="text-[#9ca3af] normal-case">(optional)</span></label>
            <input className={inp()} placeholder="🍔  FOOD DELIVERY" value={form.badge ?? ''} onChange={(e) => set('badge', e.target.value)} />
          </div>

          {/* Heading */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] block mb-1">Heading <span className="text-red-500">*</span></label>
            <textarea className={inp('resize-none')} rows={2} placeholder="Hot Meals,&#10;Fast Drops" value={form.heading} onChange={(e) => set('heading', e.target.value)} />
            <p className="text-[10px] text-[#9ca3af] mt-0.5">Use a new line for line breaks in the hero display</p>
          </div>

          {/* Subheading */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] block mb-1">Subheading <span className="text-red-500">*</span></label>
            <input className={inp()} placeholder="Restaurant favourites at your doorstep in minutes" value={form.subheading} onChange={(e) => set('subheading', e.target.value)} />
          </div>

          {/* Align + Sort order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] block mb-1">Text Alignment</label>
              <div className="flex gap-2">
                {(['left', 'center'] as HeroAlign[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set('align', a)}
                    className={`flex-1 flex items-center justify-center gap-1.5 border rounded py-1.5 text-xs font-medium transition-colors ${
                      form.align === a
                        ? 'border-[#3454d1] bg-[#eef1fb] text-[#3454d1]'
                        : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#3454d1]'
                    }`}
                  >
                    {a === 'left' ? <AlignLeft className="w-3 h-3" /> : <AlignCenter className="w-3 h-3" />}
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] block mb-1">Sort Order</label>
              <input type="number" min={0} className={inp()} value={form.sortOrder} onChange={(e) => set('sortOrder', parseInt(e.target.value) || 0)} />
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] block mb-1">CTA Label <span className="text-[#9ca3af] normal-case">(optional)</span></label>
              <input className={inp()} placeholder="Order Now" value={form.ctaLabel ?? ''} onChange={(e) => set('ctaLabel', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] block mb-1">CTA Link <span className="text-[#9ca3af] normal-case">(optional)</span></label>
              <input className={inp()} placeholder="/food" value={form.ctaLink ?? ''} onChange={(e) => set('ctaLink', e.target.value)} />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${form.isActive ? 'bg-[#3454d1]' : 'bg-[#e5e7eb]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
            <span className="text-xs text-[#283c50]">{form.isActive ? 'Active — visible on landing page' : 'Inactive — hidden from landing page'}</span>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#f0f0f0]">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-xs border border-[#e5e7eb] rounded text-[#6b7280] hover:border-[#283c50] transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-[#3454d1] text-white rounded hover:bg-[#2a43a8] disabled:opacity-50 transition-colors"
            >
              {busy && <Loader2 className="w-3 h-3 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Hero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteDialog({ hero, onClose }: { hero: Hero; onClose: () => void }) {
  const [deleteHero, { isLoading }] = useDeleteHeroMutation()

  async function confirm() {
    await deleteHero(hero.id).unwrap()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-sm font-semibold text-[#283c50] mb-2">Delete hero slide?</h3>
        <p className="text-xs text-[#6b7280] mb-5">
          <strong className="text-[#283c50]">"{hero.heading.split('\n')[0]}"</strong> will be permanently removed from the landing page.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-xs border border-[#e5e7eb] rounded text-[#6b7280] hover:border-[#283c50] transition-colors">
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

// ─── Image upload dialog ──────────────────────────────────────────────────────

function ImageUploadDialog({ hero, onClose }: { hero: Hero; onClose: () => void }) {
  const [uploadImage, { isLoading }] = useUploadHeroImageMutation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(hero.imageUrl)
  const [error, setError] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  async function upload() {
    if (!file) return
    try {
      await uploadImage({ id: hero.id, file }).unwrap()
      onClose()
    } catch {
      setError('Upload failed. Try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#283c50]">Upload Background Image</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-[#9ca3af]" /></button>
        </div>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative border-2 border-dashed border-[#e5e7eb] rounded-lg overflow-hidden cursor-pointer hover:border-[#3454d1] transition-colors mb-4"
          style={{ height: 180 }}
        >
          {preview ? (
            <Image src={preview} alt="preview" fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#9ca3af]">
              <ImagePlus className="w-8 h-8 mb-2" />
              <span className="text-xs">Click to choose image</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-xs border border-[#e5e7eb] rounded text-[#6b7280]">Cancel</button>
          <button
            onClick={upload}
            disabled={!file || isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-[#3454d1] text-white rounded hover:bg-[#2a43a8] disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Hero card ────────────────────────────────────────────────────────────────

function HeroCard({
  hero,
  onEdit,
  onDelete,
  onUploadImage,
  onToggleActive,
}: {
  hero: Hero
  onEdit: () => void
  onDelete: () => void
  onUploadImage: () => void
  onToggleActive: () => void
}) {
  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-colors ${hero.isActive ? 'border-[#e5e7eb]' : 'border-dashed border-[#e5e7eb] opacity-60'}`}>
      {/* Image strip */}
      <div className="relative h-28 bg-gradient-to-br from-[#283c50] to-[#1a2535] overflow-hidden">
        {hero.imageUrl ? (
          <Image src={hero.imageUrl} alt={hero.heading} fill className="object-cover opacity-80" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={onUploadImage}
              className="flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">Add image</span>
            </button>
          </div>
        )}
        {hero.imageUrl && (
          <button
            onClick={onUploadImage}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded p-1 transition-colors"
            title="Change image"
          >
            <ImagePlus className="w-3 h-3" />
          </button>
        )}
        {/* Badge overlay */}
        {hero.badge && (
          <div className="absolute bottom-2 left-2 bg-[#FF6A2C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {hero.badge}
          </div>
        )}
        {/* Order badge */}
        <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
          <GripVertical className="w-2.5 h-2.5" />
          {hero.sortOrder}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs font-bold text-[#283c50] leading-tight mb-0.5 line-clamp-2" style={{ whiteSpace: 'pre-line' }}>
          {hero.heading}
        </p>
        <p className="text-[10px] text-[#6b7280] line-clamp-2 mb-3">{hero.subheading}</p>

        <div className="flex items-center gap-2 flex-wrap text-[10px] text-[#9ca3af] mb-3">
          <span className="flex items-center gap-0.5">
            {hero.align === 'left' ? <AlignLeft className="w-3 h-3" /> : <AlignCenter className="w-3 h-3" />}
            {hero.align}
          </span>
          {hero.ctaLabel && (
            <span className="bg-[#eef1fb] text-[#3454d1] px-1.5 py-0.5 rounded font-medium">
              CTA: {hero.ctaLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleActive}
            title={hero.isActive ? 'Deactivate' : 'Activate'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              hero.isActive
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-[#f9fafb] text-[#6b7280] hover:bg-[#f0f0f0]'
            }`}
          >
            {hero.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {hero.isActive ? 'Active' : 'Inactive'}
          </button>
          <div className="ml-auto flex gap-1">
            <button onClick={onEdit} className="p-1.5 rounded hover:bg-[#f0f0f0] text-[#6b7280] hover:text-[#3454d1] transition-colors" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 text-[#6b7280] hover:text-red-500 transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HeroesPage() {
  const { data: heroes = [], isLoading, isError } = useListHeroesQuery()
  const [updateHero] = useUpdateHeroMutation()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Hero | null>(null)
  const [deleting, setDeleting] = useState<Hero | null>(null)
  const [uploadingImage, setUploadingImage] = useState<Hero | null>(null)

  function toggleActive(hero: Hero) {
    updateHero({ id: hero.id, body: { isActive: !hero.isActive } })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50]">Hero Slides</h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Manage the landing page hero carousel — {heroes.filter((h) => h.isActive).length} of {heroes.length} active
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs bg-[#3454d1] text-white rounded-lg hover:bg-[#2a43a8] transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          New Hero
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-[#eef1fb] border border-[#c7d2f8] rounded-lg px-4 py-3 text-xs text-[#3454d1]">
        <strong>Tip:</strong> Heroes are shown in order of their Sort Order number (lowest first). Set a hero to inactive to hide it from the landing page without deleting it. Upload a background image for each slide for the best visual impact.
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#3454d1]" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-red-500">Failed to load heroes. Refresh to try again.</div>
      ) : heroes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-[#6b7280] mb-4">No hero slides yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#3454d1] text-white rounded-lg hover:bg-[#2a43a8] mx-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Create your first hero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...heroes].sort((a, b) => a.sortOrder - b.sortOrder).map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              onEdit={() => setEditing(hero)}
              onDelete={() => setDeleting(hero)}
              onUploadImage={() => setUploadingImage(hero)}
              onToggleActive={() => toggleActive(hero)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showCreate && <HeroFormDialog onClose={() => setShowCreate(false)} />}
      {editing && <HeroFormDialog initial={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteDialog hero={deleting} onClose={() => setDeleting(null)} />}
      {uploadingImage && <ImageUploadDialog hero={uploadingImage} onClose={() => setUploadingImage(null)} />}
    </div>
  )
}
