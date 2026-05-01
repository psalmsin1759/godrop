'use client'

import { useState } from 'react'
import {
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useUpdateTeamMemberRoleMutation,
  useRemoveTeamMemberMutation,
} from '@/store/services/teamApi'
import type { TeamMember, TeamMemberRole } from '@/types/api'
import { formatDate } from '@/lib/utils'
import { Plus, Loader2, UserX, UserCog, UserCheck } from 'lucide-react'

const ROLE_CONFIG: Record<TeamMemberRole, { label: string; bg: string; text: string }> = {
  OWNER: { label: 'Owner', bg: '#eef1fb', text: '#3454d1' },
  MANAGER: { label: 'Manager', bg: '#e0f9f7', text: '#3dc7be' },
  STAFF: { label: 'Staff', bg: '#f3f4f6', text: '#6b7885' },
}

function InviteDialog({ onClose }: { onClose: () => void }) {
  const [invite, { isLoading }] = useInviteTeamMemberMutation()
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'STAFF' as 'MANAGER' | 'STAFF',
  })
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await invite(form).unwrap()
      onClose()
    } catch {
      setError('Failed to send invitation. Check that the email is not already registered.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#283c50]">Invite Team Member</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#4b5563] mb-1">First Name</label>
              <input
                required
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4b5563] mb-1">Last Name</label>
              <input
                required
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4b5563] mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'MANAGER' | 'STAFF' }))}
              className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
            >
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          {error && <p className="text-xs text-[#ea4d4d]">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 text-xs py-2 rounded text-white font-medium disabled:opacity-60"
              style={{ backgroundColor: '#283c50' }}
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MemberActions({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const [updateRole, { isLoading: updating }] = useUpdateTeamMemberRoleMutation()
  const [remove, { isLoading: removing }] = useRemoveTeamMemberMutation()
  const [confirmRemove, setConfirmRemove] = useState(false)

  if (member.role === 'OWNER') return null

  if (confirmRemove) return (
    <div className="absolute right-0 top-8 z-50 w-56 bg-white rounded-lg border border-[#e5e7eb] shadow-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-[#283c50]">Remove {member.firstName}?</p>
      <p className="text-[11px] text-[#6b7885]">This will deactivate their account.</p>
      <div className="flex gap-2">
        <button onClick={() => setConfirmRemove(false)} className="flex-1 text-xs py-1.5 rounded border border-[#e5e7eb] text-[#6b7885]">Cancel</button>
        <button
          disabled={removing}
          onClick={async () => { await remove(member.id).unwrap(); onClose() }}
          className="flex-1 text-xs py-1.5 rounded text-white font-medium disabled:opacity-50"
          style={{ backgroundColor: '#ea4d4d' }}
        >
          {removing ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Remove'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-lg border border-[#e5e7eb] shadow-lg py-1">
      {member.role === 'STAFF' && (
        <button
          disabled={updating}
          onClick={async () => { await updateRole({ memberId: member.id, role: 'MANAGER' }).unwrap(); onClose() }}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#3dc7be] hover:bg-[#f9fafb]"
        >
          <UserCog className="w-3.5 h-3.5" /> Make Manager
        </button>
      )}
      {member.role === 'MANAGER' && (
        <button
          disabled={updating}
          onClick={async () => { await updateRole({ memberId: member.id, role: 'STAFF' }).unwrap(); onClose() }}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#6b7885] hover:bg-[#f9fafb]"
        >
          <UserCheck className="w-3.5 h-3.5" /> Downgrade to Staff
        </button>
      )}
      <button
        onClick={() => setConfirmRemove(true)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#ea4d4d] hover:bg-[#f9fafb] border-t border-[#f3f4f6] mt-1"
      >
        <UserX className="w-3.5 h-3.5" /> Remove Member
      </button>
      <button
        onClick={onClose}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#9ca3af] hover:bg-[#f9fafb]"
      >
        Close
      </button>
    </div>
  )
}

export default function TeamPage() {
  const { data: members = [], isLoading, isError } = useGetTeamMembersQuery()
  const [showInvite, setShowInvite] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  return (
    <div className="space-y-5" onClick={() => setOpenMenu(null)}>
      {showInvite && <InviteDialog onClose={() => setShowInvite(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50]">Team</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Manage your store staff and permissions</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 text-xs text-white font-semibold px-3 py-1.5 rounded"
          style={{ backgroundColor: '#283c50' }}
        >
          <Plus className="w-3.5 h-3.5" /> Invite Member
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: members.length, color: '#3454d1', bg: '#eef1fb' },
          { label: 'Managers', value: members.filter((m) => m.role === 'MANAGER').length, color: '#3dc7be', bg: '#e0f9f7' },
          { label: 'Staff', value: members.filter((m) => m.role === 'STAFF').length, color: '#17c666', bg: '#e8faf2' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-lg font-bold text-[#283c50] leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-[#6b7885] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading team…
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-xs text-[#ea4d4d]">Failed to load team.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                  {['Member', 'Email', 'Role', 'Status', 'Joined', ''].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-xs text-[#9ca3af]">No team members yet.</td>
                  </tr>
                ) : (
                  members.map((m) => {
                    const role = ROLE_CONFIG[m.role]
                    return (
                      <tr key={m.id} className="hover:bg-[#fafafa] transition-colors" onClick={(e) => e.stopPropagation()}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}
                            >
                              {m.firstName[0]}
                            </div>
                            <span className="text-xs font-semibold text-[#283c50]">
                              {m.firstName} {m.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#4b5563]">{m.email}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[11px] font-medium rounded-full px-2 py-0.5"
                            style={{ backgroundColor: role.bg, color: role.text }}
                          >
                            {role.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[11px] font-medium rounded-full px-2 py-0.5"
                            style={m.isActive
                              ? { backgroundColor: '#e8faf2', color: '#17c666' }
                              : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}
                          >
                            {m.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-[#9ca3af]">{formatDate(m.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {m.role !== 'OWNER' && (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#f3f4f6]"
                              >
                                <UserCog className="w-3.5 h-3.5 text-[#9ca3af]" />
                              </button>
                              {openMenu === m.id && (
                                <MemberActions member={m} onClose={() => setOpenMenu(null)} />
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
        )}
      </div>
    </div>
  )
}
