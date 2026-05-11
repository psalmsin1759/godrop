'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import Link from 'next/link'
import {
  ChevronRight, ChevronLeft, Loader2, AlertCircle, CheckCircle2,
  Upload, X, FileText, User, MapPin, Bike, FileCheck, ArrowRight,
  Phone, Mail, ExternalLink,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Personal
  firstName: string
  lastName: string
  phone: string
  email: string

  // Step 2 — Address
  dateOfBirth: string
  gender: string
  streetAddress: string
  city: string
  state: string

  // Step 3 — Vehicle & License
  vehicleType: string
  vehiclePlate: string
  vehicleColor: string
  vehicleModel: string
  vehicleYear: string
  driverLicenseNumber: string
  driverLicenseExpiry: string
  vehicleInsuranceExpiry: string
  bvn: string
  nin: string

  // Step 4 — Guarantor
  guarantorName: string
  guarantorPhone: string
  guarantorAddress: string
}

interface Files {
  vehiclePapers: File[]
  governmentId: File | null
  guarantorGovernmentId: File | null
}

const INITIAL_FORM: FormData = {
  firstName: '', lastName: '', phone: '', email: '',
  dateOfBirth: '', gender: '', streetAddress: '', city: '', state: '',
  vehicleType: '', vehiclePlate: '', vehicleColor: '', vehicleModel: '',
  vehicleYear: '', driverLicenseNumber: '', driverLicenseExpiry: '',
  vehicleInsuranceExpiry: '', bvn: '', nin: '',
  guarantorName: '', guarantorPhone: '', guarantorAddress: '',
}

const INITIAL_FILES: Files = {
  vehiclePapers: [],
  governmentId: null,
  guarantorGovernmentId: null,
}

const STEPS = [
  { id: 1, label: 'Personal',   icon: User },
  { id: 2, label: 'Address',    icon: MapPin },
  { id: 3, label: 'Vehicle',    icon: Bike },
  { id: 4, label: 'Guarantor',  icon: User },
  { id: 5, label: 'Documents',  icon: FileCheck },
]

const VEHICLE_TYPES = [
  { value: 'BICYCLE',    label: 'Bicycle' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'CAR',        label: 'Car' },
  { value: 'VAN',        label: 'Van' },
]

const STATES = [
  'Lagos', 'Abuja', 'Rivers', 'Kano', 'Oyo', 'Kaduna', 'Anambra',
  'Delta', 'Ogun', 'Imo', 'Enugu', 'Edo', 'Borno', 'Plateau', 'Cross River',
]

// ─── Helpers ──────────────────────────────────────────────────

function Field({ label, required, children, hint, error }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string; error?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#283c50] mb-1.5">
        {label}{required && <span className="text-[#ea4d4d] ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-[#9ca3af] mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-[#ea4d4d] mt-1">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#283c50] placeholder:text-[#c4c9cf] focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1] transition-all'

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Single-file drop zone
function FileDropZone({ label, hint, value, onChange }: {
  label: string; hint: string; value: File | null; onChange: (f: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const accept = (f: File) => {
    const ok = f.type.startsWith('image/') || f.type === 'application/pdf'
    if (ok) onChange(f)
  }

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) accept(f)
  }, [])

  return (
    <div>
      <p className="text-xs font-semibold text-[#283c50] mb-1.5">{label}</p>
      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#3454d1] bg-[#eef1fb]">
          <div className="w-8 h-8 rounded-lg bg-[#3454d1] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#283c50] truncate">{value.name}</p>
            <p className="text-[11px] text-[#9ca3af]">{fmt(value.size)}</p>
          </div>
          <button type="button" onClick={() => onChange(null)}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] text-[#9ca3af] hover:text-[#283c50] transition-colors shrink-0">
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
          style={{ borderColor: dragging ? '#3454d1' : '#e5e7eb', backgroundColor: dragging ? '#eef1fb' : '#fafafa' }}
        >
          <Upload className="w-5 h-5 text-[#9ca3af] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#283c50]">Drop file here or click to upload</p>
          <p className="text-[11px] text-[#9ca3af] mt-1">{hint}</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) accept(f); e.target.value = '' }} />
    </div>
  )
}

