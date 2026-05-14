'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  FileText,
  Eye,
  EyeOff,
  MapPin,
  Store,
  User,
  FileCheck,
  ArrowRight,
  Phone,
  Mail,
  Building2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Business info
  name: string
  type: string
  description: string
  cuisines: string

  // Step 2 — Location & contact
  address: string
  lat: string
  lng: string
  phone: string
  email: string

  // Step 3 — Owner account
  ownerFirstName: string
  ownerLastName: string
  ownerPassword: string
  ownerPasswordConfirm: string
}

interface Files {
  businessRegistration: File | null
  governmentId: File | null
  utilityBill: File | null
}

const INITIAL_FORM: FormData = {
  name: '', type: '', description: '', cuisines: '',
  address: '', lat: '', lng: '', phone: '', email: '',
  ownerFirstName: '', ownerLastName: '', ownerPassword: '', ownerPasswordConfirm: '',
}

const INITIAL_FILES: Files = {
  businessRegistration: null,
  governmentId: null,
  utilityBill: null,
}

const STEPS = [
  { id: 1, label: 'Business Info',   icon: Store },
  { id: 2, label: 'Location',        icon: MapPin },
  { id: 3, label: 'Owner Account',   icon: User },
  { id: 4, label: 'Documents',       icon: FileCheck },
]

const VENDOR_TYPES = [
  { value: 'RESTAURANT', label: 'Restaurant / Food' },
  { value: 'GROCERY',    label: 'Grocery / Supermarket' },
  { value: 'RETAIL',     label: 'Retail Store' },
  { value: 'PHARMACY',   label: 'Pharmacy' },
]

// ─── Input helper ─────────────────────────────────────────────

function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#283c50] mb-1.5">
        {label}{required && <span className="text-[#ea4d4d] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#9ca3af] mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#283c50] placeholder:text-[#c4c9cf] focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1] transition-all'

// ─── File upload drop zone ────────────────────────────────────

function FileDropZone({
  label, hint, value, onChange,
}: {
  label: string; hint: string; value: File | null; onChange: (f: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const accept = (f: File) => {
    const ok = f.type.startsWith('image/') || f.type === 'application/pdf'
    if (!ok) return
    onChange(f)
  }

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) accept(f)
  }, [])

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) accept(f)
    e.target.value = ''
  }

  const fmt = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <p className="text-xs font-semibold text-[#283c50] mb-1.5">{label} <span className="text-[#ea4d4d]">*</span></p>
      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#3454d1] bg-[#eef1fb]">
          <div className="w-8 h-8 rounded-lg bg-[#3454d1] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#283c50] truncate">{value.name}</p>
            <p className="text-[11px] text-[#9ca3af]">{fmt(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] text-[#9ca3af] hover:text-[#283c50] transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="cursor-pointer rounded-lg border-2 border-dashed transition-all p-5 text-center"
          style={{
            borderColor: dragging ? '#3454d1' : '#e5e7eb',
            backgroundColor: dragging ? '#eef1fb' : '#fafafa',
          }}
        >
          <Upload className="w-5 h-5 text-[#9ca3af] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#283c50]">Drop file here or click to upload</p>
          <p className="text-[11px] text-[#9ca3af] mt-1">{hint}</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onFile} />
    </div>
  )
}

