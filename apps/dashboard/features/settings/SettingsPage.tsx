'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatNaira } from '@/lib/utils'
import {
  Loader2, Save, ToggleLeft, ToggleRight, Bell, Store, User, Lock, CheckCircle2,
} from 'lucide-react'
import {
  useGetVendorSettingsQuery,
  useUpdateVendorSettingsMutation,
  useGetVendorAdminSettingsQuery,
  useUpdateVendorAdminSettingsMutation,
  useUpdateVendorAdminProfileMutation,
  useChangeVendorAdminPasswordMutation,
} from '@/store/services/teamApi'
import {
  useGetSystemAdminSettingsQuery,
  useUpdateSystemAdminSettingsMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from '@/store/services/adminApi'

// ─── Shared primitives ────────────────────────────────────────────────────────

function inputCls(extra = '') {
  return `w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666] ${extra}`
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 space-y-4">
      <h2 className="text-sm font-semibold text-[#283c50]">{title}</h2>
      {children}
    </div>
  )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-2.5 text-xs font-medium group"
    >
      {value
        ? <ToggleRight className="w-7 h-7 text-[#17c666]" />
        : <ToggleLeft className="w-7 h-7 text-[#d1d5db]" />}
      <span className={value ? 'text-[#283c50]' : 'text-[#9ca3af]'}>{label}</span>
    </button>
  )
}

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded text-white disabled:opacity-60 transition-colors"
      style={{ backgroundColor: saved ? '#17c666' : '#283c50' }}
    >
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
      {saved ? 'Saved!' : 'Save Changes'}
    </button>
  )
}

function useSavedFlash() {
  const [saved, setSaved] = useState(false)
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  return { saved, flash }
}

// ─── Opening Hours ────────────────────────────────────────────────────────────

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const DAY_LABELS: Record<typeof DAYS[number], string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}

type OpeningHours = Record<string, { open: string; close: string }>

