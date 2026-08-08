'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, ChevronRight, ChevronDown, Calendar, User, KeyRound, LogOut, Menu,
  Loader2, ShoppingBag, Users, Bike, Store,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useGetAdminOrdersQuery } from '@/store/services/adminOrdersApi'
import { useGetVendorOrdersQuery } from '@/store/services/vendorOrdersApi'
import { useGetCustomersQuery } from '@/features/customers/store/customersApi'
import { useGetRidersQuery } from '@/store/services/ridersApi'
import { useGetVendorsQuery } from '@/features/vendors/store/vendorsApi'
import { personName } from '@/lib/utils'
import NotificationBell from './NotificationBell'

interface TopbarProps {
  breadcrumb?: string[]
  onMenuToggle?: () => void
  pinned: boolean
}

function useDebounce(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9AA1B4]">{title}</p>
      {children}
    </div>
  )
}

function SearchResultRow({
  icon,
  primary,
  secondary,
  onClick,
}: {
  icon: React.ReactNode
  primary: string
  secondary: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#F7F9FC] transition-colors"
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#E7EEFF] text-[#1E5FFF]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#0D1426] truncate">{primary}</p>
        <p className="text-[11px] text-[#9AA1B4] truncate">{secondary}</p>
      </div>
    </button>
  )
}

