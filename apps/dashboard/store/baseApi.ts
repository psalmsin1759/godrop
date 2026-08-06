import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { signOut } from 'next-auth/react'
import type { RootState } from './index'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'https://api.naijagodrop.com/api/v1',
  prepareHeaders(headers, { getState }) {
    const token = (getState() as RootState).auth.token
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  },
})

// Every endpoint here is only ever called once signed in, so a 401 means the
// session has expired or been revoked server-side — sign out and send the
// user back to /login rather than leaving the UI stuck on a failed request.
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    await signOut({ callbackUrl: '/login' })
  }
  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Vendor', 'Admin', 'AuditLog', 'ProductCategory', 'Product', 'VendorOrder', 'AdminOrder', 'TeamMember', 'VendorSettings', 'Analytics', 'TruckType', 'TruckOrder', 'TruckPricing', 'Customer', 'VendorAdminSettings', 'SystemAdminSettings', 'Rider', 'Notification', 'ParcelVehicleType', 'ParcelOrder', 'PlatformSettings', 'VendorWallet', 'Hero', 'Business', 'BusinessMember', 'BusinessWallet', 'Banner', 'Promotion', 'Dispute'],
  endpoints: () => ({}),
})
