'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, X, Loader2, Building2, ChevronRight, ChevronLeft, Upload, CheckCircle, File as FileIcon } from 'lucide-react'
import {
  useGetBusinessesQuery,
  useCreateBusinessMutation,
} from '@/store/services/businessApi'
import { formatNaira } from '@/lib/utils'
import type { BusinessDocumentField, CreateBusinessRequest } from '@/types/api'

// ─── Nigerian banks ───────────────────────────────────────────

const NIGERIAN_BANKS = [
  'Access Bank',
  'Carbon (One Finance)',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Globus Bank',
  'Guaranty Trust Bank (GTBank)',
  'Heritage Bank',
  'Jaiz Bank',
  'Keystone Bank',
  'Kuda Bank',
  'Lotus Bank',
  'Moniepoint Microfinance Bank',
  'Opay (OPay Digital Services)',
  'Optimus Bank',
  'Palmpay',
  'Parallex Bank',
  'Polaris Bank',
  'Providus Bank',
  'Rubies Microfinance Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'SunTrust Bank',
  'TAJ Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Unity Bank',
  'VFD Microfinance Bank',
  'Wema Bank',
  'Zenith Bank',
]

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
    <div className="flex items-center justify-between py-2.5 border-b border-[#EDF0F6] last:border-0">
      <div className="flex items-center gap-2.5">
        {file
          ? <CheckCircle className="w-4 h-4 text-[#1DB980] shrink-0" />
          : <FileIcon className="w-4 h-4 text-[#DDE2EC] shrink-0" />}
        <div>
          <p className="text-xs font-medium text-[#0D1426]">{label}</p>
          {file
            ? <p className="text-[11px] text-[#525A72] truncate max-w-[220px]">{file.name}</p>
            : <p className="text-[11px] text-[#9AA1B4]">No file chosen</p>}
        </div>
      </div>
      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7EAF1] text-xs text-[#525A72] hover:bg-[#F7F9FC] cursor-pointer shrink-0">
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
      <label className="block text-xs font-medium text-[#0D1426] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#9AA1B4] mt-1">{hint}</p>}
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
      className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
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
        <div className="px-6 py-4 border-b border-[#E7EAF1] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#0D1426]">Create Business</h2>
            <div className="flex items-center gap-1 mt-1.5">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer ${i === step ? 'text-white' : i < step ? 'text-[#1DB980] bg-[#DFF5EC]' : 'text-[#9AA1B4] bg-[#EDF0F6]'}`}
                    style={i === step ? { backgroundColor: '#1E5FFF' } : {}}
                    onClick={() => i < step && setStep(i)}
                  >
                    {i + 1}. {s}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[#DDE2EC]" />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-[#9AA1B4] hover:text-[#0D1426]"><X className="w-4 h-4" /></button>
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
                    className="flex-1 border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
                  />
                  <button type="button" onClick={addServiceArea} className="px-3 py-2 text-sm text-[#1E5FFF] border border-[#1E5FFF] rounded-lg hover:bg-[#E7EEFF]">Add</button>
                </div>
                {(form.serviceAreas ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.serviceAreas!.map((a) => (
                      <span key={a} className="flex items-center gap-1 text-xs bg-[#E7EEFF] text-[#1E5FFF] px-2 py-0.5 rounded-full">
                        {a}
                        <button type="button" onClick={() => removeServiceArea(a)} className="hover:text-[#FF3B30]"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-xs text-[#525A72] -mt-1">Owner details are used for KYC and compliance purposes.</p>
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
              <div className="border-t border-[#E7EAF1] pt-4 mt-2">
                <p className="text-xs font-semibold text-[#0D1426] mb-3">Dashboard Login Credentials</p>
                <p className="text-xs text-[#525A72] mb-3">Leave blank to skip creating a login now and add one later.</p>
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
                  <select
                    value={form.bankName ?? ''}
                    onChange={(e) => set('bankName', e.target.value)}
                    className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF] bg-white text-[#0D1426]"
                  >
                    <option value="">Select bank…</option>
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Account Name">
                  <Input value={form.accountName} onChange={(v) => set('accountName', v)} placeholder="Speedy Riders Ltd" />
                </Field>
                <Field label="Account Number">
                  <Input value={form.accountNumber} onChange={(v) => set('accountNumber', v)} placeholder="0123456789" />
                </Field>
              </div>
              <div className="border-t border-[#E7EAF1] pt-4">
                <p className="text-xs font-semibold text-[#0D1426] mb-1">Compliance Documents</p>
                <p className="text-xs text-[#525A72] mb-3">Optional — the business owner can also upload from their dashboard.</p>
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
            <p className="text-xs text-[#FF3B30]">
              {(error as any)?.data?.error ?? 'Something went wrong. Please try again.'}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7EAF1] flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#525A72] hover:bg-[#EDF0F6] rounded-lg">Cancel</button>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm text-[#0D1426] border border-[#E7EAF1] rounded-lg flex items-center gap-1.5 hover:bg-[#F7F9FC]">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => { if (step === 0 && !form.name) return; setStep(step + 1) }}
                className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5"
                style={{ backgroundColor: '#1E5FFF' }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !form.name}
                className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                style={{ backgroundColor: '#1E5FFF' }}
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

// ─── Main page ────────────────────────────────────────────────

export default function BusinessesPage() {
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useGetBusinessesQuery({})
  const businesses = data?.data ?? []

  function handleCreated(id: string) {
    setShowCreate(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#0D1426]">Businesses</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg"
          style={{ backgroundColor: '#1E5FFF' }}
        >
          <Plus className="w-4 h-4" /> Create Business
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-10 h-10 text-[#DDE2EC] mx-auto mb-3" />
            <p className="text-sm text-[#525A72]">No businesses yet.</p>
            <button onClick={() => setShowCreate(true)} className="mt-2 text-sm text-[#1E5FFF] hover:underline">
              Create the first one
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] border-b border-[#EDF0F6]">
                <th className="px-5 py-3 text-left">Business</th>
                <th className="px-5 py-3 text-left">Owner</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Riders</th>
                <th className="px-5 py-3 text-right">Wallet</th>
                <th className="px-5 py-3 text-right">Admins</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F6]">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-[#F7F9FC]">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#0D1426]">{b.name}</p>
                    <p className="text-xs text-[#9AA1B4] mt-0.5">{b.cacRegistrationNumber ?? b.email ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3 text-[#525A72]">
                    <p>{b.ownerFullName ?? '—'}</p>
                    <p className="text-xs">{b.ownerPhoneNumber ?? ''}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      b.status === 'ACTIVE' ? 'bg-[#DFF5EC] text-[#1DB980]' :
                      b.status === 'SUSPENDED' ? 'bg-[#FBEDD7] text-[#E8930C]' :
                      'bg-[#FFE3E1] text-[#FF3B30]'
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-[#0D1426] font-medium">{b._count?.riders ?? 0}</td>
                  <td className="px-5 py-3 text-right text-[#0D1426] font-medium">{formatNaira(b.wallet?.balanceKobo ?? 0)}</td>
                  <td className="px-5 py-3 text-right text-[#0D1426] font-medium">{b._count?.admins ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/businesses/${b.id}`} className="text-xs text-[#1E5FFF] hover:underline">
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <CreateBusinessModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  )
}
