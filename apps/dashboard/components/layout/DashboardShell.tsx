'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const PIN_STORAGE_KEY = 'sidebar-pinned'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pinned, setPinned] = useState(false)

  // Read the persisted preference after mount only, so the server-rendered
  // (collapsed) markup matches the client's first paint and we don't fight
  // hydration — a returning user's pinned sidebar just expands a beat later.
  useEffect(() => {
    setPinned(localStorage.getItem(PIN_STORAGE_KEY) === 'true')
  }, [])

  function togglePin() {
    setPinned((prev) => {
      const next = !prev
      localStorage.setItem(PIN_STORAGE_KEY, String(next))
      return next
    })
  }

  if (pathname === '/login' || pathname.startsWith('/vendor-onboarding')) return <>{children}</>

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} pinned={pinned} onTogglePin={togglePin} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`min-h-screen flex flex-col transition-[margin] duration-200 ${pinned ? 'lg:ml-[220px]' : 'lg:ml-[76px]'}`}>
        <Topbar onMenuToggle={() => setSidebarOpen((o) => !o)} pinned={pinned} />
        <main
          className="flex-1 p-[18px] overflow-y-auto"
          style={{ marginTop: 'var(--topbar-height)', backgroundColor: '#EDF0F6' }}
        >
          {children}
        </main>
      </div>
    </>
  )
}
