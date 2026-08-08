'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SystemOverviewPage from '@/features/dashboard/SystemOverviewPage'
import VendorOverviewPage from '@/features/dashboard/VendorOverviewPage'
import BusinessOverviewPage from '@/features/business/BusinessOverviewPage'
import { hasPermission } from '@/lib/permissions'

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const admin = session?.admin
  const canViewVendorOverview = hasPermission(session, 'analytics:read')

  useEffect(() => {
    if (admin?.type === 'VENDOR' && !canViewVendorOverview) {
      router.replace('/orders')
    }
  }, [admin, canViewVendorOverview, router])

  if (admin?.type === 'BUSINESS') return <BusinessOverviewPage />
  if (admin?.type === 'VENDOR') {
    if (!canViewVendorOverview) return null
    return <VendorOverviewPage />
  }
  return <SystemOverviewPage />
}