function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: OpeningHours
  onChange: (v: OpeningHours) => void
}) {
  function toggleDay(day: string) {
    const next = { ...value }
    if (next[day]) {
      delete next[day]
    } else {
      next[day] = { open: '09:00', close: '22:00' }
    }
    onChange(next)
  }

  function setTime(day: string, field: 'open' | 'close', time: string) {
    onChange({ ...value, [day]: { ...(value[day] ?? { open: '09:00', close: '22:00' }), [field]: time } })
  }

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const active = Boolean(value[day])
        return (
          <div key={day} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleDay(day)}
              className="flex items-center gap-1.5 w-20 shrink-0 text-xs font-medium"
            >
              {active
                ? <ToggleRight className="w-5 h-5 text-[#17c666]" />
                : <ToggleLeft className="w-5 h-5 text-[#d1d5db]" />}
              <span className={active ? 'text-[#283c50]' : 'text-[#9ca3af]'}>{DAY_LABELS[day]}</span>
            </button>
            {active ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={value[day]?.open ?? '09:00'}
                  onChange={(e) => setTime(day, 'open', e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
                />
                <span className="text-xs text-[#9ca3af]">to</span>
                <input
                  type="time"
                  value={value[day]?.close ?? '22:00'}
                  onChange={(e) => setTime(day, 'close', e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
                />
              </div>
            ) : (
              <span className="text-xs text-[#d1d5db]">Closed</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = 'store' | 'notifications' | 'profile' | 'security'

function Tabs({ tabs, active, onChange }: { tabs: { id: TabId; label: string; icon: React.ReactNode }[]; active: TabId; onChange: (id: TabId) => void }) {
  return (
    <div className="flex gap-1 border-b border-[#e5e7eb] mb-5">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
            active === t.id
              ? 'border-[#17c666] text-[#17c666]'
              : 'border-transparent text-[#6b7885] hover:text-[#283c50]'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Vendor: Store Settings ───────────────────────────────────────────────────

function VendorStoreSettings({ isOwner }: { isOwner: boolean }) {
  const { data: settings, isLoading } = useGetVendorSettingsQuery()
  const [update, { isLoading: saving }] = useUpdateVendorSettingsMutation()
  const { saved, flash } = useSavedFlash()

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    deliveryFeeKobo: 0,
    estimatedMinutes: 30,
    isOpen: false,
    openingHours: {} as OpeningHours,
  })

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
        openingHours: settings.openingHours ?? {},
      })
    }
  }, [settings])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await update(form).unwrap()
    flash()
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="w-5 h-5 animate-spin text-[#17c666]" />
    </div>
  )

  const disabled = !isOwner

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {disabled && (
        <div className="text-xs text-[#f59e0b] bg-[#fffbeb] border border-[#fde68a] rounded px-4 py-2.5">
          Only the store Owner can update these settings.
        </div>
      )}

      <SectionCard title="Store Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Store Name</label>
            <input disabled={disabled} type="text" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls('disabled:opacity-60')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Phone</label>
            <input disabled={disabled} type="text" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={inputCls('font-mono disabled:opacity-60')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Email</label>
            <input disabled={disabled} type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={inputCls('disabled:opacity-60')} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Description</label>
            <textarea disabled={disabled} value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className={inputCls('resize-none disabled:opacity-60')} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Delivery Settings">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">
              Delivery Fee (Kobo)
              {form.deliveryFeeKobo > 0 && (
                <span className="ml-1 text-[#9ca3af] font-normal">= {formatNaira(form.deliveryFeeKobo)}</span>
              )}
            </label>
            <input disabled={disabled} type="number" min={0} value={form.deliveryFeeKobo}
              onChange={(e) => setForm((f) => ({ ...f, deliveryFeeKobo: Number(e.target.value) }))}
              className={inputCls('disabled:opacity-60')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Estimated Delivery (minutes)</label>
            <input disabled={disabled} type="number" min={1} max={300} value={form.estimatedMinutes}
              onChange={(e) => setForm((f) => ({ ...f, estimatedMinutes: Number(e.target.value) }))}
              className={inputCls('disabled:opacity-60')} />
          </div>
        </div>
        <div>
          <Toggle
            value={form.isOpen}
            onChange={disabled ? () => {} : (v) => setForm((f) => ({ ...f, isOpen: v }))}
            label={`Store is currently ${form.isOpen ? 'Open' : 'Closed'}`}
          />
        </div>
      </SectionCard>

      <SectionCard title="Opening Hours">
        <p className="text-xs text-[#9ca3af]">Toggle each day and set your operating hours.</p>
        <OpeningHoursEditor
          value={form.openingHours}
          onChange={disabled ? () => {} : (v) => setForm((f) => ({ ...f, openingHours: v }))}
        />
      </SectionCard>

      {!disabled && (
        <div className="flex justify-end">
          <SaveButton saving={saving} saved={saved} />
        </div>
      )}
    </form>
  )
}

// ─── Vendor: Notification Settings ───────────────────────────────────────────

function VendorNotificationSettings() {
  const { data: settings, isLoading } = useGetVendorAdminSettingsQuery()
  const [update, { isLoading: saving }] = useUpdateVendorAdminSettingsMutation()
  const { saved, flash } = useSavedFlash()

  const [form, setForm] = useState({ emailNotifications: true, orderAlerts: true })

  useEffect(() => {
    if (settings) setForm({ emailNotifications: settings.emailNotifications, orderAlerts: settings.orderAlerts })
  }, [settings])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await update(form).unwrap()
    flash()
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="w-5 h-5 animate-spin text-[#17c666]" />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard title="Email Notifications">
        <div className="space-y-4">
          <div>
            <Toggle
              value={form.emailNotifications}
              onChange={(v) => setForm((f) => ({ ...f, emailNotifications: v }))}
              label="Email Notifications"
            />
            <p className="text-xs text-[#9ca3af] mt-1 ml-9">Receive general platform emails and updates.</p>
          </div>
          <div>
            <Toggle
              value={form.orderAlerts}
              onChange={(v) => setForm((f) => ({ ...f, orderAlerts: v }))}
              label="New Order Alerts"
            />
            <p className="text-xs text-[#9ca3af] mt-1 ml-9">Get an email whenever a new order comes in.</p>
          </div>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton saving={saving} saved={saved} />
      </div>
    </form>
  )
}

// ─── Vendor: Profile ─────────────────────────────────────────────────────────

function VendorProfileSettings() {
  const { data: session } = useSession()
  const [updateProfile, { isLoading: saving }] = useUpdateVendorAdminProfileMutation()
  const { saved, flash } = useSavedFlash()
  const [error, setError] = useState('')

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })

  useEffect(() => {
    if (session?.admin) {
      setForm({
        firstName: session.admin.firstName ?? '',
        lastName: session.admin.lastName ?? '',
        email: session.admin.email ?? '',
      })
    }
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await updateProfile(form).unwrap()
      flash()
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to update profile')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard title="Personal Information">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">First Name</label>
            <input type="text" value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Last Name</label>
            <input type="text" value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className={inputCls()} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Email</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={inputCls()} />
          </div>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton saving={saving} saved={saved} />
      </div>
    </form>
  )
}

// ─── Vendor: Password ────────────────────────────────────────────────────────

function VendorPasswordSettings() {
  const [changePassword, { isLoading: saving }] = useChangeVendorAdminPasswordMutation()
  const { saved, flash } = useSavedFlash()
  const [error, setError] = useState('')
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return }
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters'); return }
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }).unwrap()
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      flash()
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to change password')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard title="Change Password">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        <div className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Current Password</label>
            <input type="password" value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
              className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">New Password</label>
            <input type="password" value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Confirm New Password</label>
            <input type="password" value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              className={inputCls()} />
          </div>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton saving={saving} saved={saved} />
      </div>
    </form>
  )
}

// ─── System Admin: Profile ────────────────────────────────────────────────────

