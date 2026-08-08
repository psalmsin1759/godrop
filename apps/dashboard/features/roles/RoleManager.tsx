'use client'

import { useMemo, useState } from 'react'
import { Plus, Loader2, ShieldCheck, X, Edit3, Trash2, Lock } from 'lucide-react'
import type { PermissionDef, Role, CreateRoleRequest, UpdateRoleRequest } from '@/types/api'

function inputCls() {
  return 'w-full text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] px-3 py-1.5 text-[#0D1426] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]'
}

function groupByModule(permissions: PermissionDef[]) {
  const groups: Record<string, PermissionDef[]> = {}
  for (const p of permissions) {
    groups[p.module] = groups[p.module] ?? []
    groups[p.module].push(p)
  }
  return groups
}

function RoleFormDialog({
  permissions,
  initial,
  isSaving,
  title,
  onSubmit,
  onClose,
}: {
  permissions: PermissionDef[]
  initial?: Role
  isSaving: boolean
  title: string
  onSubmit: (body: CreateRoleRequest) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set(initial?.permissions ?? []))
  const [error, setError] = useState('')
  const groups = useMemo(() => groupByModule(permissions), [permissions])

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (selected.size === 0) {
      setError('Select at least one permission.')
      return
    }
    try {
      await onSubmit({ name, description: description || undefined, permissions: Array.from(selected) })
      onClose()
    } catch (err: any) {
      setError(err?.data?.error ?? err?.data?.message ?? 'Failed to save role.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDF0F6] shrink-0">
          <h2 className="text-sm font-bold text-[#0D1426]">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#EDF0F6]">
            <X className="w-4 h-4 text-[#525A72]" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#525A72] mb-1">Role Name *</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls()} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#525A72] mb-1">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls()} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#525A72] mb-2">Permissions *</label>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {Object.entries(groups).map(([module, perms]) => (
                <div key={module} className="border border-[#EDF0F6] rounded-lg p-3">
                  <p className="text-[11px] font-bold text-[#0D1426] uppercase tracking-wide mb-2">{module}</p>
                  <div className="space-y-1.5">
                    {perms.map((p) => (
                      <label key={p.key} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected.has(p.key)}
                          onChange={() => toggle(p.key)}
                          className="mt-0.5"
                        />
                        <span className="text-xs text-[#525A72]">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-[11px] text-[#FF3B30]">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="text-xs px-4 py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]">
              Cancel
            </button>
            <button type="submit" disabled={isSaving}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
              Save Role
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RoleManager({
  permissions,
  roles,
  isLoading,
  canManage,
  onCreate,
  onUpdate,
  onDelete,
}: {
  permissions: PermissionDef[]
  roles: Role[]
  isLoading: boolean
  canManage: boolean
  onCreate: (body: CreateRoleRequest) => Promise<any>
  onUpdate: (args: { id: string; body: UpdateRoleRequest }) => Promise<any>
  onDelete: (id: string) => Promise<any>
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(role: Role) {
    if (!confirm(`Delete the "${role.name}" role? Admins currently using it must be reassigned first.`)) return
    setDeletingId(role.id)
    try {
      await onDelete(role.id)
    } catch (err: any) {
      alert(err?.data?.error ?? 'Failed to delete role.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDF0F6]">
        <div>
          <h2 className="text-sm font-bold text-[#0D1426]">Roles & Permissions</h2>
          <p className="text-[11px] text-[#9AA1B4] mt-0.5">Each role is a bundle of permissions — assign it to admins instead of granting access one-by-one</p>
        </div>
        {canManage && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5 shrink-0">
            <Plus className="w-3.5 h-3.5" /> New Role
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9AA1B4]">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading roles…
        </div>
      ) : (
        <div className="divide-y divide-[#F7F9FC]">
          {roles.map((role) => (
            <div key={role.id} className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-[#0D1426]">{role.name}</p>
                  {role.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5"
                      style={{ backgroundColor: '#E7EEFF', color: '#1E5FFF' }}>
                      <Lock className="w-2.5 h-2.5" /> Default
                    </span>
                  )}
                </div>
                {role.description && <p className="text-[11px] text-[#9AA1B4] mt-0.5">{role.description}</p>}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {role.permissions.includes('*') ? (
                    <span className="text-[10px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: '#FFE3E1', color: '#FF3B30' }}>
                      Full access
                    </span>
                  ) : (
                    role.permissions.map((p) => (
                      <span key={p} className="text-[10px] font-mono rounded-full px-2 py-0.5 bg-[#F7F9FC] text-[#525A72] border border-[#EDF0F6]">
                        {p}
                      </span>
                    ))
                  )}
                </div>
              </div>
              {canManage && !role.isDefault && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditRole(role)}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#F7F9FC]">
                    <Edit3 className="w-3.5 h-3.5 text-[#1E5FFF]" />
                  </button>
                  <button onClick={() => handleDelete(role)} disabled={deletingId === role.id}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#F7F9FC] disabled:opacity-50">
                    {deletingId === role.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF3B30]" /> : <Trash2 className="w-3.5 h-3.5 text-[#FF3B30]" />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <RoleFormDialog
          permissions={permissions}
          isSaving={false}
          title="New Role"
          onSubmit={onCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editRole && (
        <RoleFormDialog
          permissions={permissions}
          initial={editRole}
          isSaving={false}
          title={`Edit ${editRole.name}`}
          onSubmit={(body) => onUpdate({ id: editRole.id, body })}
          onClose={() => setEditRole(null)}
        />
      )}
    </div>
  )
}
