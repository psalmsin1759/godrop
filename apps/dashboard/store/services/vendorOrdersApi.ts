import { api } from '@/store/baseApi'
import type { VendorOrder, VendorOrdersListParams, VendorOrdersListResponse } from '@/types/api'

type Wrap<T> = { success: boolean; data: T }

export const vendorOrdersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getVendorOrders: build.query<VendorOrdersListResponse, VendorOrdersListParams | void>({
      query: (params) => ({
        url: '/vendor-admin/orders',
        params: params ?? {},
      }),
      providesTags: ['VendorOrder'],
    }),

    getVendorOrder: build.query<VendorOrder, string>({
      query: (id) => `/vendor-admin/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'VendorOrder', id }],
      transformResponse: (res: Wrap<VendorOrder>) => res.data,
    }),

    acceptVendorOrder: build.mutation<VendorOrder, string>({
      query: (id) => ({ url: `/vendor-admin/orders/${id}/accept`, method: 'PATCH' }),
      invalidatesTags: ['VendorOrder'],
      transformResponse: (res: Wrap<VendorOrder>) => res.data,
    }),

    markPreparingVendorOrder: build.mutation<VendorOrder, string>({
      query: (id) => ({ url: `/vendor-admin/orders/${id}/preparing`, method: 'PATCH' }),
      invalidatesTags: ['VendorOrder'],
      transformResponse: (res: Wrap<VendorOrder>) => res.data,
    }),

    markReadyVendorOrder: build.mutation<VendorOrder, string>({
      query: (id) => ({ url: `/vendor-admin/orders/${id}/ready`, method: 'PATCH' }),
      invalidatesTags: ['VendorOrder'],
      transformResponse: (res: Wrap<VendorOrder>) => res.data,
    }),

    rejectVendorOrder: build.mutation<VendorOrder, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/vendor-admin/orders/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['VendorOrder'],
      transformResponse: (res: Wrap<VendorOrder>) => res.data,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVendorOrdersQuery,
  useGetVendorOrderQuery,
  useAcceptVendorOrderMutation,
  useMarkPreparingVendorOrderMutation,
  useMarkReadyVendorOrderMutation,
  useRejectVendorOrderMutation,
} = vendorOrdersApi
