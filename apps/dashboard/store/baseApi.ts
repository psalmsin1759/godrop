import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './index'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  prepareHeaders(headers, { getState }) {
    const token = (getState() as RootState).auth.token
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  },
})

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Vendor', 'Admin', 'AuditLog', 'ProductCategory', 'Product', 'VendorOrder', 'AdminOrder', 'TeamMember', 'VendorSettings', 'Analytics', 'TruckType', 'TruckOrder', 'TruckPricing', 'Customer', 'VendorAdminSettings', 'SystemAdminSettings', 'Rider', 'Notification', 'ParcelVehicleType', 'ParcelOrder', 'PlatformSettings'],
  endpoints: () => ({}),
})
