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

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface VendorWithdrawal {
  id: string
  vendorId: string
  amountKobo: number
  bankName: string
  bankCode: string
  accountNumber: string
  accountName: string
  reference: string | null
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  notes: string | null
  processedAt: string | null
  createdAt: string
}

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

    getVendorWalletBalance: build.query<{ balanceKobo: number }, string>({
      query: (id) => `/admin/vendors/${id}/wallet`,
    }),

    getVendorWithdrawals: build.query<{ data: VendorWithdrawal[]; meta: Pagination }, { id: string; page?: number; limit?: number }>({
      query: ({ id, page = 1, limit = 20 }) => ({
        url: `/admin/vendors/${id}/withdrawals`,
        params: { page, limit },
      }),
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
  useGetVendorWalletBalanceQuery,
  useGetVendorWithdrawalsQuery,
} = vendorsApi
