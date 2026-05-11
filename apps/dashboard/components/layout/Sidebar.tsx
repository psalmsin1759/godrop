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
  Zap,
  LogOut,
  Tag,
  UserCog,
  Bell,
} from 'lucide-react'

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
  { href: '/push', icon: Bell, label: 'Push Notifications' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const vendorNav = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/catalog', icon: Tag, label: 'Catalogue' },
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

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isVendor = session?.admin?.type === 'VENDOR'
  const isVendorStaff = isVendor && session?.admin?.role === 'STAFF'
  const mainNav = isVendorStaff ? vendorStaffNav : isVendor ? vendorNav : systemNav
  const reportsNav = isVendorStaff ? vendorStaffReportsNav : isVendor ? vendorReportsNav : systemReportsNav

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
        <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
        <span>{label}</span>
        {badge !== undefined && badge > 0 && !isActive && (
          <span
            className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: '#ea4d4d', color: '#fff' }}
          >
            {badge}
          </span>
        )}
        {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
      </Link>
    )
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-30 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{ width: 'var(--sidebar-width)', backgroundColor: '#283c50' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: '#3454d1' }}
        >
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-white font-bold text-base tracking-tight">
          Go<span style={{ color: '#3dc7be' }}>drop</span>
        </span>
        <span
          className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: isVendor ? '#17c666' : '#3454d1', color: '#fff' }}
        >
          {isVendor ? 'VENDOR' : 'OPS'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-2">
          Main Menu
        </p>
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mt-4 mb-2">
          {isVendor ? 'Manage' : 'Reports'}
        </p>
        {reportsNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}
          >
            {adminInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium leading-tight truncate">
              {session?.admin ? `${session.admin.firstName} ${session.admin.lastName}` : 'Admin'}
            </p>
            <p className="text-white/40 text-[10px] truncate">
              {session?.admin?.email ?? '—'}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 text-white/60" />
          </button>
        </div>
      </div>
    </aside>
  )
}