function SystemProfileSettings() {
  const { data: session } = useSession()
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()
  const { saved, flash } = useSavedFlash()
  const [error, setError] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })

  useEffect(() => {
    if (session?.admin) {
      setForm({
        firstName: session.admin.firstName ?? '',
        lastName: session.admin.lastName ?? '',
        email: session.admin.email ?? '',
      })
    }
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await updateProfile(form).unwrap()
      flash()
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to update profile')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard title="Personal Information">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">First Name</label>
            <input type="text" value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Last Name</label>
            <input type="text" value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className={inputCls()} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Email</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={inputCls()} />
          </div>
        </div>
        <div className="pt-1">
          <div className="text-xs text-[#9ca3af]">
            Role: <span className="font-medium text-[#283c50]">{session?.admin?.role}</span>
          </div>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton saving={saving} saved={saved} />
      </div>
    </form>
  )
}

// ─── System Admin: Password ───────────────────────────────────────────────────

function SystemPasswordSettings() {
  const [changePassword, { isLoading: saving }] = useChangePasswordMutation()
  const { saved, flash } = useSavedFlash()
  const [error, setError] = useState('')
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return }
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters'); return }
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }).unwrap()
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      flash()
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to change password')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard title="Change Password">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        <div className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Current Password</label>
            <input type="password" value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
              className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">New Password</label>
            <input type="password" value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Confirm New Password</label>
            <input type="password" value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              className={inputCls()} />
          </div>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton saving={saving} saved={saved} />
      </div>
    </form>
  )
}

// ─── System Admin: Notification Settings ─────────────────────────────────────

function SystemNotificationSettings() {
  const { data: settings, isLoading } = useGetSystemAdminSettingsQuery()
  const [update, { isLoading: saving }] = useUpdateSystemAdminSettingsMutation()
  const { saved, flash } = useSavedFlash()
  const [form, setForm] = useState({ emailNotifications: true, weeklyReport: true })

  useEffect(() => {
    if (settings) setForm({ emailNotifications: settings.emailNotifications, weeklyReport: settings.weeklyReport })
  }, [settings])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await update(form).unwrap()
    flash()
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="w-5 h-5 animate-spin text-[#17c666]" />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard title="Email Notifications">
        <div className="space-y-4">
          <div>
            <Toggle
              value={form.emailNotifications}
              onChange={(v) => setForm((f) => ({ ...f, emailNotifications: v }))}
              label="Email Notifications"
            />
            <p className="text-xs text-[#9ca3af] mt-1 ml-9">Receive platform alerts and operational emails.</p>
          </div>
          <div>
            <Toggle
              value={form.weeklyReport}
              onChange={(v) => setForm((f) => ({ ...f, weeklyReport: v }))}
              label="Weekly Platform Report"
            />
            <p className="text-xs text-[#9ca3af] mt-1 ml-9">Get a weekly summary of orders, GMV, and key metrics.</p>
          </div>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton saving={saving} saved={saved} />
      </div>
    </form>
  )
}

// ─── Vendor Settings Page ─────────────────────────────────────────────────────

const VENDOR_TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'store', label: 'Store', icon: <Store className="w-3.5 h-3.5" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-3.5 h-3.5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
  { id: 'security', label: 'Security', icon: <Lock className="w-3.5 h-3.5" /> },
]

function VendorSettingsPage({ role }: { role: string }) {
  const [tab, setTab] = useState<TabId>('store')
  const isOwner = role === 'OWNER'

  return (
    <>
      <Tabs tabs={VENDOR_TABS} active={tab} onChange={setTab} />
      {tab === 'store' && <VendorStoreSettings isOwner={isOwner} />}
      {tab === 'notifications' && <VendorNotificationSettings />}
      {tab === 'profile' && <VendorProfileSettings />}
      {tab === 'security' && <VendorPasswordSettings />}
    </>
  )
}

// ─── System Admin Settings Page ───────────────────────────────────────────────

const SYSTEM_TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-3.5 h-3.5" /> },
  { id: 'security', label: 'Security', icon: <Lock className="w-3.5 h-3.5" /> },
]

function SystemSettingsPage() {
  const [tab, setTab] = useState<TabId>('profile')

  return (
    <>
      <Tabs tabs={SYSTEM_TABS} active={tab} onChange={setTab} />
      {tab === 'profile' && <SystemProfileSettings />}
      {tab === 'notifications' && <SystemNotificationSettings />}
      {tab === 'security' && <SystemPasswordSettings />}
    </>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session } = useSession()
  const isVendor = session?.admin?.type === 'VENDOR'
  const role = session?.admin?.role ?? ''

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#283c50]">Settings</h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          {isVendor ? 'Manage your store and account' : 'Platform and account configuration'}
        </p>
      </div>
      {isVendor ? <VendorSettingsPage role={role} /> : <SystemSettingsPage />}
    </div>
  )
}
