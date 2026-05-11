'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SystemOverviewPage from '@/features/dashboard/SystemOverviewPage'
import VendorOverviewPage from '@/features/dashboard/VendorOverviewPage'

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const admin = session?.admin

  useEffect(() => {
    if (admin?.type === 'VENDOR' && admin?.role === 'STAFF') {
      router.replace('/orders')
    }
  }, [admin, router])

  if (admin?.type === 'VENDOR') {
    if (admin?.role === 'STAFF') return null
    return <VendorOverviewPage />
  }
  return <SystemOverviewPage />
}
