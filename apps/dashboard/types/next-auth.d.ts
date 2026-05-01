import type { AdminUser } from './api'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    admin: AdminUser
  }
  interface User {
    id: string
    email: string
    accessToken: string
    admin: AdminUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    admin: AdminUser
  }
}
