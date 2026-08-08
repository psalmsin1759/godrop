'use client'

import { useSession } from 'next-auth/react'
import {
  useGetSystemPermissionsQuery,
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/store/services/adminApi'
import { hasPermission } from '@/lib/permissions'
import RoleManager from './RoleManager'

export default function RolesPage() {
  const { data: session } = useSession()
  const canManage = hasPermission(session, 'roles:write')

  const { data: permissions = [] } = useGetSystemPermissionsQuery()
  const { data: roles = [], isLoading } = useGetRolesQuery()
  const [createRole] = useCreateRoleMutation()
  const [updateRole] = useUpdateRoleMutation()
  const [deleteRole] = useDeleteRoleMutation()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0D1426]">Roles</h1>
        <p className="text-xs text-[#9AA1B4] mt-0.5">Control what each admin can see and do on the dashboard</p>
      </div>

      <RoleManager
        permissions={permissions}
        roles={roles}
        isLoading={isLoading}
        canManage={canManage}
        onCreate={(body) => createRole(body).unwrap()}
        onUpdate={(args) => updateRole(args).unwrap()}
        onDelete={(id) => deleteRole(id).unwrap()}
      />
    </div>
  )
}