// Multi-file drop zone for vehicle papers
function MultiFileDropZone({ label, hint, files, onChange }: {
  label: string; hint: string; files: File[]; onChange: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming).filter(
      (f) => f.type.startsWith('image/') || f.type === 'application/pdf'
    )
    const merged = [...files, ...valid].slice(0, 5)
    onChange(merged)
  }

  const remove = (i: number) => onChange(files.filter((_, idx) => idx !== i))

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [files])

  return (
    <div>
      <p className="text-xs font-semibold text-[#283c50] mb-1.5">{label}</p>
      {files.length > 0 && (
        <div className="space-y-2 mb-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#3454d1] bg-[#eef1fb]">
              <div className="w-8 h-8 rounded-lg bg-[#3454d1] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#283c50] truncate">{f.name}</p>
                <p className="text-[11px] text-[#9ca3af]">{fmt(f.size)}</p>
              </div>
              <button type="button" onClick={() => remove(i)}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] text-[#9ca3af] hover:text-[#283c50] transition-colors shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length < 5 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="cursor-pointer rounded-lg border-2 border-dashed transition-all p-5 text-center"
          style={{ borderColor: dragging ? '#3454d1' : '#e5e7eb', backgroundColor: dragging ? '#eef1fb' : '#fafafa' }}
        >
          <Upload className="w-5 h-5 text-[#9ca3af] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#283c50]">
            {files.length === 0 ? 'Drop files here or click to upload' : `Add more (${files.length}/5)`}
          </p>
          <p className="text-[11px] text-[#9ca3af] mt-1">{hint}</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
    </div>
  )
}

// ─── Step bar ─────────────────────────────────────────────────

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
              <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0"
                style={{ background: done ? '#17c666' : active ? '#3454d1' : '#f3f4f6', color: done || active ? '#fff' : '#9ca3af' }}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <p className="text-[10px] font-semibold mt-1 whitespace-nowrap"
                style={{ color: active ? '#3454d1' : done ? '#17c666' : '#9ca3af' }}>
                {s.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all"
                style={{ background: done ? '#17c666' : '#e5e7eb' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Success screen ───────────────────────────────────────────

function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#17c666,#0fa356)' }}>
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-[#283c50] mb-3">Application Submitted!</h2>
      <p className="text-sm text-[#6b7885] mb-2 max-w-sm mx-auto leading-relaxed">
        Welcome, <strong className="text-[#283c50]">{name}</strong>! Your rider application has been received.
      </p>
      <div className="inline-flex items-center gap-2 bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] text-xs font-semibold rounded-lg px-4 py-2.5 my-4">
        <AlertCircle className="w-4 h-4" />
        Our team will review your application within 1–2 business days
      </div>
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-4 py-3 my-4 text-left max-w-sm mx-auto">
        <p className="text-xs font-semibold text-[#1d4ed8] mb-1">What happens next?</p>
        <p className="text-xs text-[#1d4ed8] leading-relaxed">
          Once your documents are verified, you'll receive a notification on your phone. Log in with your
          phone number via OTP to start accepting deliveries.
        </p>
      </div>
      <p className="text-xs text-[#9ca3af] mb-8">
        Keep your phone accessible — we'll send you an OTP when your account is approved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#3454d1] hover:bg-[#2a43a8] text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors"
      >
        Back to Home <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────

export default function RiderOnboardingPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [files, setFiles] = useState<Files>(INITIAL_FILES)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  function err(field: string) { return errors[field] }

  // ── Validation ─────────────────────────────────────────────

  function validateStep(n: number): boolean {
    const e: Record<string, string> = {}

    if (n === 1) {
      if (!form.firstName.trim()) e.firstName = 'First name is required'
      if (!form.lastName.trim()) e.lastName = 'Last name is required'
      if (!/^\+234\d{10}$/.test(form.phone)) e.phone = 'Phone must be +234XXXXXXXXXX'
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    }

    if (n === 2) {
      if (!form.city.trim()) e.city = 'City is required'
      if (!form.state) e.state = 'State is required'
    }

    if (n === 3) {
      if (!form.vehicleType) e.vehicleType = 'Vehicle type is required'
    }

    if (n === 4) {
      if (!form.guarantorName.trim()) e.guarantorName = 'Guarantor name is required'
      if (!form.guarantorPhone.trim()) e.guarantorPhone = 'Guarantor phone is required'
      if (!form.guarantorAddress.trim()) e.guarantorAddress = 'Guarantor address is required'
    }

    if (n === 5) {
      if (files.vehiclePapers.length === 0) e.vehiclePapers = 'Upload at least one vehicle paper'
      if (!files.governmentId) e.governmentId = 'Government-issued ID is required'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() { if (validateStep(step)) setStep((s) => s + 1) }
  function back() { setErrors({}); setStep((s) => s - 1) }

  // ── Submit ─────────────────────────────────────────────────

  async function submit() {
    if (!validateStep(5)) return

    setLoading(true)
    setSubmitError('')

    try {
      const fd = new FormData()

      // Scalar fields
      const fields: (keyof typeof form)[] = [
        'firstName', 'lastName', 'phone', 'email',
        'dateOfBirth', 'gender', 'streetAddress', 'city', 'state',
        'vehicleType', 'vehiclePlate', 'vehicleColor', 'vehicleModel', 'vehicleYear',
        'driverLicenseNumber', 'driverLicenseExpiry', 'vehicleInsuranceExpiry',
        'bvn', 'nin',
      ]
      for (const f of fields) {
        if (form[f]) fd.append(f, form[f] as string)
      }

      // Guarantor as JSON array
      if (form.guarantorName) {
        fd.append('guarantors', JSON.stringify([{
          name: form.guarantorName,
          phone: form.guarantorPhone,
          address: form.guarantorAddress,
        }]))
      }

      // Files
      for (const f of files.vehiclePapers) fd.append('vehiclePapers', f)
      if (files.governmentId) fd.append('governmentId', files.governmentId)
      if (files.guarantorGovernmentId) fd.append('guarantorGovernmentId', files.guarantorGovernmentId)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
      const res = await fetch(`${apiUrl}/rider/onboard`, { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? json.message ?? 'Something went wrong. Please try again.')

      setDone(true)
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f2f8' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-80 xl:w-96 flex-col justify-between p-10 shrink-0"
        style={{ background: '#3454d1' }}>
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
            Ride with us.<br />Earn on your<br />own schedule.
          </h2>
          <p className="text-sm text-white/70 leading-relaxed mb-8">
            Join our growing fleet of riders delivering across Lagos. Flexible hours, weekly payouts.
          </p>

          {[
            { icon: Bike,      text: 'Earn ₦1,500–₦5,000+ per day on deliveries' },
            { icon: Phone,     text: 'Simple app — accept orders with one tap' },
            { icon: ArrowRight, text: 'Weekly earnings paid straight to your bank' },
            { icon: User,      text: 'Dedicated rider support team 7 days a week' },
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
          © {new Date().getFullYear()} Godrop Technologies
        </p>
      </div>

      {/* Right: form */}
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

          <div className="bg-white rounded-2xl shadow-card-md p-7">
            {done ? (
              <SuccessScreen name={form.firstName} />
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-[#283c50]">Rider Application</h1>
                  <p className="text-xs text-[#9ca3af] mt-1">
                    Step {step} of {STEPS.length} — {STEPS[step - 1].label}
                  </p>
                </div>

                <StepBar current={step} />

                {/* ── Step 1: Personal Info ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First Name" required error={err('firstName')}>
                        <input type="text" value={form.firstName} onChange={(e) => set('firstName', e.target.value)}
                          placeholder="Emeka" className={inputCls} />
                      </Field>
                      <Field label="Last Name" required error={err('lastName')}>
                        <input type="text" value={form.lastName} onChange={(e) => set('lastName', e.target.value)}
                          placeholder="Okafor" className={inputCls} />
                      </Field>
                    </div>

                    <Field label="Phone Number" required hint="Nigerian number in format +234XXXXXXXXXX" error={err('phone')}>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                        <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                          placeholder="+2348012345678" className={inputCls + ' pl-9'} />
                      </div>
                    </Field>

                    <Field label="Email Address" hint="Optional — for account notifications" error={err('email')}>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                          placeholder="emeka@example.com" className={inputCls + ' pl-9'} />
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── Step 2: Address ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Date of Birth" hint="YYYY-MM-DD">
                        <input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)}
                          className={inputCls} />
                      </Field>
                      <Field label="Gender">
                        <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls}>
                          <option value="">Select…</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Street Address" hint="House number and street name">
                      <input type="text" value={form.streetAddress} onChange={(e) => set('streetAddress', e.target.value)}
                        placeholder="14 Admiralty Way, Lekki Phase 1" className={inputCls} />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="City" required error={err('city')}>
                        <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                          placeholder="Lagos" className={inputCls} />
                      </Field>
                      <Field label="State" required error={err('state')}>
                        <select value={form.state} onChange={(e) => set('state', e.target.value)} className={inputCls}>
                          <option value="">Select…</option>
                          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Vehicle & License ── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <Field label="Vehicle Type" required error={err('vehicleType')}>
                      <select value={form.vehicleType} onChange={(e) => set('vehicleType', e.target.value)} className={inputCls}>
                        <option value="">Select vehicle type…</option>
                        {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Plate Number">
                        <input type="text" value={form.vehiclePlate} onChange={(e) => set('vehiclePlate', e.target.value)}
                          placeholder="LND-234AB" className={inputCls} />
                      </Field>
                      <Field label="Vehicle Color">
                        <input type="text" value={form.vehicleColor} onChange={(e) => set('vehicleColor', e.target.value)}
                          placeholder="Red" className={inputCls} />
                      </Field>
                      <Field label="Make / Model">
                        <input type="text" value={form.vehicleModel} onChange={(e) => set('vehicleModel', e.target.value)}
                          placeholder="Bajaj Boxer" className={inputCls} />
                      </Field>
                      <Field label="Year">
                        <input type="number" value={form.vehicleYear} onChange={(e) => set('vehicleYear', e.target.value)}
                          placeholder="2020" min={1990} max={2030} className={inputCls} />
                      </Field>
                    </div>

                    <div className="border-t border-[#f3f4f6] pt-4">
                      <p className="text-xs font-bold text-[#283c50] mb-3">License & Compliance</p>
                      <div className="space-y-3">
                        <Field label="Driver's License Number">
                          <input type="text" value={form.driverLicenseNumber}
                            onChange={(e) => set('driverLicenseNumber', e.target.value)}
                            placeholder="MHW12345678901" className={inputCls} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="License Expiry" hint="YYYY-MM-DD">
                            <input type="date" value={form.driverLicenseExpiry}
                              onChange={(e) => set('driverLicenseExpiry', e.target.value)} className={inputCls} />
                          </Field>
                          <Field label="Insurance Expiry" hint="YYYY-MM-DD">
                            <input type="date" value={form.vehicleInsuranceExpiry}
                              onChange={(e) => set('vehicleInsuranceExpiry', e.target.value)} className={inputCls} />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="BVN" hint="11 digits">
                            <input type="text" value={form.bvn} onChange={(e) => set('bvn', e.target.value)}
                              placeholder="12345678901" maxLength={11} className={inputCls} />
                          </Field>
                          <Field label="NIN" hint="11 digits">
                            <input type="text" value={form.nin} onChange={(e) => set('nin', e.target.value)}
                              placeholder="12345678901" maxLength={11} className={inputCls} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 4: Guarantor ── */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg px-4 py-3 text-xs text-[#92400e] leading-relaxed">
                      <strong>Guarantor:</strong> A person who vouches for your character and can be contacted in case of issues. Please provide accurate information.
                    </div>

                    <Field label="Full Name" required error={err('guarantorName')}>
                      <input type="text" value={form.guarantorName}
                        onChange={(e) => set('guarantorName', e.target.value)}
                        placeholder="Chukwuemeka Obi" className={inputCls} />
                    </Field>

                    <Field label="Phone Number" required error={err('guarantorPhone')}>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                        <input type="tel" value={form.guarantorPhone}
                          onChange={(e) => set('guarantorPhone', e.target.value)}
                          placeholder="+2348023456789" className={inputCls + ' pl-9'} />
                      </div>
                    </Field>

                    <Field label="Home Address" required error={err('guarantorAddress')}>
                      <textarea value={form.guarantorAddress}
                        onChange={(e) => set('guarantorAddress', e.target.value)}
                        placeholder="House number, street, area, city…"
                        rows={2} className={inputCls + ' resize-none'} />
                    </Field>

                    <FileDropZone
                      label="Guarantor's Government-Issued ID (optional)"
                      hint="NIN slip, passport, driver's licence, or voter's card · JPG, PNG or PDF · Max 10 MB"
                      value={files.guarantorGovernmentId}
                      onChange={(f) => setFiles((prev) => ({ ...prev, guarantorGovernmentId: f }))}
                    />
                  </div>
                )}

                {/* ── Step 5: Documents ── */}
                {step === 5 && (
                  <div className="space-y-5">
                    <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg px-4 py-3 text-xs text-[#92400e] leading-relaxed">
                      <strong>Required documents:</strong> Upload clear images (JPG/PNG) or PDF files — max 10 MB each. Vehicle papers support up to 5 files.
                    </div>

                    <div>
                      <MultiFileDropZone
                        label="Vehicle Papers (Registration / Roadworthiness)"
                        hint="Certificate of ownership, roadworthiness, or insurance · JPG, PNG or PDF · Up to 5 files"
                        files={files.vehiclePapers}
                        onChange={(f) => setFiles((prev) => ({ ...prev, vehiclePapers: f }))}
                      />
                      {err('vehiclePapers') && (
                        <p className="text-[11px] text-[#ea4d4d] mt-1">{err('vehiclePapers')}</p>
                      )}
                    </div>

                    <div>
                      <FileDropZone
                        label="Government-Issued ID (Rider)"
                        hint="NIN slip, international passport, driver's licence, or voter's card · JPG, PNG or PDF"
                        value={files.governmentId}
                        onChange={(f) => setFiles((prev) => ({ ...prev, governmentId: f }))}
                      />
                      {err('governmentId') && (
                        <p className="text-[11px] text-[#ea4d4d] mt-1">{err('governmentId')}</p>
                      )}
                    </div>

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
                    <button type="button" onClick={back}
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#6b7885] hover:text-[#283c50] transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <Link href="/login"
                      className="text-sm font-semibold text-[#6b7885] hover:text-[#283c50] transition-colors">
                      ← Back to Login
                    </Link>
                  )}

                  {step < 5 ? (
                    <button type="button" onClick={next}
                      className="flex items-center gap-2 bg-[#3454d1] hover:bg-[#2a43a8] text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-[0_4px_14px_rgba(52,84,209,0.25)]">
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={submit} disabled={loading}
                      className="flex items-center gap-2 bg-[#3454d1] hover:bg-[#2a43a8] text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-[0_4px_14px_rgba(52,84,209,0.25)] disabled:opacity-60">
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                        : <><CheckCircle2 className="w-4 h-4" /> Submit Application</>}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {!done && (
            <p className="text-center text-xs text-[#9ca3af] mt-5">
              Already a rider?{' '}
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
