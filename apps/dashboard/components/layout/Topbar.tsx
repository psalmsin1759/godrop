'use client'

import { Search, ChevronRight, ChevronDown, Calendar, LogOut, Menu } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import NotificationBell from './NotificationBell'

interface TopbarProps {
  breadcrumb?: string[]
  onMenuToggle?: () => void
}

export default function Topbar({ breadcrumb = ['Dashboard', 'Home', 'Overview'], onMenuToggle }: TopbarProps) {
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
      className="fixed top-0 left-0 right-0 lg:left-[220px] z-20 flex items-center gap-4 px-5 border-b border-[#E7EAF1] backdrop-blur-xl"
      style={{ height: 'var(--topbar-height)', backgroundColor: 'rgba(255,255,255,.82)' }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-9 h-9 rounded-[10px] border border-[#E7EAF1] bg-white flex items-center justify-center hover:bg-[#F7F9FC] transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-[18px] h-[18px] text-[#0D1426]" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#525A72] min-w-0 flex-1 lg:min-w-[200px] lg:flex-initial">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 shrink-0 text-[#9AA1B4]" />}
            <span
              className={
                i === breadcrumb.length - 1
                  ? 'text-[#0D1426] font-extrabold text-[15px] tracking-[-0.3px]'
                  : 'hover:text-[#0D1426] cursor-pointer font-medium'
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2.5 flex-1 max-w-[440px] h-10 px-3 rounded-[11px] border border-[#E7EAF1] bg-white transition-all focus-within:border-[#1E5FFF] focus-within:ring-4 focus-within:ring-[#1E5FFF]/[0.14]">
        <Search className="w-[15px] h-[15px] text-[#9AA1B4] shrink-0" />
        <input
          type="text"
          placeholder="Search orders, riders, merchants…"
          className="flex-1 min-w-0 border-0 outline-none bg-transparent text-[13.5px] font-medium text-[#0D1426] placeholder:text-[#9AA1B4]"
        />
        <kbd className="font-mono text-[11px] text-[#9AA1B4] bg-[#F7F9FC] border border-[#E7EAF1] rounded-md px-1.5 py-0.5">⌘K</kbd>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
        {/* Date */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#525A72] mr-1">
          <Calendar className="w-3.5 h-3.5 text-[#9AA1B4]" />
          <span>{dateStr}</span>
        </div>

        {/* Environment badge */}
        <div
          className="hidden md:flex items-center gap-[7px] text-xs font-bold px-3 py-[7px] rounded-full"
          style={{ color: '#1DB980', backgroundColor: 'rgba(29,185,128,.13)' }}
        >
          <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#1DB980' }} />
          Production
        </div>

        {/* Notifications */}
        <NotificationBell />

        <div className="w-px h-[26px] bg-[#E7EAF1] hidden md:block" />

        {/* Profile */}
        <div className="flex items-center gap-2.5 pl-[5px] pr-2 py-[5px] rounded-[11px] border border-[#E7EAF1] bg-white">
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center text-white text-xs font-extrabold shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}
          >
            {adminInitials}
          </div>
          {session?.admin && (
            <div className="hidden md:block leading-tight">
              <p className="text-[13px] font-bold text-[#0D1426]">
                {session.admin.firstName} {session.admin.lastName}
              </p>
              <p className="text-[10.5px] text-[#9AA1B4] font-mono">{session.admin.role}</p>
            </div>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-[#9AA1B4]" />
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-9 h-9 rounded-[10px] border border-[#E7EAF1] bg-white flex items-center justify-center hover:bg-[#FFE3E1] hover:border-[#FF3B30]/30 transition-colors group shrink-0"
          title="Sign out"
        >
          <LogOut className="w-[15px] h-[15px] text-[#525A72] group-hover:text-[#FF3B30] transition-colors" />
        </button>
      </div>
    </header>
  )
}
