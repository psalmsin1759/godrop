'use client'

import { useState } from 'react'
import { Plus, X, Loader2, UserCheck, UserX } from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
  useGetBusinessTeamQuery,
  useCreateBusinessMemberMutation,
  useUpdateBusinessMemberMutation,
} from '@/store/services/businessApi'
import { formatDateTime } from '@/lib/utils'
import type { BusinessMember } from '@/types/api'

function AddMemberModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '' })
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
          <h2 className="text-base font-bold text-[#283c50]">Add Admin</h2>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#283c50]"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#283c50] mb-1.5">First Name</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#283c50] mb-1.5">Last Name</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#283c50] mb-1.5">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#283c50] mb-1.5">Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
            />
          </div>
          {error && (
            <p className="text-xs text-[#ea4d4d]">{(error as any)?.data?.error ?? 'Failed to create admin'}</p>
          )}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6b7885] hover:bg-[#f3f4f6] rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: '#3454d1' }}
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

function MemberRow({ member }: { member: BusinessMember }) {
  const { data: session } = useSession()
  const isOwner = session?.admin?.role === 'OWNER'
  const isSelf = session?.admin?.id === member.id
  const [update] = useUpdateBusinessMemberMutation()

  async function toggleActive() {
    if (!confirm(`${member.isActive ? 'Deactivate' : 'Activate'} this admin?`)) return
    await update({ memberId: member.id, body: { isActive: !member.isActive } })
  }

  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}>
        {member.firstName[0]}{member.lastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#283c50]">{member.firstName} {member.lastName}</p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${member.role === 'OWNER' ? 'bg-[#fef9ec] text-[#f59e0b]' : 'bg-[#eef0fb] text-[#3454d1]'}`}>
            {member.role}
          </span>
          {isSelf && <span className="text-[9px] text-[#9ca3af]">(you)</span>}
        </div>
        <p className="text-xs text-[#6b7885] truncate">{member.email}</p>
        <p className="text-[11px] text-[#9ca3af] mt-0.5">Added {formatDateTime(member.createdAt)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${member.isActive ? 'bg-[#e8faf0] text-[#17c666]' : 'bg-[#fef2f2] text-[#ea4d4d]'}`}>
          {member.isActive ? 'Active' : 'Inactive'}
        </span>
        {isOwner && !isSelf && member.role !== 'OWNER' && (
          <button
            onClick={toggleActive}
            className="p-1.5 rounded hover:bg-[#f3f4f6] text-[#9ca3af]"
            title={member.isActive ? 'Deactivate' : 'Activate'}
          >
            {member.isActive ? <UserX className="w-4 h-4 hover:text-[#ea4d4d]" /> : <UserCheck className="w-4 h-4 hover:text-[#17c666]" />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function BusinessTeamPage() {
  const { data: session } = useSession()
  const isOwner = session?.admin?.role === 'OWNER'
  const [showAdd, setShowAdd] = useState(false)

  const { data: team, isLoading } = useGetBusinessTeamQuery()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#283c50]">Team</h1>
          <p className="text-sm text-[#6b7885] mt-0.5">Manage admins who have access to your business dashboard.</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg"
            style={{ backgroundColor: '#3454d1' }}
          >
            <Plus className="w-4 h-4" /> Add Admin
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" />
          </div>
        ) : !team || team.length === 0 ? (
          <p className="text-center text-sm text-[#6b7885] py-12">No team members yet.</p>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {team.map((m) => <MemberRow key={m.id} member={m} />)}
          </div>
        )}
      </div>

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
