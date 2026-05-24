'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Building2, ChevronRight, ChevronLeft, Upload, CheckCircle, File as FileIcon } from 'lucide-react'
import {
  useGetBusinessesQuery,
  useCreateBusinessMutation,
  useCreateBusinessOwnerMutation,
} from '@/store/services/businessApi'
import { formatNaira } from '@/lib/utils'
import type { BusinessDocumentField, CreateBusinessRequest } from '@/types/api'

// ─── Multi-step create modal ──────────────────────────────────

const STEPS = ['Business Info', 'Owner Details', 'Banking & Docs']

const DOC_FIELDS: { field: BusinessDocumentField; label: string }[] = [
  { field: 'cacCertificateUrl', label: 'CAC Certificate' },
  { field: 'driversLicenseUrl', label: "Driver's Licence" },
  { field: 'insuranceDocumentUrl', label: 'Insurance Document' },
  { field: 'utilityBillUrl', label: 'Utility Bill' },
]

type DocFiles = Record<BusinessDocumentField, File | null>
const EMPTY_DOC_FILES: DocFiles = { cacCertificateUrl: null, driversLicenseUrl: null, insuranceDocumentUrl: null, utilityBillUrl: null }

function DocFilePicker({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#f3f4f6] last:border-0">
      <div className="flex items-center gap-2.5">
        {file
          ? <CheckCircle className="w-4 h-4 text-[#17c666] shrink-0" />
          : <FileIcon className="w-4 h-4 text-[#d1d5db] shrink-0" />}
        <div>
          <p className="text-xs font-medium text-[#283c50]">{label}</p>
          {file
            ? <p className="text-[11px] text-[#6b7885] truncate max-w-[220px]">{file.name}</p>
            : <p className="text-[11px] text-[#9ca3af]">No file chosen</p>}
        </div>
      </div>
      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-xs text-[#6b7885] hover:bg-[#f9fafb] cursor-pointer shrink-0">
        <Upload className="w-3 h-3" />
        {file ? 'Change' : 'Choose'}
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  )
}

const INITIAL_FORM: Omit<CreateBusinessRequest, 'cacCertificateUrl' | 'driversLicenseUrl' | 'insuranceDocumentUrl' | 'utilityBillUrl'> & { ownerPassword: string; ownerFirstName: string; ownerLastName: string } = {
  name: '', email: '', phone: '', address: '',
  cacRegistrationNumber: '', tin: '', yearEstablished: undefined,
  ownerFullName: '', ownerPhoneNumber: '', ownerEmail: '', ownerNIN: '', ownerBVN: '',
  serviceAreas: [],
  bankName: '', accountName: '', accountNumber: '',
  // owner login
  ownerFirstName: '', ownerLastName: '', ownerPassword: '',
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#283c50] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#9ca3af] mt-1">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder }: { value: string | number | undefined; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
    />
  )
}

function CreateBusinessModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [docFiles, setDocFiles] = useState<DocFiles>(EMPTY_DOC_FILES)
  const [serviceAreaInput, setServiceAreaInput] = useState('')
  const [create, { isLoading: creating, error: createError }] = useCreateBusinessMutation()

  function set(field: keyof typeof form, val: any) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  function addServiceArea() {
    const v = serviceAreaInput.trim()
    if (!v || form.serviceAreas?.includes(v)) return
    set('serviceAreas', [...(form.serviceAreas ?? []), v])
    setServiceAreaInput('')
  }

  function removeServiceArea(area: string) {
    set('serviceAreas', form.serviceAreas?.filter((a) => a !== area))
  }

  const docFieldMap: Record<BusinessDocumentField, string> = {
    cacCertificateUrl: 'cacCertificate',
    driversLicenseUrl: 'driversLicense',
    insuranceDocumentUrl: 'insuranceDocument',
    utilityBillUrl: 'utilityBill',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      if (form.email) fd.append('email', form.email)
      if (form.phone) fd.append('phone', form.phone)
      if (form.address) fd.append('address', form.address)
      if (form.cacRegistrationNumber) fd.append('cacRegistrationNumber', form.cacRegistrationNumber)
      if (form.tin) fd.append('tin', form.tin)
      if (form.yearEstablished) fd.append('yearEstablished', String(form.yearEstablished))
      if (form.ownerFullName) fd.append('ownerFullName', form.ownerFullName)
      if (form.ownerPhoneNumber) fd.append('ownerPhoneNumber', form.ownerPhoneNumber)
      if (form.ownerEmail) fd.append('ownerEmail', form.ownerEmail)
      if (form.ownerNIN) fd.append('ownerNIN', form.ownerNIN)
      if (form.ownerBVN) fd.append('ownerBVN', form.ownerBVN)
      if (form.bankName) fd.append('bankName', form.bankName)
      if (form.accountName) fd.append('accountName', form.accountName)
      if (form.accountNumber) fd.append('accountNumber', form.accountNumber)
      form.serviceAreas?.forEach((area) => fd.append('serviceAreas', area))
      if (form.ownerFirstName) fd.append('ownerFirstName', form.ownerFirstName)
      if (form.ownerLastName) fd.append('ownerLastName', form.ownerLastName)
      if (form.ownerPassword) fd.append('ownerPassword', form.ownerPassword)
      DOC_FIELDS.forEach(({ field }) => {
        const file = docFiles[field]
        if (file) fd.append(docFieldMap[field], file)
      })
      const biz = await create(fd).unwrap()
      onCreated(biz.id)
    } catch {}
  }

  const isLoading = creating
  const error = createError

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#283c50]">Create Business</h2>
            <div className="flex items-center gap-1 mt-1.5">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer ${i === step ? 'text-white' : i < step ? 'text-[#17c666] bg-[#e8faf0]' : 'text-[#9ca3af] bg-[#f3f4f6]'}`}
                    style={i === step ? { backgroundColor: '#3454d1' } : {}}
                    onClick={() => i < step && setStep(i)}
                  >
                    {i + 1}. {s}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[#d1d5db]" />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#283c50]"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Business Name *">
                  <Input value={form.name} onChange={(v) => set('name', v)} placeholder="e.g. Speedy Riders Ltd" />
                </Field>
                <Field label="CAC Reg. Number">
                  <Input value={form.cacRegistrationNumber} onChange={(v) => set('cacRegistrationNumber', v)} placeholder="RC 1234567" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="TIN (Tax ID)">
                  <Input value={form.tin} onChange={(v) => set('tin', v)} placeholder="12345678-0001" />
                </Field>
                <Field label="Year Established">
                  <Input value={form.yearEstablished} onChange={(v) => set('yearEstablished', v)} type="number" placeholder="2020" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Business Email">
                  <Input value={form.email} onChange={(v) => set('email', v)} type="email" placeholder="contact@business.ng" />
                </Field>
                <Field label="Business Phone">
                  <Input value={form.phone} onChange={(v) => set('phone', v)} placeholder="+2348012345678" />
                </Field>
              </div>
              <Field label="Address">
                <Input value={form.address} onChange={(v) => set('address', v)} placeholder="15 Broad Street, Lagos Island" />
              </Field>
              <Field label="Service Areas" hint="Press Enter or click Add after each area">
                <div className="flex gap-2">
                  <input
                    value={serviceAreaInput}
                    onChange={(e) => setServiceAreaInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addServiceArea() } }}
                    placeholder="e.g. Lagos Island"
                    className="flex-1 border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
                  />
                  <button type="button" onClick={addServiceArea} className="px-3 py-2 text-sm text-[#3454d1] border border-[#3454d1] rounded-lg hover:bg-[#eef0fb]">Add</button>
                </div>
                {(form.serviceAreas ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.serviceAreas!.map((a) => (
                      <span key={a} className="flex items-center gap-1 text-xs bg-[#eef0fb] text-[#3454d1] px-2 py-0.5 rounded-full">
                        {a}
                        <button type="button" onClick={() => removeServiceArea(a)} className="hover:text-[#ea4d4d]"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-xs text-[#6b7885] -mt-1">Owner details are used for KYC and compliance purposes.</p>
              <Field label="Owner Full Name">
                <Input value={form.ownerFullName} onChange={(v) => set('ownerFullName', v)} placeholder="Adebayo Okafor" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Owner Phone">
                  <Input value={form.ownerPhoneNumber} onChange={(v) => set('ownerPhoneNumber', v)} placeholder="+2348012345678" />
                </Field>
                <Field label="Owner Email">
                  <Input value={form.ownerEmail} onChange={(v) => set('ownerEmail', v)} type="email" placeholder="owner@email.com" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="NIN" hint="Optional">
                  <Input value={form.ownerNIN} onChange={(v) => set('ownerNIN', v)} placeholder="12345678901" />
                </Field>
                <Field label="BVN" hint="Optional — stored securely">
                  <Input value={form.ownerBVN} onChange={(v) => set('ownerBVN', v)} placeholder="22123456789" />
                </Field>
              </div>
              <div className="border-t border-[#e5e7eb] pt-4 mt-2">
                <p className="text-xs font-semibold text-[#283c50] mb-3">Dashboard Login Credentials</p>
                <p className="text-xs text-[#6b7885] mb-3">Leave blank to skip creating a login now and add one later.</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name">
                    <Input value={form.ownerFirstName} onChange={(v) => set('ownerFirstName', v)} />
                  </Field>
                  <Field label="Last Name">
                    <Input value={form.ownerLastName} onChange={(v) => set('ownerLastName', v)} />
                  </Field>
                </div>
                <Field label="Password">
                  <Input value={form.ownerPassword} onChange={(v) => set('ownerPassword', v)} type="password" placeholder="Min 8 characters" />
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Bank Name">
                  <Input value={form.bankName} onChange={(v) => set('bankName', v)} placeholder="GTBank" />
                </Field>
                <Field label="Account Name">
                  <Input value={form.accountName} onChange={(v) => set('accountName', v)} placeholder="Speedy Riders Ltd" />
                </Field>
                <Field label="Account Number">
                  <Input value={form.accountNumber} onChange={(v) => set('accountNumber', v)} placeholder="0123456789" />
                </Field>
              </div>
              <div className="border-t border-[#e5e7eb] pt-4">
                <p className="text-xs font-semibold text-[#283c50] mb-1">Compliance Documents</p>
                <p className="text-xs text-[#6b7885] mb-3">Optional — the business owner can also upload from their dashboard.</p>
                <div>
                  {DOC_FIELDS.map(({ field, label }) => (
                    <DocFilePicker
                      key={field}
                      label={label}
                      file={docFiles[field]}
                      onChange={(f) => setDocFiles((d) => ({ ...d, [field]: f }))}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-xs text-[#ea4d4d]">
              {(error as any)?.data?.error ?? 'Something went wrong. Please try again.'}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6b7885] hover:bg-[#f3f4f6] rounded-lg">Cancel</button>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm text-[#283c50] border border-[#e5e7eb] rounded-lg flex items-center gap-1.5 hover:bg-[#f9fafb]">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => { if (step === 0 && !form.name) return; setStep(step + 1) }}
                className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5"
                style={{ backgroundColor: '#3454d1' }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !form.name}
                className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                style={{ backgroundColor: '#3454d1' }}
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Business
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Add owner modal ──────────────────────────────────────────

function AddOwnerModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '' })
  const [addOwner, { isLoading, error }] = useCreateBusinessOwnerMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await addOwner({ id: businessId, body: form }).unwrap()
      onClose()
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#283c50]">Create Business Owner</h2>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#283c50]"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#283c50] mb-1.5">First Name *</label>
              <input required value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#283c50] mb-1.5">Last Name *</label>
              <input required value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#283c50] mb-1.5">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#283c50] mb-1.5">Password *</label>
            <input required type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]" />
          </div>
          {error && <p className="text-xs text-[#ea4d4d]">{(error as any)?.data?.error ?? 'Failed to create owner'}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6b7885] hover:bg-[#f3f4f6] rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: '#3454d1' }}>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Owner
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────

export default function BusinessesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [addOwnerFor, setAddOwnerFor] = useState<string | null>(null)

  const { data, isLoading } = useGetBusinessesQuery({})
  const businesses = data?.data ?? []

  function handleCreated(id: string) {
    setShowCreate(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#283c50]">Businesses</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg"
          style={{ backgroundColor: '#3454d1' }}
        >
          <Plus className="w-4 h-4" /> Create Business
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-10 h-10 text-[#d1d5db] mx-auto mb-3" />
            <p className="text-sm text-[#6b7885]">No businesses yet.</p>
            <button onClick={() => setShowCreate(true)} className="mt-2 text-sm text-[#3454d1] hover:underline">
              Create the first one
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] border-b border-[#f3f4f6]">
                <th className="px-5 py-3 text-left">Business</th>
                <th className="px-5 py-3 text-left">Owner</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Riders</th>
                <th className="px-5 py-3 text-right">Wallet</th>
                <th className="px-5 py-3 text-right">Admins</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-[#f9fafb]">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#283c50]">{b.name}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{b.cacRegistrationNumber ?? b.email ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3 text-[#6b7885]">
                    <p>{b.ownerFullName ?? '—'}</p>
                    <p className="text-xs">{b.ownerPhoneNumber ?? ''}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      b.status === 'ACTIVE' ? 'bg-[#e8faf0] text-[#17c666]' :
                      b.status === 'SUSPENDED' ? 'bg-[#fef9ec] text-[#f59e0b]' :
                      'bg-[#fef2f2] text-[#ea4d4d]'
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-[#283c50] font-medium">{b._count?.riders ?? 0}</td>
                  <td className="px-5 py-3 text-right text-[#283c50] font-medium">{formatNaira(b.wallet?.balanceKobo ?? 0)}</td>
                  <td className="px-5 py-3 text-right text-[#283c50] font-medium">{b._count?.admins ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setAddOwnerFor(b.id)} className="text-xs text-[#3454d1] hover:underline">
                      Add Owner
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <CreateBusinessModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {addOwnerFor && <AddOwnerModal businessId={addOwnerFor} onClose={() => setAddOwnerFor(null)} />}
    </div>
  )
}
