'use client'

import { SessionProvider } from 'next-auth/react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import AuthSync from './AuthSync'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <AuthSync />
        {children}
      </Provider>
    </SessionProvider>
  )
}
