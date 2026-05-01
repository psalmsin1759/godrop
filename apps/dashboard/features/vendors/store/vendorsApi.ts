import { api } from '@/store/baseApi'
import type { Vendor } from '@/types/api'

interface VendorListRaw {
  success: boolean
  data: Vendor[]
  total: number
  page: number
  limit: number
}

type Wrap<T> = { success: boolean; data: T }

export const vendorsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getVendors: build.query<Vendor[], void>({
      query: () => '/admin/vendors',
      providesTags: ['Vendor'],
      transformResponse: (res: VendorListRaw) => res.data,
    }),

    getVendor: build.query<Vendor, string>({
      query: (id) => `/admin/vendors/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Vendor', id }],
      transformResponse: (res: Wrap<Vendor>) => res.data,
    }),

    approveVendor: build.mutation<Vendor, string>({
      query: (id) => ({ url: `/admin/vendors/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['Vendor'],
      transformResponse: (res: Wrap<Vendor>) => res.data,
    }),

    rejectVendor: build.mutation<Vendor, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/vendors/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Vendor'],
      transformResponse: (res: Wrap<Vendor>) => res.data,
    }),

    suspendVendor: build.mutation<Vendor, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/vendors/${id}/suspend`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Vendor'],
      transformResponse: (res: Wrap<Vendor>) => res.data,
    }),

    reinstateVendor: build.mutation<Vendor, string>({
      query: (id) => ({ url: `/admin/vendors/${id}/reinstate`, method: 'PATCH' }),
      invalidatesTags: ['Vendor'],
      transformResponse: (res: Wrap<Vendor>) => res.data,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVendorsQuery,
  useGetVendorQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useSuspendVendorMutation,
  useReinstateVendorMutation,
} = vendorsApi
