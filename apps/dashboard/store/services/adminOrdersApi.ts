import { api } from '@/store/baseApi'
import type { AdminOrder, AdminOrdersListParams, AdminOrdersListResponse } from '@/types/api'

type Wrap<T> = { success: boolean; data: T }

export const adminOrdersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdminOrders: build.query<AdminOrdersListResponse, AdminOrdersListParams | void>({
      query: (params) => ({
        url: '/admin/orders',
        params: params ?? {},
      }),
      providesTags: ['AdminOrder'],
    }),

    getAdminOrder: build.query<AdminOrder, string>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'AdminOrder', id }],
      transformResponse: (res: Wrap<AdminOrder>) => res.data,
    }),

    cancelAdminOrder: build.mutation<AdminOrder, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/orders/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['AdminOrder'],
      transformResponse: (res: Wrap<AdminOrder>) => res.data,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useCancelAdminOrderMutation,
} = adminOrdersApi
