'use client'

import { useSession } from 'next-auth/react'
import SystemOverviewPage from '@/features/dashboard/SystemOverviewPage'
import VendorOverviewPage from '@/features/dashboard/VendorOverviewPage'

export default function HomePage() {
  const { data: session } = useSession()
  const adminType = session?.admin?.type

  if (adminType === 'VENDOR') return <VendorOverviewPage />
  return <SystemOverviewPage />
}