export default function Topbar({ breadcrumb = ['Dashboard', 'Home', 'Overview'], onMenuToggle, pinned }: TopbarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query)
  const searching = debouncedQuery.trim().length >= 2

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

  const isVendorRole = session?.admin?.type === 'VENDOR'
  const isBusinessRole = session?.admin?.type === 'BUSINESS'
  // Vendor/business admins can't hit the system-wide search endpoints (permission-scoped
  // to system admins) — for them, search is limited to their own order history instead.
  const crossEntitySearch = !isVendorRole && !isBusinessRole

  const { data: ordersData, isFetching: fetchingOrders } = useGetAdminOrdersQuery(
    { search: debouncedQuery, limit: 5 },
    { skip: !searching || !crossEntitySearch }
  )
  const { data: vendorOrdersData, isFetching: fetchingVendorOrders } = useGetVendorOrdersQuery(
    { limit: 50 },
    { skip: !searching || crossEntitySearch }
  )
  const { data: customersData, isFetching: fetchingCustomers } = useGetCustomersQuery(
    { search: debouncedQuery, limit: 5 },
    { skip: !searching || !crossEntitySearch }
  )
  const { data: ridersData, isFetching: fetchingRiders } = useGetRidersQuery(
    { search: debouncedQuery, limit: 5 },
    { skip: !searching || !crossEntitySearch }
  )
  const { data: vendorsData, isFetching: fetchingVendors } = useGetVendorsQuery(undefined, {
    skip: !searching || !crossEntitySearch,
  })

  const q = debouncedQuery.trim().toLowerCase()
  const vendorOwnOrders = (vendorOrdersData?.data ?? [])
    .filter((o) =>
      o.trackingCode.toLowerCase().includes(q) ||
      personName(o.customer.firstName, o.customer.lastName).toLowerCase().includes(q)
    )
    .slice(0, 5)
  const orderResults = crossEntitySearch ? ordersData?.data ?? [] : vendorOwnOrders
  const customerResults = crossEntitySearch ? customersData?.data ?? [] : []
  const riderResults = crossEntitySearch ? ridersData?.data ?? [] : []
  const vendorResults = crossEntitySearch
    ? (vendorsData ?? []).filter((v) => v.name.toLowerCase().includes(q)).slice(0, 5)
    : []

  const fetching = fetchingOrders || fetchingVendorOrders || fetchingCustomers || fetchingRiders || fetchingVendors
  const hasResults =
    orderResults.length + customerResults.length + riderResults.length + vendorResults.length > 0

  function goTo(href: string) {
    router.push(href)
    setSearchOpen(false)
    setQuery('')
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setSearchOpen(true)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        searchInputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-20 flex items-center gap-4 px-5 border-b border-[#E7EAF1] backdrop-blur-xl transition-[left] duration-200 ${pinned ? 'lg:left-[220px]' : 'lg:left-[76px]'}`}
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
      <div className="hidden sm:block relative flex-1 max-w-[440px]" ref={searchRef}>
        <div className="flex items-center gap-2.5 h-10 px-3 rounded-[11px] border border-[#E7EAF1] bg-white transition-all focus-within:border-[#1E5FFF] focus-within:ring-4 focus-within:ring-[#1E5FFF]/[0.14]">
          <Search className="w-[15px] h-[15px] text-[#9AA1B4] shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
            placeholder={crossEntitySearch ? 'Search orders, riders, merchants…' : 'Search your orders…'}
            className="flex-1 min-w-0 border-0 outline-none bg-transparent text-[13.5px] font-medium text-[#0D1426] placeholder:text-[#9AA1B4]"
          />
          {fetching ? (
            <Loader2 className="w-3.5 h-3.5 text-[#9AA1B4] animate-spin shrink-0" />
          ) : (
            <kbd className="font-mono text-[11px] text-[#9AA1B4] bg-[#F7F9FC] border border-[#E7EAF1] rounded-md px-1.5 py-0.5">⌘K</kbd>
          )}
        </div>

        {searchOpen && searching && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E7EAF1] rounded-xl shadow-lg max-h-[420px] overflow-y-auto z-30">
            {!hasResults ? (
              <p className="text-xs text-[#9AA1B4] text-center py-6">
                {fetching ? 'Searching…' : `No results for "${debouncedQuery}"`}
              </p>
            ) : (
              <>
                {orderResults.length > 0 && (
                  <SearchGroup title="Orders">
                    {orderResults.map((o) => (
                      <SearchResultRow
                        key={o.id}
                        icon={<ShoppingBag className="w-3.5 h-3.5" />}
                        primary={o.trackingCode}
                        secondary={personName(o.customer.firstName, o.customer.lastName)}
                        onClick={() => goTo(`/orders/${o.id}`)}
                      />
                    ))}
                  </SearchGroup>
                )}
                {customerResults.length > 0 && (
                  <SearchGroup title="Customers">
                    {customerResults.map((c) => (
                      <SearchResultRow
                        key={c.id}
                        icon={<Users className="w-3.5 h-3.5" />}
                        primary={personName(c.firstName, c.lastName)}
                        secondary={c.phone}
                        onClick={() => goTo(`/customers/${c.id}`)}
                      />
                    ))}
                  </SearchGroup>
                )}
                {riderResults.length > 0 && (
                  <SearchGroup title="Riders">
                    {riderResults.map((r) => (
                      <SearchResultRow
                        key={r.id}
                        icon={<Bike className="w-3.5 h-3.5" />}
                        primary={personName(r.firstName, r.lastName)}
                        secondary={r.phone}
                        onClick={() => goTo(`/riders?riderId=${r.id}`)}
                      />
                    ))}
                  </SearchGroup>
                )}
                {vendorResults.length > 0 && (
                  <SearchGroup title="Vendors">
                    {vendorResults.map((v) => (
                      <SearchResultRow
                        key={v.id}
                        icon={<Store className="w-3.5 h-3.5" />}
                        primary={v.name}
                        secondary={v.email}
                        onClick={() => goTo(`/vendors/${v.id}`)}
                      />
                    ))}
                  </SearchGroup>
                )}
              </>
            )}
          </div>
        )}
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

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-[5px] pr-2 py-[5px] rounded-[11px] border border-[#E7EAF1] bg-white hover:bg-[#F7F9FC] transition-colors"
          >
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center text-white text-xs font-extrabold shrink-0"
              style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}
            >
              {adminInitials}
            </div>
            {session?.admin && (
              <div className="hidden md:block leading-tight text-left">
                <p className="text-[13px] font-bold text-[#0D1426]">
                  {session.admin.firstName} {session.admin.lastName}
                </p>
                <p className="text-[10.5px] text-[#9AA1B4] font-mono">{session.admin.role.name}</p>
              </div>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-[#9AA1B4] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#E7EAF1] rounded-xl shadow-lg overflow-hidden z-30">
              <Link
                href="/settings?tab=profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[#0D1426] hover:bg-[#F7F9FC] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#9AA1B4]" /> Profile
              </Link>
              <Link
                href="/settings?tab=security"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[#0D1426] hover:bg-[#F7F9FC] transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#9AA1B4]" /> Change Password
              </Link>
              <div className="h-px bg-[#EDF0F6]" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[#FF3B30] hover:bg-[#FFE3E1] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
