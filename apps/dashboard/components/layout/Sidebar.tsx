'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  ShoppingBag,
  Bike,
  Store,
  Truck,
  Package,
  Users,
  BarChart3,
  AlertTriangle,
  Settings,
  ChevronRight,
  ChevronDown,
  LogOut,
  Tag,
  UserCog,
  Bell,
  Wallet,
  Mail,
  ImagePlay,
  Building2,
  KeyRound,
  Megaphone,
  TicketPercent,
  Smartphone,
  Pin,
  PinOff,
  MessageSquareWarning,
} from 'lucide-react'

function GodropMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3.5A10.5 10.5 0 1 0 24.5 14H14" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M20.5 6.5c1.5 1.6 2.6 3.4 2.6 4.9a2.6 2.6 0 1 1-5.2 0c0-1.5 1.1-3.3 2.6-4.9z" fill="#FFB38A" />
    </svg>
  )
}

interface NavLinkItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}

interface NavSection {
  label: string
  items: NavLinkItem[]
}

// ─── System admin ───────────────────────────────────────────────────────────
const systemOperations: NavLinkItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/vendors', icon: Store, label: 'Vendors' },
  { href: '/riders', icon: Bike, label: 'Riders' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/trucks', icon: Truck, label: 'Trucks' },
  { href: '/parcels', icon: Package, label: 'Parcels' },
]
const systemGrowth: NavLinkItem[] = [
  { href: '/heroes', icon: ImagePlay, label: 'Hero Slides' },
  { href: '/banners', icon: Megaphone, label: 'Promo Banners' },
  { href: '/coupons', icon: TicketPercent, label: 'Coupons' },
]
const systemInsights: NavLinkItem[] = [
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/disputes', icon: MessageSquareWarning, label: 'Disputes', badge: 0 },
  { href: '/audit-logs', icon: AlertTriangle, label: 'Audit Logs' },
]
const systemAdministration: NavLinkItem[] = [
  { href: '/admins', icon: UserCog, label: 'Admins' },
  { href: '/businesses', icon: Building2, label: 'Businesses' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]
const systemMessaging: NavLinkItem[] = [
  { href: '/messaging/email', icon: Mail, label: 'Email' },
  { href: '/messaging/sms', icon: Smartphone, label: 'Test OTP SMS' },
  { href: '/push', icon: Bell, label: 'Push Notifications' },
]

// ─── Vendor ──────────────────────────────────────────────────────────────────
const vendorOperations: NavLinkItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/catalog', icon: Tag, label: 'Catalogue' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
]
const vendorInsights: NavLinkItem[] = [
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/audit-logs', icon: AlertTriangle, label: 'Audit Logs' },
]
const vendorAdministration: NavLinkItem[] = [
  { href: '/team', icon: UserCog, label: 'Team' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const vendorStaffOperations: NavLinkItem[] = [
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/catalog', icon: Tag, label: 'Catalogue' },
]
const vendorStaffAdministration: NavLinkItem[] = [
  { href: '/settings', icon: Settings, label: 'Settings' },
]

// ─── Business ────────────────────────────────────────────────────────────────
const businessOperations: NavLinkItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/business/riders', icon: Bike, label: 'Riders' },
  { href: '/business/wallet', icon: Wallet, label: 'Wallet' },
]
const businessAdministration: NavLinkItem[] = [
  { href: '/business/team', icon: UserCog, label: 'Team' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const COLLAPSED_SECTIONS_KEY = 'sidebar-collapsed-sections'

export default function Sidebar({
  isOpen,
  onClose,
  pinned,
  onTogglePin,
}: {
  isOpen: boolean
  onClose: () => void
  pinned: boolean
  onTogglePin: () => void
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [hovered, setHovered] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSED_SECTIONS_KEY)
      if (raw) setCollapsedSections(new Set(JSON.parse(raw)))
    } catch {}
  }, [])

  function toggleSection(label: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(Array.from(next)))
      return next
    })
  }

  const isBusiness = session?.admin?.type === 'BUSINESS'
  const isVendor = session?.admin?.type === 'VENDOR'
  const isVendorStaff = isVendor && session?.admin?.role === 'STAFF'
  const isSuperAdmin = session?.admin?.role === 'SUPER_ADMIN'

  const sections: NavSection[] = isBusiness
    ? [
        { label: 'Operations', items: businessOperations },
        { label: 'Administration', items: businessAdministration },
      ]
    : isVendorStaff
    ? [
        { label: 'Operations', items: vendorStaffOperations },
        { label: 'Administration', items: vendorStaffAdministration },
      ]
    : isVendor
    ? [
        { label: 'Operations', items: vendorOperations },
        { label: 'Insights', items: vendorInsights },
        { label: 'Administration', items: vendorAdministration },
      ]
    : [
        { label: 'Operations', items: systemOperations },
        { label: 'Growth', items: systemGrowth },
        { label: 'Insights', items: systemInsights },
        {
          label: 'Administration',
          items: isSuperAdmin
            ? [...systemAdministration, { href: '/otp-assist', icon: KeyRound, label: 'OTP Assist' }]
            : systemAdministration,
        },
        { label: 'Messaging', items: systemMessaging },
      ]

  const adminInitials = session?.admin
    ? `${session.admin.firstName[0]}${session.admin.lastName[0]}`
    : '?'

  const expanded = pinned || hovered

  function NavItem({ href, icon: Icon, label, badge }: NavLinkItem) {
    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
    return (
      <Link
        href={href}
        onClick={onClose}
        title={!expanded ? label : undefined}
        className={`${isActive ? 'sidebar-link-active' : 'sidebar-link'} ${!expanded ? 'justify-center !px-0' : ''}`}
      >
        <Icon className="w-[18px] h-[18px] shrink-0 opacity-90" strokeWidth={isActive ? 2.5 : 2} />
        {expanded && <span className="flex-1 truncate">{label}</span>}
        {expanded && badge !== undefined && badge > 0 && !isActive && (
          <span
            className="ml-auto min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono px-1"
            style={{ backgroundColor: 'var(--red, #FF3B30)', color: '#fff' }}
          >
            {badge}
          </span>
        )}
        {expanded && isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50 shrink-0" />}
      </Link>
    )
  }

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fixed left-0 top-0 h-full flex flex-col gap-1.5 px-3.5 py-4.5 transition-all duration-200 border-r border-white/[0.06] ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${hovered && !pinned ? 'shadow-2xl' : ''}`}
      style={{
        width: expanded ? '220px' : '76px',
        zIndex: hovered && !pinned ? 40 : 30,
        background: 'linear-gradient(185deg,#0C2150 0%,#081A3F 55%,#06122E 100%)',
      }}
    >
      {/* Logo + pin toggle */}
      <div className={`flex items-center gap-2.5 px-2 pt-1.5 pb-4 ${!expanded ? 'justify-center' : ''}`}>
        <div
          className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(150deg,#1E5FFF,#0A3FD1 60%,#0B1F4A)',
            boxShadow: '0 4px 12px rgba(30,95,255,.4)',
          }}
        >
          <GodropMark size={22} />
        </div>
        {expanded && (
          <>
            <div className="leading-tight flex-1 min-w-0">
              <p className="text-white font-extrabold text-[18px] tracking-tight leading-none">GoDrop</p>
              <p className="font-mono text-[9.5px] font-medium tracking-[1.6px] uppercase text-white/40 mt-1">
                {isBusiness ? 'Business Console' : isVendor ? 'Vendor Console' : 'Admin Console'}
              </p>
            </div>
            <button
              onClick={onTogglePin}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 shrink-0 transition-colors"
              title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
            >
              {pinned ? (
                <PinOff className="w-3.5 h-3.5 text-white/60" />
              ) : (
                <Pin className="w-3.5 h-3.5 text-white/60" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-0.5 min-h-0">
        {sections.map((section, i) => {
          if (section.items.length === 0) return null
          const collapsed = expanded && collapsedSections.has(section.label)
          return (
            <div key={section.label}>
              {expanded && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.label)}
                  className={`w-full flex items-center justify-between gap-1 px-3 mb-1.5 group/section ${
                    i === 0 ? '' : 'mt-4'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 group-hover/section:text-white/60 transition-colors">
                    {section.label}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-white/30 group-hover/section:text-white/60 transition-transform ${
                      collapsed ? '-rotate-90' : ''
                    }`}
                  />
                </button>
              )}
              {!collapsed &&
                section.items.map((item) => <NavItem key={item.href} {...item} />)}
            </div>
          )
        })}
      </nav>

      {/* Status + user footer */}
      <div className="flex flex-col gap-1.5">
        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl group ${!expanded ? 'justify-center !px-0' : ''}`}>
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center text-white text-xs font-extrabold shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}
            title={!expanded ? (session?.admin ? `${session.admin.firstName} ${session.admin.lastName}` : 'Admin') : undefined}
          >
            {adminInitials}
          </div>
          {expanded && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold leading-tight truncate">
                  {session?.admin ? `${session.admin.firstName} ${session.admin.lastName}` : 'Admin'}
                </p>
                <p className="text-white/40 text-[10px] truncate font-mono">
                  {session?.admin?.email ?? '—'}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 shrink-0"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 text-white/60" />
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes sidebarPulse {
          0% { box-shadow: 0 0 0 0 rgba(29,185,128,.5); }
          70% { box-shadow: 0 0 0 7px rgba(29,185,128,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,185,128,0); }
        }
      `}</style>
    </aside>
  )
}
