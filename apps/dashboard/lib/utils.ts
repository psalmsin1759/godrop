import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(naira: number): string {
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(2)}M`
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(1)}K`
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatAmountFull(naira: number): string {
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** @deprecated Input is Kobo (legacy). Use `formatAmount` for fields already converted to Naira. */
export function formatNaira(kobo: number): string {
  return formatAmount(kobo / 100)
}

/** @deprecated Input is Kobo (legacy). Use `formatAmountFull` for fields already converted to Naira. */
export function formatNairaFull(kobo: number): string {
  return formatAmountFull(kobo / 100)
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

/** Customers can exist with no name yet (phone/OTP signup before profile completion). */
export function personName(firstName: string | null, lastName: string | null): string {
  const name = [firstName, lastName].filter(Boolean).join(' ')
  return name || 'Unnamed customer'
}

export function personInitials(firstName: string | null, lastName: string | null): string {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`
  return initials || '?'
}