// ─── Step progress bar ────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done = s.id < current
        const active = s.id === current
        const Icon = s.icon
        return (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0"
                style={{
                  background: done ? '#17c666' : active ? '#3454d1' : '#f3f4f6',
                  color: done || active ? '#fff' : '#9ca3af',
                }}
              >
                {done
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <Icon className="w-4 h-4" />}
              </div>
              <p
                className="text-[10px] font-semibold mt-1 whitespace-nowrap"
                style={{ color: active ? '#3454d1' : done ? '#17c666' : '#9ca3af' }}
              >
                {s.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all"
                style={{ background: done ? '#17c666' : '#e5e7eb' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Success screen ───────────────────────────────────────────

function SuccessScreen({ vendorName }: { vendorName: string }) {
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#17c666,#0fa356)' }}>
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-[#283c50] mb-3">Application Submitted!</h2>
      <p className="text-sm text-[#6b7885] mb-2 max-w-sm mx-auto leading-relaxed">
        Thank you for applying to join Godrop as a vendor. Your application for{' '}
        <strong className="text-[#283c50]">{vendorName}</strong> has been received.
      </p>
      <div className="inline-flex items-center gap-2 bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] text-xs font-semibold rounded-lg px-4 py-2.5 my-4">
        <AlertCircle className="w-4 h-4" />
        Our team will review your application within 1–2 business days
      </div>
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-4 py-3 my-4 text-left max-w-sm mx-auto">
        <p className="text-xs font-semibold text-[#1d4ed8] mb-1">You can get started now</p>
        <p className="text-xs text-[#1d4ed8] leading-relaxed">
          Log in to your dashboard and start uploading your products or menu. They will only become
          visible to customers once your application is approved.
        </p>
      </div>
      <p className="text-xs text-[#9ca3af] mb-8">
        Check your email for a confirmation with next steps.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 bg-[#3454d1] hover:bg-[#2a43a8] text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors"
      >
        Log In to Dashboard <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────

export default function VendorOnboardingPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [files, setFiles] = useState<Files>(INITIAL_FILES)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | keyof Files, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)

  const set = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const setFile = (field: keyof Files, value: File | null) =>
    setFiles((f) => ({ ...f, [field]: value }))

  function useCurrentLocation() {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }))
        setGeoLoading(false)
      },
      () => setGeoLoading(false)
    )
  }

  // ── Validation per step ────────────────────────────────────

  function validateStep(n: number): boolean {
    const errs: typeof errors = {}

    if (n === 1) {
      if (!form.name.trim() || form.name.length < 2) errs.name = 'Business name is required (min 2 characters)'
      if (!form.type) errs.type = 'Please select a business type'
    }

    if (n === 2) {
      if (!form.address.trim() || form.address.length < 5) errs.address = 'Full address is required'
      const latN = parseFloat(form.lat)
      const lngN = parseFloat(form.lng)
      if (!form.lat || isNaN(latN) || latN < -90 || latN > 90) errs.lat = 'Enter a valid latitude (e.g. 6.4314)'
      if (!form.lng || isNaN(lngN) || lngN < -180 || lngN > 180) errs.lng = 'Enter a valid longitude (e.g. 3.4703)'
      if (!form.phone || !/^\+234\d{10}$/.test(form.phone)) errs.phone = 'Phone must be in format +234XXXXXXXXXX'
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    }

    if (n === 3) {
      if (!form.ownerFirstName.trim()) errs.ownerFirstName = 'First name is required'
      if (!form.ownerLastName.trim()) errs.ownerLastName = 'Last name is required'
      if (form.ownerPassword.length < 8) errs.ownerPassword = 'Password must be at least 8 characters'
      if (form.ownerPassword !== form.ownerPasswordConfirm) errs.ownerPasswordConfirm = 'Passwords do not match'
    }

    if (n === 4) {
      if (!files.businessRegistration) errs.businessRegistration = 'Business registration document is required'
      if (!files.governmentId) errs.governmentId = 'Government-issued ID is required'
      if (!files.utilityBill) errs.utilityBill = 'Utility bill is required'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() {
    if (validateStep(step)) setStep((s) => s + 1)
  }

  function back() {
    setErrors({})
    setStep((s) => s - 1)
  }

  // ── Submit ─────────────────────────────────────────────────

  async function submit() {
    if (!validateStep(4)) return

    setLoading(true)
    setSubmitError('')

    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('type', form.type)
      if (form.description.trim()) fd.append('description', form.description.trim())
      fd.append('address', form.address.trim())
      fd.append('lat', form.lat)
      fd.append('lng', form.lng)
      fd.append('phone', form.phone.trim())
      fd.append('email', form.email.trim())
      if (form.cuisines.trim()) {
        const tags = form.cuisines.split(',').map((s) => s.trim()).filter(Boolean)
        fd.append('cuisines', JSON.stringify(tags))
      }
      fd.append('ownerFirstName', form.ownerFirstName.trim())
      fd.append('ownerLastName', form.ownerLastName.trim())
      fd.append('ownerPassword', form.ownerPassword)
      fd.append('businessRegistration', files.businessRegistration!)
      fd.append('governmentId', files.governmentId!)
      fd.append('utilityBill', files.utilityBill!)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
      const res = await fetch(`${apiUrl}/vendor`, { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? json.message ?? 'Something went wrong. Please try again.')
      }

      setDone(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f2f8' }}>

      {/* Left decorative panel (desktop only) */}
      <div
        className="hidden lg:flex lg:w-80 xl:w-96 flex-col justify-between p-10 shrink-0"
        style={{ background: '#3454d1' }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white text-base font-bold tracking-tight">G</span>
            </div>
            <span className="text-xl font-bold text-white">
              Go<span style={{ color: '#fde68a' }}>drop</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white leading-snug mb-3">
            Sell more.<br />Reach more<br />customers.
          </h2>
          <p className="text-sm text-white/70 leading-relaxed mb-8">
            Join hundreds of vendors already earning on Nigeria&apos;s fastest-growing delivery platform.
          </p>

          {[
            { icon: Store, text: 'Reach thousands of customers across your location' },
            { icon: ArrowRight, text: 'Same-day delivery powered by our rider network' },
            { icon: Building2, text: 'Simple, transparent earnings — paid weekly' },
            { icon: Phone, text: 'Dedicated vendor support team' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-sm text-white/80 leading-snug">{text}</p>
            </div> 
          ))}
        </div>

        <p className="text-[11px] text-white/30 tracking-widest uppercase">
          © {new Date().getFullYear()} Godrop 
        </p>
      </div>

      {/* Right: form area */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto py-8 px-4">
        <div className="w-full max-w-xl">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#3454d1] flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="text-xl font-bold text-[#283c50]">
              Go<span className="text-[#3454d1]">drop</span>
            </span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-card-md p-7">

            {done ? (
              <SuccessScreen vendorName={form.name} />
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-[#283c50]">Vendor Registration</h1>
                  <p className="text-xs text-[#9ca3af] mt-1">
                    Step {step} of {STEPS.length} — {STEPS[step - 1].label}
                  </p>
                </div>

                <StepBar current={step} />

                {/* ── Step 1: Business Info ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <Field label="Business Name" required>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="e.g. Mama's Kitchen"
                        className={inputCls}
                      />
                      {errors.name && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.name}</p>}
                    </Field>

                    <Field label="Business Type" required>
                      <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
                        <option value="">Select type…</option>
                        {VENDOR_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      {errors.type && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.type}</p>}
                    </Field>

                    <Field label="Description" hint="A short description of what you sell (optional)">
                      <textarea
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)}
                        placeholder="e.g. Authentic Nigerian soups and stews, freshly prepared daily."
                        rows={3}
                        className={inputCls + ' resize-none'}
                      />
                    </Field>

                    {form.type === 'RESTAURANT' && (
                      <Field label="Cuisines" hint="Comma-separated. e.g. Nigerian, Soups, Grills">
                        <input
                          type="text"
                          value={form.cuisines}
                          onChange={(e) => set('cuisines', e.target.value)}
                          placeholder="Nigerian, Continental, Fast food"
                          className={inputCls}
                        />
                      </Field>
                    )}
                  </div>
                )}

                {/* ── Step 2: Location & Contact ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <Field label="Business Address" required>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => set('address', e.target.value)}
                        placeholder="14 Admiralty Way, Lekki Phase 1, Lagos"
                        className={inputCls}
                      />
                      {errors.address && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.address}</p>}
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Latitude" required hint="Lagos: ~6.3 – 6.6">
                        <input
                          type="number"
                          step="any"
                          value={form.lat}
                          onChange={(e) => set('lat', e.target.value)}
                          placeholder="6.4314"
                          className={inputCls}
                        />
                        {errors.lat && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.lat}</p>}
                      </Field>
                      <Field label="Longitude" required hint="Lagos: ~3.3 – 3.6">
                        <input
                          type="number"
                          step="any"
                          value={form.lng}
                          onChange={(e) => set('lng', e.target.value)}
                          placeholder="3.4703"
                          className={inputCls}
                        />
                        {errors.lng && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.lng}</p>}
                      </Field>
                    </div>

                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      disabled={geoLoading}
                      className="flex items-center gap-1.5 text-xs text-[#3454d1] hover:underline font-medium disabled:opacity-50"
                    >
                      {geoLoading
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting…</>
                        : <><MapPin className="w-3.5 h-3.5" /> Use my current location</>}
                    </button>

                    <Field label="Business Phone" required hint="Must be a Nigerian number: +234XXXXXXXXXX">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => set('phone', e.target.value)}
                          placeholder="+2348012345678"
                          className={inputCls + ' pl-9'}
                        />
                      </div>
                      {errors.phone && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.phone}</p>}
                    </Field>

                    <Field label="Business Email" required hint="This will be your login email">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => set('email', e.target.value)}
                          placeholder="owner@yourbusiness.ng"
                          className={inputCls + ' pl-9'}
                        />
                      </div>
                      {errors.email && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.email}</p>}
                    </Field>
                  </div>
                )}

                {/* ── Step 3: Owner Account ── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="bg-[#eef1fb] rounded-lg px-4 py-3 text-xs text-[#3454d1] leading-relaxed">
                      <strong>Owner Account</strong> — These details are for the business owner who will manage the store.
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First Name" required>
                        <input
                          type="text"
                          value={form.ownerFirstName}
                          onChange={(e) => set('ownerFirstName', e.target.value)}
                          placeholder="Ada"
                          className={inputCls}
                        />
                        {errors.ownerFirstName && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.ownerFirstName}</p>}
                      </Field>
                      <Field label="Last Name" required>
                        <input
                          type="text"
                          value={form.ownerLastName}
                          onChange={(e) => set('ownerLastName', e.target.value)}
                          placeholder="Okafor"
                          className={inputCls}
                        />
                        {errors.ownerLastName && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.ownerLastName}</p>}
                      </Field>
                    </div>

                    <Field label="Password" required hint="Minimum 8 characters">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={form.ownerPassword}
                          onChange={(e) => set('ownerPassword', e.target.value)}
                          placeholder="••••••••"
                          className={inputCls + ' pr-10'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7885]"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.ownerPassword && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.ownerPassword}</p>}
                    </Field>

                    <Field label="Confirm Password" required>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={form.ownerPasswordConfirm}
                          onChange={(e) => set('ownerPasswordConfirm', e.target.value)}
                          placeholder="••••••••"
                          className={inputCls + ' pr-10'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7885]"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.ownerPasswordConfirm && <p className="text-[11px] text-[#ea4d4d] mt-1">{errors.ownerPasswordConfirm}</p>}
                    </Field>
                  </div>
                )}

                {/* ── Step 4: Documents ── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg px-4 py-3 text-xs text-[#92400e] leading-relaxed">
                      <strong>Required documents:</strong> We need to verify your business before it goes live.
                      Upload clear images (JPG/PNG) or PDF files — max 10 MB each.
                    </div>

                    <FileDropZone
                      label="Business Registration Certificate (CAC)"
                      hint="Certificate of incorporation or business name registration · JPG, PNG or PDF · Max 10 MB"
                      value={files.businessRegistration}
                      onChange={(f) => setFile('businessRegistration', f)}
                    />
                    {errors.businessRegistration && (
                      <p className="text-[11px] text-[#ea4d4d] -mt-3">{errors.businessRegistration}</p>
                    )}

                    <FileDropZone
                      label="Government-Issued ID (Owner)"
                      hint="NIN slip, international passport, driver's licence, or voter's card · JPG, PNG or PDF"
                      value={files.governmentId}
                      onChange={(f) => setFile('governmentId', f)}
                    />
                    {errors.governmentId && (
                      <p className="text-[11px] text-[#ea4d4d] -mt-3">{errors.governmentId}</p>
                    )}

                    <FileDropZone
                      label="Utility Bill"
                      hint="Recent electricity, water, or tenancy agreement showing your business address · Max 10 MB"
                      value={files.utilityBill}
                      onChange={(f) => setFile('utilityBill', f)}
                    />
                    {errors.utilityBill && (
                      <p className="text-[11px] text-[#ea4d4d] -mt-3">{errors.utilityBill}</p>
                    )}

                    {submitError && (
                      <div className="flex items-start gap-2.5 text-xs text-[#ea4d4d] bg-[#fdf0f0] border border-[#fca5a5] rounded-lg px-4 py-3">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {submitError}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#f3f4f6]">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={back}
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#6b7885] hover:text-[#283c50] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="text-sm font-semibold text-[#6b7885] hover:text-[#283c50] transition-colors"
                    >
                      ← Back to Login
                    </Link>
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={next}
                      className="flex items-center gap-2 bg-[#3454d1] hover:bg-[#2a43a8] text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-[0_4px_14px_rgba(52,84,209,0.25)]"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submit}
                      disabled={loading}
                      className="flex items-center gap-2 bg-[#3454d1] hover:bg-[#2a43a8] text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-[0_4px_14px_rgba(52,84,209,0.25)] disabled:opacity-60"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                      ) : (
                        <>Submit Application <CheckCircle2 className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer note */}
          {!done && (
            <p className="text-center text-xs text-[#9ca3af] mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-[#3454d1] font-semibold hover:underline">
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
