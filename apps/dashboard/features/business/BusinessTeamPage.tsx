'use client'

import { useState } from 'react'
import { Plus, X, Loader2, UserCheck, UserX, Download } from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
  useGetBusinessTeamQuery,
  useCreateBusinessMemberMutation,
  useUpdateBusinessMemberMutation,
  useGetBusinessPermissionsQuery,
  useGetBusinessRolesQuery,
  useCreateBusinessRoleMutation,
  useUpdateBusinessRoleMutation,
  useDeleteBusinessRoleMutation,
} from '@/store/services/businessApi'
import { hasPermission } from '@/lib/permissions'
import { formatDateTime } from '@/lib/utils'
import { exportToCsv } from '@/lib/exportCsv'
import type { BusinessMember, Role } from '@/types/api'
import RoleManager from '@/features/roles/RoleManager'

function AddMemberModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '', roleId: roles[0]?.id ?? '' })
  const [create, { isLoading, error }] = useCreateBusinessMemberMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await create(form).unwrap()
      onClose()
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#0D1426]">Add Admin</h2>
          <button onClick={onClose} className="text-[#9AA1B4] hover:text-[#0D1426]"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#0D1426] mb-1.5">First Name</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0D1426] mb-1.5">Last Name</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0D1426] mb-1.5">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0D1426] mb-1.5">Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0D1426] mb-1.5">Role</label>
            <select
              value={form.roleId}
              onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
              className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-xs text-[#FF3B30]">{(error as any)?.data?.error ?? 'Failed to create admin'}</p>
          )}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#525A72] hover:bg-[#EDF0F6] rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: '#1E5FFF' }}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MemberRow({ member, canManage }: { member: BusinessMember; canManage: boolean }) {
  const { data: session } = useSession()
  const isSelf = session?.admin?.id === member.id
  const [update] = useUpdateBusinessMemberMutation()
  const isFullAccess = member.role.permissions.includes('*')

  async function toggleActive() {
    if (!confirm(`${member.isActive ? 'Deactivate' : 'Activate'} this admin?`)) return
    await update({ memberId: member.id, body: { isActive: !member.isActive } })
  }

  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}>
        {member.firstName[0]}{member.lastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#0D1426]">{member.firstName} {member.lastName}</p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isFullAccess ? 'bg-[#FBEDD7] text-[#E8930C]' : 'bg-[#E7EEFF] text-[#1E5FFF]'}`}>
            {member.role.name}
          </span>
          {isSelf && <span className="text-[9px] text-[#9AA1B4]">(you)</span>}
        </div>
        <p className="text-xs text-[#525A72] truncate">{member.email}</p>
        <p className="text-[11px] text-[#9AA1B4] mt-0.5">Added {formatDateTime(member.createdAt)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${member.isActive ? 'bg-[#DFF5EC] text-[#1DB980]' : 'bg-[#FFE3E1] text-[#FF3B30]'}`}>
          {member.isActive ? 'Active' : 'Inactive'}
        </span>
        {canManage && !isSelf && !member.isOwner && (
          <button
            onClick={toggleActive}
            className="p-1.5 rounded hover:bg-[#EDF0F6] text-[#9AA1B4]"
            title={member.isActive ? 'Deactivate' : 'Activate'}
          >
            {member.isActive ? <UserX className="w-4 h-4 hover:text-[#FF3B30]" /> : <UserCheck className="w-4 h-4 hover:text-[#1DB980]" />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function BusinessTeamPage() {
  const { data: session } = useSession()
  const canManage = hasPermission(session, 'team:write')
  const [showAdd, setShowAdd] = useState(false)

  const { data: team, isLoading } = useGetBusinessTeamQuery()
  const { data: roles = [] } = useGetBusinessRolesQuery()
  const { data: permissions = [] } = useGetBusinessPermissionsQuery(undefined, { skip: !canManage })
  const [createRole] = useCreateBusinessRoleMutation()
  const [updateRole] = useUpdateBusinessRoleMutation()
  const [deleteRole] = useDeleteBusinessRoleMutation()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0D1426]">Team</h1>
          <p className="text-sm text-[#525A72] mt-0.5">Manage admins who have access to your business dashboard.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCsv('business-team', team ?? [], [
              { header: 'Name', value: (m) => `${m.firstName} ${m.lastName}` },
              { header: 'Email', value: (m) => m.email },
              { header: 'Role', value: (m) => m.role.name },
              { header: 'Status', value: (m) => m.isActive ? 'Active' : 'Inactive' },
              { header: 'Joined', value: (m) => formatDateTime(m.createdAt) },
            ])}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#525A72] bg-white border border-[#E7EAF1] rounded-lg hover:bg-[#F7F9FC]"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          {canManage && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg"
              style={{ backgroundColor: '#1E5FFF' }}
            >
              <Plus className="w-4 h-4" /> Add Admin
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
          </div>
        ) : !team || team.length === 0 ? (
          <p className="text-center text-sm text-[#525A72] py-12">No team members yet.</p>
        ) : (
          <div className="divide-y divide-[#EDF0F6]">
            {team.map((m) => <MemberRow key={m.id} member={m} canManage={canManage} />)}
          </div>
        )}
      </div>

      {showAdd && <AddMemberModal roles={roles} onClose={() => setShowAdd(false)} />}

      <RoleManager
        permissions={permissions}
        roles={roles}
        isLoading={false}
        canManage={canManage}
        onCreate={(body) => createRole(body).unwrap()}
        onUpdate={(args) => updateRole(args).unwrap()}
        onDelete={(id) => deleteRole(id).unwrap()}
      />
    </div>
  )
}
