'use client'

import { Search, ChevronRight, Calendar, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import NotificationBell from './NotificationBell'

interface TopbarProps {
  breadcrumb?: string[]
}

export default function Topbar({ breadcrumb = ['Dashboard', 'Home', 'Overview'] }: TopbarProps) {
  const { data: session } = useSession()
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const adminInitials = session?.admin
    ? `${session.admin.firstName[0]}${session.admin.lastName[0]}`
    : '?'

  return (
    <header
      className="fixed top-0 right-0 z-20 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-5 gap-4"
      style={{ left: 'var(--sidebar-width)', height: 'var(--topbar-height)' }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#6b7885] min-w-0">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 shrink-0 text-[#d1d5db]" />}
            <span
              className={
                i === breadcrumb.length - 1
                  ? 'text-[#283c50] font-medium'
                  : 'hover:text-[#283c50] cursor-pointer'
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Date */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#6b7885]">
          <Calendar className="w-3.5 h-3.5 text-[#9ca3af]" />
          <span>{dateStr}</span>
        </div>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search orders, riders..."
            className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#3454d1] focus:border-[#3454d1] w-52 transition-all"
          />
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Admin avatar + sign out */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}
          >
            {adminInitials}
          </div>
          {session?.admin && (
            <div className="hidden md:block">
              <p className="text-xs font-medium text-[#283c50] leading-tight">
                {session.admin.firstName} {session.admin.lastName}
              </p>
              <p className="text-[10px] text-[#9ca3af]">{session.admin.role}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#fdf0f0] transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 text-[#ea4d4d]" />
          </button>
        </div>
      </div>
    </header>
  )
}
