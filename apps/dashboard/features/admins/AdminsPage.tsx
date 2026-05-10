'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useUpdateAdminEmailPrefsMutation,
} from '@/store/services/adminApi'
import type { AdminUser, SystemAdminRole, CreateAdminRequest, UpdateAdminRequest } from '@/types/api'
import {
  Plus,
  MoreHorizontal,
  Loader2,
  Users,
  Shield,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Power,
  Edit3,
  Bell,
  Store,
  Bike,
} from 'lucide-react'

const roleConfig: Record<SystemAdminRole, { label: string; bg: string; text: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', bg: '#fdf0f0', text: '#ea4d4d' },
  ADMIN:       { label: 'Admin',       bg: '#eef1fb', text: '#3454d1' },
}

function inputCls() {
  return 'w-full text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1.5 text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#3454d1]'
}

// ─── Create dialog ────────────────────────────────────────────────────────────

function CreateAdminDialog({ onClose }: { onClose: () => void }) {
  const [createAdmin, { isLoading }] = useCreateAdminMutation()
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '', role: 'ADMIN' as SystemAdminRole })
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(field: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await createAdmin(form).unwrap()
      onClose()
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to create admin.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <h2 className="text-sm font-bold text-[#283c50]">Add System Admin</h2>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#f3f4f6]">
            <X className="w-4 h-4 text-[#6b7885]" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#6b7885] mb-1">First Name *</label>
              <input required type="text" value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                className={inputCls()} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6b7885] mb-1">Last Name *</label>
              <input required type="text" value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                className={inputCls()} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6b7885] mb-1">Email *</label>
            <input required type="email" value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={inputCls()} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6b7885] mb-1">Password * (min. 8 chars)</label>
            <input required type="password" minLength={8} value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className={inputCls()} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6b7885] mb-1">Role</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value as SystemAdminRole)}
              className={inputCls()}>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {error && <p className="text-[11px] text-[#ea4d4d]">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="text-xs px-4 py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Add Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

function EditAdminDialog({ admin, onClose }: { admin: AdminUser; onClose: () => void }) {
  const [updateAdmin, { isLoading }] = useUpdateAdminMutation()
  const [form, setForm] = useState<UpdateAdminRequest>({
    firstName: admin.firstName,
    lastName: admin.lastName,
    role: admin.role as SystemAdminRole,
    isActive: admin.isActive,
  })
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await updateAdmin({ id: admin.id, body: form }).unwrap()
      onClose()
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to update admin.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <h2 className="text-sm font-bold text-[#283c50]">Edit Admin</h2>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#f3f4f6]">
            <X className="w-4 h-4 text-[#6b7885]" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#6b7885] mb-1">First Name</label>
              <input type="text" value={form.firstName ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className={inputCls()} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6b7885] mb-1">Last Name</label>
              <input type="text" value={form.lastName ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className={inputCls()} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6b7885] mb-1">Role</label>
            <select value={form.role ?? 'ADMIN'}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as SystemAdminRole }))}
              className={inputCls()}>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6b7885] mb-2">Account Status</label>
            <div className="flex items-center gap-3">
              {(['active', 'inactive'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: opt === 'active' }))}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-colors"
                  style={
                    (opt === 'active') === form.isActive
                      ? opt === 'active'
                        ? { backgroundColor: '#e8faf2', borderColor: '#17c666', color: '#17c666' }
                        : { backgroundColor: '#fdf0f0', borderColor: '#ea4d4d', color: '#ea4d4d' }
                      : { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#9ca3af' }
                  }
                >
                  {opt === 'active' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-[11px] text-[#ea4d4d]">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="text-xs px-4 py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Edit3 className="w-3 h-3" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Notification prefs dialog ────────────────────────────────────────────────

function EmailPrefsDialog({ admin, onClose }: { admin: AdminUser; onClose: () => void }) {
  const [updatePrefs, { isLoading }] = useUpdateAdminEmailPrefsMutation()
  const [prefs, setPrefs] = useState({
    receiveVendorEmails: admin.receiveVendorEmails ?? false,
    receiveRiderEmails: admin.receiveRiderEmails ?? false,
  })
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await updatePrefs({ id: admin.id, body: prefs }).unwrap()
      onClose()
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to update preferences.')
    }
  }

  function ToggleRow({
    icon,
    label,
    description,
    value,
    onChange,
  }: {
    icon: React.ReactNode
    label: string
    description: string
    value: boolean
    onChange: (v: boolean) => void
  }) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-[#f3f4f6] last:border-0">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: value ? '#fff7ed' : '#f3f4f6', color: value ? '#f97316' : '#9ca3af' }}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#283c50]">{label}</p>
            <p className="text-[11px] text-[#9ca3af] mt-0.5">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className="relative w-10 h-5 rounded-full transition-colors shrink-0 ml-4"
          style={{ backgroundColor: value ? '#f97316' : '#d1d5db' }}
        >
          <span
            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
            style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#f97316]" />
            <h2 className="text-sm font-bold text-[#283c50]">Email Notifications</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#f3f4f6]">
            <X className="w-4 h-4 text-[#6b7885]" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5">
          <p className="text-xs text-[#6b7885] mb-4">
            Choose which email alerts <strong className="text-[#283c50]">{admin.firstName} {admin.lastName}</strong> receives.
          </p>
          <div>
            <ToggleRow
              icon={<Store className="w-4 h-4" />}
              label="New Vendor Applications"
              description="Notified when a vendor submits a new application for review"
              value={prefs.receiveVendorEmails}
              onChange={(v) => setPrefs((p) => ({ ...p, receiveVendorEmails: v }))}
            />
            <ToggleRow
              icon={<Bike className="w-4 h-4" />}
              label="New Rider Registrations"
              description="Notified when a new rider registers and needs KYC approval"
              value={prefs.receiveRiderEmails}
              onChange={(v) => setPrefs((p) => ({ ...p, receiveRiderEmails: v }))}
            />
          </div>

          {error && <p className="text-[11px] text-[#ea4d4d] mt-3">{error}</p>}

          <div className="flex justify-end gap-2 mt-5">
            <button type="button" onClick={onClose}
              className="text-xs px-4 py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Action menu ──────────────────────────────────────────────────────────────

function AdminActionMenu({
  admin,
  isSelf,
  onClose,
  onEdit,
  onEmailPrefs,
}: {
  admin: AdminUser
  isSelf: boolean
  onClose: () => void
  onEdit: () => void
  onEmailPrefs: () => void
}) {
  const [updateAdmin, { isLoading }] = useUpdateAdminMutation()

  async function toggleActive() {
    await updateAdmin({ id: admin.id, body: { isActive: !admin.isActive } }).unwrap()
    onClose()
  }

  return (
    <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-lg border border-[#e5e7eb] shadow-card-md py-1">
      <button
        onClick={() => { onEdit(); onClose() }}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#283c50] hover:bg-[#f9fafb]"
      >
        <Edit3 className="w-3.5 h-3.5 text-[#3454d1]" /> Edit Admin
      </button>
      <button
        onClick={() => { onEmailPrefs(); onClose() }}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#283c50] hover:bg-[#f9fafb]"
      >
        <Bell className="w-3.5 h-3.5 text-[#f97316]" /> Email Notifications
      </button>
      {!isSelf && (
        <div className="border-t border-[#f3f4f6] mt-1">
          <button
            onClick={toggleActive}
            disabled={isLoading}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-[#f9fafb] disabled:opacity-50"
            style={{ color: admin.isActive ? '#ea4d4d' : '#17c666' }}
          >
            <Power className="w-3.5 h-3.5" />
            {admin.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Notification badges ──────────────────────────────────────────────────────

function NotifBadges({ admin }: { admin: AdminUser }) {
  if (!admin.receiveVendorEmails && !admin.receiveRiderEmails) {
    return <span className="text-[10px] text-[#d1d5db]">—</span>
  }
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {admin.receiveVendorEmails && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium rounded-full px-1.5 py-0.5"
          style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
          <Store className="w-2.5 h-2.5" /> Vendor
        </span>
      )}
      {admin.receiveRiderEmails && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium rounded-full px-1.5 py-0.5"
          style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
          <Bike className="w-2.5 h-2.5" /> Rider
        </span>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminsPage() {
  const { data: session } = useSession()
  const [page, setPage] = useState(1)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null)
  const [emailPrefsAdmin, setEmailPrefsAdmin] = useState<AdminUser | null>(null)

  const isSuperAdmin = session?.admin?.role === 'SUPER_ADMIN'

  const { data, isLoading, isError } = useGetAdminsQuery({ page, limit: 20 })
  const admins = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 20))

  const superAdminCount = admins.filter((a) => a.role === 'SUPER_ADMIN').length
  const activeCount = admins.filter((a) => a.isActive).length
  const notifCount = admins.filter((a) => a.receiveVendorEmails || a.receiveRiderEmails).length

  return (
    <div className="space-y-5" onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50]">System Admins</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Manage admin accounts, access levels, and email notifications</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Admin
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="text-xs text-[#f59e0b] bg-[#fffbeb] border border-[#fde68a] rounded px-4 py-2.5">
          <strong>Super Admin</strong> role required to create or modify admin accounts.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Admins', value: total, icon: <Users className="w-4 h-4" />, color: '#3454d1', bg: '#eef1fb' },
          { label: 'Active', value: activeCount, icon: <UserCheck className="w-4 h-4" />, color: '#17c666', bg: '#e8faf2' },
          { label: 'Super Admins', value: superAdminCount, icon: <Shield className="w-4 h-4" />, color: '#ea4d4d', bg: '#fdf0f0' },
          { label: 'Get Notified', value: notifCount, icon: <Bell className="w-4 h-4" />, color: '#f97316', bg: '#fff7ed' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-[11px] text-[#9ca3af] font-medium">{s.label}</p>
              <p className="text-lg font-bold text-[#283c50] leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading admins…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">Failed to load admins.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Admin', 'Email', 'Role', 'Status', 'Notifications', 'Joined', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9fafb]">
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-xs text-[#9ca3af]">No admins found.</td>
                    </tr>
                  ) : (
                    admins.map((admin) => {
                      const rc = roleConfig[admin.role as SystemAdminRole] ?? roleConfig.ADMIN
                      const isSelf = session?.admin?.email === admin.email
                      return (
                        <tr key={admin.id} className="hover:bg-[#fafafa] transition-colors" onClick={(e) => e.stopPropagation()}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}>
                                {admin.firstName[0]}{admin.lastName[0]}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#283c50]">{admin.firstName} {admin.lastName}</p>
                                {isSelf && <span className="text-[10px] font-medium text-[#3454d1]">You</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#4b5563]">{admin.email}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-medium rounded-full px-2 py-0.5"
                              style={{ backgroundColor: rc.bg, color: rc.text }}>
                              {rc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-medium rounded-full px-2 py-0.5"
                              style={admin.isActive
                                ? { backgroundColor: '#e8faf2', color: '#17c666' }
                                : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                              {admin.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <NotifBadges admin={admin} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-[#9ca3af]">
                              {new Date(admin.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isSuperAdmin && (
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setOpenMenu(openMenu === admin.id ? null : admin.id)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5 text-[#9ca3af]" />
                                </button>
                                {openMenu === admin.id && (
                                  <AdminActionMenu
                                    admin={admin}
                                    isSelf={isSelf}
                                    onClose={() => setOpenMenu(null)}
                                    onEdit={() => setEditAdmin(admin)}
                                    onEmailPrefs={() => setEmailPrefsAdmin(admin)}
                                  />
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-[#f3f4f6] flex items-center justify-between">
              <p className="text-xs text-[#9ca3af]">
                {total === 0 ? 'No admins' : `Page ${page} of ${totalPages} · ${total} total`}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="w-7 h-7 rounded flex items-center justify-center border border-[#e5e7eb] disabled:opacity-40 hover:bg-[#f9fafb]">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#6b7885]" />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="w-7 h-7 rounded flex items-center justify-center border border-[#e5e7eb] disabled:opacity-40 hover:bg-[#f9fafb]">
                  <ChevronRight className="w-3.5 h-3.5 text-[#6b7885]" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreate && <CreateAdminDialog onClose={() => setShowCreate(false)} />}
      {editAdmin && <EditAdminDialog admin={editAdmin} onClose={() => setEditAdmin(null)} />}
      {emailPrefsAdmin && <EmailPrefsDialog admin={emailPrefsAdmin} onClose={() => setEmailPrefsAdmin(null)} />}
    </div>
  )
}
