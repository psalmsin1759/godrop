import { api } from '../baseApi'
import type {
  Business,
  BusinessMember,
  BusinessWalletTransaction,
  BusinessesListParams,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  CreateBusinessOwnerRequest,
  CreateBusinessMemberRequest,
  UpdateBusinessMemberRequest,
  BusinessDocumentField,
  Rider,
  RidersListMeta,
  RiderOrderSummary,
} from '@/types/api'

type Wrap<T> = { success: boolean; data: T }
type WrapMeta<T> = { success: boolean; data: T; meta: RidersListMeta }

export const businessApi = api.injectEndpoints({
  endpoints: (build) => ({

    // ─── System Admin: Business CRUD ────────────────────────────
    getBusinesses: build.query<{ data: Business[]; meta: RidersListMeta }, BusinessesListParams>({
      query: (params = {}) => ({ url: '/admin/businesses', params }),
      providesTags: ['Business'],
      transformResponse: (res: WrapMeta<Business[]>) => ({ data: res.data ?? [], meta: res.meta }),
    }),

    createBusiness: build.mutation<Business, FormData>({
      queryFn: async (formData, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({ url: '/admin/businesses', method: 'POST', body: formData })
        if (result.error) return { error: result.error }
        return { data: (result.data as Wrap<Business>).data }
      },
      invalidatesTags: ['Business'],
    }),

    getBusiness: build.query<Business, string>({
      query: (id) => `/admin/businesses/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Business', id }],
      transformResponse: (res: Wrap<Business>) => res.data,
    }),

    updateBusiness: build.mutation<Business, { id: string; body: Partial<CreateBusinessRequest & { status: string }> }>({
      query: ({ id, body }) => ({ url: `/admin/businesses/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => ['Business', { type: 'Business', id }],
      transformResponse: (res: Wrap<Business>) => res.data,
    }),

    createBusinessOwner: build.mutation<unknown, { id: string; body: CreateBusinessOwnerRequest }>({
      query: ({ id, body }) => ({ url: `/admin/businesses/${id}/owner`, method: 'POST', body }),
      invalidatesTags: ['Business'],
    }),

    // ─── Business Admin: Riders ──────────────────────────────────
    getBusinessRiders: build.query<{ data: Rider[]; meta: RidersListMeta }, { search?: string; page?: number; limit?: number }>({
      query: (params = {}) => ({ url: '/business-admin/riders', params }),
      providesTags: ['Rider'],
      transformResponse: (res: WrapMeta<Rider[]>) => ({ data: res.data ?? [], meta: res.meta }),
    }),

    assignBusinessRider: build.mutation<unknown, string>({
      query: (riderId) => ({ url: `/business-admin/riders/${riderId}/assign`, method: 'POST' }),
      invalidatesTags: ['Rider'],
    }),

    removeBusinessRider: build.mutation<unknown, string>({
      query: (riderId) => ({ url: `/business-admin/riders/${riderId}`, method: 'DELETE' }),
      invalidatesTags: ['Rider'],
    }),

    getBusinessRiderOrders: build.query<{ data: RiderOrderSummary[]; meta: RidersListMeta }, { riderId: string; page?: number; limit?: number }>({
      query: ({ riderId, ...params }) => ({ url: `/business-admin/riders/${riderId}/orders`, params }),
      transformResponse: (res: WrapMeta<RiderOrderSummary[]>) => ({ data: res.data ?? [], meta: res.meta }),
    }),

    // ─── Business Admin: Wallet ──────────────────────────────────
    getBusinessWallet: build.query<{ id: string; balanceKobo: number }, void>({
      query: () => '/business-admin/wallet',
      providesTags: ['BusinessWallet'],
      transformResponse: (res: Wrap<{ id: string; balanceKobo: number }>) => res.data,
    }),

    getBusinessWalletTransactions: build.query<{ data: BusinessWalletTransaction[]; meta: RidersListMeta }, { page?: number; limit?: number }>({
      query: (params = {}) => ({ url: '/business-admin/wallet/transactions', params }),
      providesTags: ['BusinessWallet'],
      transformResponse: (res: WrapMeta<BusinessWalletTransaction[]>) => ({ data: res.data ?? [], meta: res.meta }),
    }),

    // ─── Business Admin: Team ────────────────────────────────────
    getBusinessTeam: build.query<BusinessMember[], void>({
      query: () => '/business-admin/team',
      providesTags: ['BusinessMember'],
      transformResponse: (res: Wrap<BusinessMember[]>) => res.data ?? [],
    }),

    createBusinessMember: build.mutation<BusinessMember, CreateBusinessMemberRequest>({
      query: (body) => ({ url: '/business-admin/team', method: 'POST', body }),
      invalidatesTags: ['BusinessMember'],
      transformResponse: (res: Wrap<BusinessMember>) => res.data,
    }),

    updateBusinessMember: build.mutation<BusinessMember, { memberId: string; body: UpdateBusinessMemberRequest }>({
      query: ({ memberId, body }) => ({ url: `/business-admin/team/${memberId}`, method: 'PATCH', body }),
      invalidatesTags: ['BusinessMember'],
      transformResponse: (res: Wrap<BusinessMember>) => res.data,
    }),

    // ─── Business Admin: My Business ────────────────────────────
    getMyBusiness: build.query<Business, void>({
      query: () => '/business-admin/business',
      providesTags: ['Business'],
      transformResponse: (res: Wrap<Business>) => res.data,
    }),

    updateMyBusiness: build.mutation<Business, UpdateBusinessRequest>({
      query: (body) => ({ url: '/business-admin/business', method: 'PATCH', body }),
      invalidatesTags: ['Business'],
      transformResponse: (res: Wrap<Business>) => res.data,
    }),

    uploadBusinessDocument: build.mutation<unknown, { field: BusinessDocumentField; file: File }>({
      queryFn: async ({ field, file }, _api, _extraOptions, baseQuery) => {
        const formData = new FormData()
        formData.append('file', file)
        return baseQuery({ url: `/business-admin/business/documents/${field}`, method: 'POST', body: formData })
      },
      invalidatesTags: ['Business'],
    }),

  }),
})

export const {
  useGetBusinessesQuery,
  useCreateBusinessMutation,
  useGetBusinessQuery,
  useUpdateBusinessMutation,
  useCreateBusinessOwnerMutation,
  useGetBusinessRidersQuery,
  useAssignBusinessRiderMutation,
  useRemoveBusinessRiderMutation,
  useGetBusinessRiderOrdersQuery,
  useGetBusinessWalletQuery,
  useGetBusinessWalletTransactionsQuery,
  useGetBusinessTeamQuery,
  useCreateBusinessMemberMutation,
  useUpdateBusinessMemberMutation,
  useGetMyBusinessQuery,
  useUpdateMyBusinessMutation,
  useUploadBusinessDocumentMutation,
} = businessApi
