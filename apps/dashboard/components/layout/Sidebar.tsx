'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'

function GodropMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3.5A10.5 10.5 0 1 0 24.5 14H14" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M20.5 6.5c1.5 1.6 2.6 3.4 2.6 4.9a2.6 2.6 0 1 1-5.2 0c0-1.5 1.1-3.3 2.6-4.9z" fill="#FFB38A" />
    </svg>
  )
}

const systemNav = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/vendors', icon: Store, label: 'Vendors' },
  { href: '/riders', icon: Bike, label: 'Riders' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/trucks', icon: Truck, label: 'Trucks' },
  { href: '/parcels', icon: Package, label: 'Parcels' },
]

const systemReportsNav = [
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/disputes', icon: AlertTriangle, label: 'Audit Logs', badge: 0 },
  { href: '/admins', icon: UserCog, label: 'Admins' },
  { href: '/businesses', icon: Building2, label: 'Businesses' },
  { href: '/heroes', icon: ImagePlay, label: 'Hero Slides' },
  { href: '/banners', icon: Megaphone, label: 'Promo Banners' },
  { href: '/coupons', icon: TicketPercent, label: 'Coupons' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const systemMessagingNav = [
  { href: '/messaging/email', icon: Mail, label: 'Email' },
  { href: '/messaging/sms', icon: Smartphone, label: 'Test OTP SMS' },
  { href: '/push', icon: Bell, label: 'Push Notifications' },
]

const vendorNav = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/catalog', icon: Tag, label: 'Catalogue' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
]

const vendorReportsNav = [
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/disputes', icon: AlertTriangle, label: 'Audit Logs' },
  { href: '/team', icon: UserCog, label: 'Team' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const vendorStaffNav = [
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/catalog', icon: Tag, label: 'Catalogue' },
]

const vendorStaffReportsNav = [
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const businessNav = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/business/riders', icon: Bike, label: 'Riders' },
  { href: '/business/wallet', icon: Wallet, label: 'Wallet' },
]

const businessReportsNav = [
  { href: '/business/team', icon: UserCog, label: 'Team' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isBusiness = session?.admin?.type === 'BUSINESS'
  const isVendor = session?.admin?.type === 'VENDOR'
  const isVendorStaff = isVendor && session?.admin?.role === 'STAFF'
  const isSuperAdmin = session?.admin?.role === 'SUPER_ADMIN'

  const mainNav = isBusiness ? businessNav : isVendorStaff ? vendorStaffNav : isVendor ? vendorNav : systemNav
  const reportsNav = isBusiness
    ? businessReportsNav
    : isVendorStaff
    ? vendorStaffReportsNav
    : isVendor
    ? vendorReportsNav
    : [
        ...systemReportsNav.slice(0, 3),
        ...(isSuperAdmin ? [{ href: '/otp-assist', icon: KeyRound, label: 'OTP Assist' }] : []),
        ...systemReportsNav.slice(3),
      ]
  const messagingNav = !isVendor && !isBusiness ? systemMessagingNav : null

  const adminInitials = session?.admin
    ? `${session.admin.firstName[0]}${session.admin.lastName[0]}`
    : '?'

  function NavItem({
    href,
    icon: Icon,
    label,
    badge,
  }: {
    href: string
    icon: React.ElementType
    label: string
    badge?: number
  }) {
    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
    return (
      <Link href={href} onClick={onClose} className={isActive ? 'sidebar-link-active' : 'sidebar-link'}>
        <Icon className="w-[18px] h-[18px] shrink-0 opacity-90" strokeWidth={isActive ? 2.5 : 2} />
        <span className="flex-1 truncate">{label}</span>
        {badge !== undefined && badge > 0 && !isActive && (
          <span
            className="ml-auto min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono px-1"
            style={{ backgroundColor: 'var(--red, #FF3B30)', color: '#fff' }}
          >
            {badge}
          </span>
        )}
        {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50 shrink-0" />}
      </Link>
    )
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-30 flex flex-col gap-1.5 px-3.5 py-4.5 transition-transform duration-300 border-r border-white/[0.06] ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{
        width: 'var(--sidebar-width)',
        background: 'linear-gradient(185deg,#0C2150 0%,#081A3F 55%,#06122E 100%)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-4">
        <div
          className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(150deg,#1E5FFF,#0A3FD1 60%,#0B1F4A)',
            boxShadow: '0 4px 12px rgba(30,95,255,.4)',
          }}
        >
          <GodropMark size={22} />
        </div>
        <div className="leading-tight">
          <p className="text-white font-extrabold text-[18px] tracking-tight leading-none">GoDrop</p>
          <p className="font-mono text-[9.5px] font-medium tracking-[1.6px] uppercase text-white/40 mt-1">
            {isBusiness ? 'Business Console' : isVendor ? 'Vendor Console' : 'Admin Console'}
          </p>
        </div>
        
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto flex flex-col gap-0.5 min-h-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 mb-1.5">
          Main Menu
        </p>
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}


         {messagingNav && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 mt-4 mb-1.5">
              Messaging
            </p>
            {messagingNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </>
        )}

        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 mt-4 mb-1.5">
          {isVendor || isBusiness ? 'Manage' : 'Settings'}
        </p>
        {reportsNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

       
      </nav>

      {/* Status + user footer */}
      <div className="flex flex-col gap-1.5">
        

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl group">
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center text-white text-xs font-extrabold shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}
          >
            {adminInitials}
          </div>
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
