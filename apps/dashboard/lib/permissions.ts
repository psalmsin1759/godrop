import type { Session } from 'next-auth'

export const WILDCARD = '*'

export function hasPermission(session: Session | null | undefined, key: string): boolean {
  const permissions = session?.admin?.role?.permissions
  if (!permissions) return false
  return permissions.includes(WILDCARD) || permissions.includes(key)
}

export function hasAnyPermission(session: Session | null | undefined, keys: string[]): boolean {
  return keys.some((key) => hasPermission(session, key))
}
