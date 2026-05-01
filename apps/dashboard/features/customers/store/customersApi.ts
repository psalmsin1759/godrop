import { api } from '@/store/baseApi'
import type {
  AdminCustomer,
  AdminCustomerDetail,
  AdminWallet,
  AdminWalletTransaction,
  AdminOrder,
  CustomerStatus,
  CustomersListParams,
  CustomerWalletTransactionsParams,
  Pagination,
} from '@/types/api'

type Wrap<T> = { success: boolean; data: T }
type Paginated<T> = { success: boolean; data: T[]; meta: Pagination }

export const customersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<{ data: AdminCustomer[]; meta: Pagination }, CustomersListParams | void>({
      query: (params) => ({ url: '/admin/customers', params: params ?? {} }),
      providesTags: ['Customer'],
      transformResponse: (res: Paginated<AdminCustomer>) => ({ data: res.data, meta: res.meta }),
    }),

    getCustomer: build.query<AdminCustomerDetail, string>({
      query: (id) => `/admin/customers/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Customer', id }],
      transformResponse: (res: Wrap<AdminCustomerDetail>) => res.data,
    }),

    getCustomerOrders: build.query<{ data: AdminOrder[]; meta: Pagination }, { id: string; page?: number; limit?: number; status?: string }>({
      query: ({ id, ...params }) => ({ url: `/admin/customers/${id}/orders`, params }),
      providesTags: (_r, _e, { id }) => [{ type: 'Customer', id }],
      transformResponse: (res: Paginated<AdminOrder>) => ({ data: res.data, meta: res.meta }),
    }),

    getCustomerWallet: build.query<AdminWallet | null, string>({
      query: (id) => `/admin/customers/${id}/wallet`,
      providesTags: (_r, _e, id) => [{ type: 'Customer', id }],
      transformResponse: (res: Wrap<AdminWallet | null>) => res.data,
    }),

    getCustomerWalletTransactions: build.query<{ data: AdminWalletTransaction[]; meta: Pagination }, { id: string } & CustomerWalletTransactionsParams>({
      query: ({ id, ...params }) => ({ url: `/admin/customers/${id}/wallet/transactions`, params }),
      providesTags: (_r, _e, { id }) => [{ type: 'Customer', id }],
      transformResponse: (res: Paginated<AdminWalletTransaction>) => ({ data: res.data, meta: res.meta }),
    }),

    updateCustomerStatus: build.mutation<AdminCustomerDetail, { id: string; status: CustomerStatus }>({
      query: ({ id, status }) => ({ url: `/admin/customers/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useGetCustomerOrdersQuery,
  useGetCustomerWalletQuery,
  useGetCustomerWalletTransactionsQuery,
  useUpdateCustomerStatusMutation,
} = customersApi
