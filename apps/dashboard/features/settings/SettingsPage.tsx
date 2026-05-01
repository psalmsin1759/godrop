'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useGetVendorSettingsQuery, useUpdateVendorSettingsMutation } from '@/store/services/teamApi'
import { formatNaira } from '@/lib/utils'
import { Loader2, Save, ToggleLeft, ToggleRight } from 'lucide-react'

function VendorSettingsForm() {
  const { data: settings, isLoading } = useGetVendorSettingsQuery()
  const [update, { isLoading: saving }] = useUpdateVendorSettingsMutation()

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    deliveryFeeKobo: 0,
    estimatedMinutes: 30,
    isOpen: false,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setForm({
        name: settings.name ?? '',
        description: settings.description ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        deliveryFeeKobo: settings.deliveryFeeKobo ?? 0,
        estimatedMinutes: settings.estimatedMinutes ?? 30,
        isOpen: settings.isOpen ?? false,
      })
    }
  }, [settings])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await update(form).unwrap()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="w-5 h-5 animate-spin text-[#17c666]" />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-[#283c50]">Store Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Store Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666] font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666] resize-none"
            />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-[#283c50]">Delivery Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">
              Delivery Fee (Kobo)
              <span className="ml-1 text-[#9ca3af] font-normal">{form.deliveryFeeKobo > 0 ? `= ${formatNaira(form.deliveryFeeKobo)}` : ''}</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.deliveryFeeKobo}
              onChange={(e) => setForm((f) => ({ ...f, deliveryFeeKobo: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Estimated Delivery (minutes)</label>
            <input
              type="number"
              min={1}
              max={300}
              value={form.estimatedMinutes}
              onChange={(e) => setForm((f) => ({ ...f, estimatedMinutes: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, isOpen: !f.isOpen }))}
            className="flex items-center gap-2 text-xs font-medium"
            style={{ color: form.isOpen ? '#17c666' : '#9ca3af' }}
          >
            {form.isOpen
              ? <ToggleRight className="w-6 h-6" />
              : <ToggleLeft className="w-6 h-6" />}
            Store is currently {form.isOpen ? 'Open' : 'Closed'}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded text-white disabled:opacity-60"
          style={{ backgroundColor: saved ? '#17c666' : '#283c50' }}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

function SystemSettingsView() {
  return (
    <div className="card p-8 text-center text-[#9ca3af] text-sm">
      System-level configuration settings (delivery fee rules, surge pricing, coverage zones)
      will be available here soon.
    </div>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const isVendor = session?.admin?.type === 'VENDOR'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#283c50]">Settings</h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          {isVendor ? 'Manage your store configuration' : 'Platform configuration'}
        </p>
      </div>
      {isVendor ? <VendorSettingsForm /> : <SystemSettingsView />}
    </div>
  )
}
