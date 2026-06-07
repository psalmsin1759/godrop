'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  OWNER: { label: 'Owner', bg: '#E7EEFF', text: '#1E5FFF' },
  MANAGER: { label: 'Manager', bg: '#FFEAE1', text: '#FF6A2C' },
  STAFF: { label: 'Staff', bg: '#EDF0F6', text: '#525A72' },
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
        <h2 className="text-sm font-bold text-[#0D1426]">Invite Team Member</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#525A72] mb-1">First Name</label>
              <input
                required
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded border border-[#E7EAF1] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525A72] mb-1">Last Name</label>
              <input
                required
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded border border-[#E7EAF1] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#525A72] mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded border border-[#E7EAF1] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#525A72] mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'MANAGER' | 'STAFF' }))}
              className="w-full px-3 py-2 text-xs rounded border border-[#E7EAF1] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
            >
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          {error && <p className="text-xs text-[#FF3B30]">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 text-xs py-2 rounded text-white font-medium disabled:opacity-60"
              style={{ backgroundColor: '#0D1426' }}
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
    <div className="absolute right-0 top-8 z-50 w-56 bg-white rounded-lg border border-[#E7EAF1] shadow-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-[#0D1426]">Remove {member.firstName}?</p>
      <p className="text-[11px] text-[#525A72]">This will deactivate their account.</p>
      <div className="flex gap-2">
        <button onClick={() => setConfirmRemove(false)} className="flex-1 text-xs py-1.5 rounded border border-[#E7EAF1] text-[#525A72]">Cancel</button>
        <button
          disabled={removing}
          onClick={async () => { await remove(member.id).unwrap(); onClose() }}
          className="flex-1 text-xs py-1.5 rounded text-white font-medium disabled:opacity-50"
          style={{ backgroundColor: '#FF3B30' }}
        >
          {removing ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Remove'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-lg border border-[#E7EAF1] shadow-lg py-1">
      {member.role === 'STAFF' && (
        <button
          disabled={updating}
          onClick={async () => { await updateRole({ memberId: member.id, role: 'MANAGER' }).unwrap(); onClose() }}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#FF6A2C] hover:bg-[#F7F9FC]"
        >
          <UserCog className="w-3.5 h-3.5" /> Make Manager
        </button>
      )}
      {member.role === 'MANAGER' && (
        <button
          disabled={updating}
          onClick={async () => { await updateRole({ memberId: member.id, role: 'STAFF' }).unwrap(); onClose() }}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#525A72] hover:bg-[#F7F9FC]"
        >
          <UserCheck className="w-3.5 h-3.5" /> Downgrade to Staff
        </button>
      )}
      <button
        onClick={() => setConfirmRemove(true)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#FF3B30] hover:bg-[#F7F9FC] border-t border-[#EDF0F6] mt-1"
      >
        <UserX className="w-3.5 h-3.5" /> Remove Member
      </button>
      <button
        onClick={onClose}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#9AA1B4] hover:bg-[#F7F9FC]"
      >
        Close
      </button>
    </div>
  )
}

export default function TeamPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: members = [], isLoading, isError } = useGetTeamMembersQuery()
  const [showInvite, setShowInvite] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const isStaff = session?.admin?.role === 'STAFF'

  useEffect(() => {
    if (isStaff) router.replace('/orders')
  }, [isStaff, router])

  if (isStaff) return null

  return (
    <div className="space-y-5" onClick={() => setOpenMenu(null)}>
      {showInvite && <InviteDialog onClose={() => setShowInvite(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0D1426]">Team</h1>
          <p className="text-xs text-[#9AA1B4] mt-0.5">Manage your store staff and permissions</p>
        </div>
        {!isStaff && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 text-xs text-white font-semibold px-3 py-1.5 rounded"
            style={{ backgroundColor: '#0D1426' }}
          >
            <Plus className="w-3.5 h-3.5" /> Invite Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: members.length, color: '#1E5FFF', bg: '#E7EEFF' },
          { label: 'Managers', value: members.filter((m) => m.role === 'MANAGER').length, color: '#FF6A2C', bg: '#FFEAE1' },
          { label: 'Staff', value: members.filter((m) => m.role === 'STAFF').length, color: '#1DB980', bg: '#DFF5EC' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-lg font-bold text-[#0D1426] leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-[#525A72] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-xs text-[#9AA1B4]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading team…
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-xs text-[#FF3B30]">Failed to load team.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                  {['Member', 'Email', 'Role', 'Status', 'Joined', ''].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F9FC]">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-xs text-[#9AA1B4]">No team members yet.</td>
                  </tr>
                ) : (
                  members.map((m) => {
                    const role = ROLE_CONFIG[m.role]
                    return (
                      <tr key={m.id} className="hover:bg-[#F7F9FC] transition-colors" onClick={(e) => e.stopPropagation()}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}
                            >
                              {m.firstName[0]}
                            </div>
                            <span className="text-xs font-semibold text-[#0D1426]">
                              {m.firstName} {m.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#525A72]">{m.email}</span>
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
                              ? { backgroundColor: '#DFF5EC', color: '#1DB980' }
                              : { backgroundColor: '#EDF0F6', color: '#9AA1B4' }}
                          >
                            {m.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-[#9AA1B4]">{formatDate(m.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {m.role !== 'OWNER' && (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#EDF0F6]"
                              >
                                <UserCog className="w-3.5 h-3.5 text-[#9AA1B4]" />
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
