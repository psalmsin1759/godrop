'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials, clearCredentials } from '@/store/slices/authSlice'

export default function AuthSync() {
  const { data: session, status } = useSession()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      dispatch(setCredentials({ token: session.accessToken, admin: session.admin }))
    } else if (status === 'unauthenticated') {
      dispatch(clearCredentials())
    }
  }, [status, session, dispatch])

  return null
}
