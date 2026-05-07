'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === '/login') return <>{children}</>

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="min-h-screen flex flex-col lg:ml-[220px]">
        <Topbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main
          className="flex-1 p-5 overflow-y-auto"
          style={{ marginTop: 'var(--topbar-height)', backgroundColor: '#f0f2f8' }}
        >
          {children}
        </main>
      </div>
    </>
  )
}
