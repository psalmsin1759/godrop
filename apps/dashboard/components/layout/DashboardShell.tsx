'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/login') return <>{children}</>

  return (
    <>
      <Sidebar />
      <div
        className="min-h-screen flex flex-col"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        <Topbar />
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
