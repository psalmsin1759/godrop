import { api } from '../baseApi'
import type {
  Rider,
  RiderDetail,
  RiderKycStatus,
  CreateRiderRequest,
  UpdateRiderRequest,
  RidersListParams,
  RidersListMeta,
  RiderStats,
  AvailableRider,
  RiderOrderSummary,
  RiderOrdersParams,
  RiderEarning,
  RiderEarningsResponse,
  RiderWithdrawal,
  OrderStatus,
} from '@/types/api'

type Wrap<T> = { success: boolean; data: T }
type WrapMeta<T> = { success: boolean; data: T; meta: RidersListMeta }

export const ridersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRiders: build.query<{ data: Rider[]; meta: RidersListMeta }, RidersListParams>({
      query: (params = {}) => ({ url: '/admin/riders', params }),
      providesTags: ['Rider'],
      transformResponse: (res: WrapMeta<Rider[]>) => ({ data: res.data ?? [], meta: res.meta }),
    }),

    getRider: build.query<RiderDetail, string>({
      query: (id) => `/admin/riders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Rider', id }],
      transformResponse: (res: Wrap<RiderDetail>) => res.data,
    }),

    getRiderStats: build.query<RiderStats, void>({
      query: () => '/admin/riders/stats',
      providesTags: ['Rider'],
      transformResponse: (res: Wrap<RiderStats>) => res.data,
    }),

    getAvailableRiders: build.query<AvailableRider[], { lat?: number; lng?: number } | void>({
      query: (params) => ({ url: '/admin/riders/available', params: params ?? {} }),
      providesTags: ['Rider'],
      transformResponse: (res: Wrap<AvailableRider[]>) => res.data ?? [],
    }),

    getRiderOrders: build.query<{ data: RiderOrderSummary[]; meta: RidersListMeta }, { id: string } & RiderOrdersParams>({
      query: ({ id, ...params }) => ({ url: `/admin/riders/${id}/orders`, params }),
      providesTags: (_r, _e, { id }) => [{ type: 'Rider', id }],
      transformResponse: (res: WrapMeta<RiderOrderSummary[]>) => ({ data: res.data ?? [], meta: res.meta }),
    }),

    getRiderEarnings: build.query<RiderEarningsResponse, { id: string; page?: number; limit?: number }>({
      query: ({ id, ...params }) => ({ url: `/admin/riders/${id}/earnings`, params }),
      providesTags: (_r, _e, { id }) => [{ type: 'Rider', id }],
      transformResponse: (res: { success: boolean; data: RiderEarning[]; meta: RidersListMeta; totalEarnedKobo: number }) => ({
        data: res.data ?? [],
        meta: res.meta,
        totalEarnedKobo: res.totalEarnedKobo ?? 0,
      }),
    }),

    processWithdrawal: build.mutation<RiderWithdrawal, { riderId: string; withdrawalId: string; action: 'approve' | 'reject'; notes?: string }>({
      query: ({ riderId, withdrawalId, action, notes }) => ({
        url: `/admin/riders/${riderId}/withdrawals/${withdrawalId}`,
        method: 'PATCH',
        body: { action, notes },
      }),
      invalidatesTags: (_r, _e, { riderId }) => [{ type: 'Rider', id: riderId }, 'Rider'],
      transformResponse: (res: Wrap<RiderWithdrawal>) => res.data,
    }),

    createRider: build.mutation<RiderDetail, CreateRiderRequest>({
      query: (body) => ({ url: '/admin/riders', method: 'POST', body }),
      invalidatesTags: ['Rider'],
      transformResponse: (res: Wrap<RiderDetail>) => res.data,
    }),

    updateRider: build.mutation<RiderDetail, { id: string; body: UpdateRiderRequest }>({
      query: ({ id, body }) => ({ url: `/admin/riders/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Rider', id }, 'Rider'],
      transformResponse: (res: Wrap<RiderDetail>) => res.data,
    }),

    updateRiderKyc: build.mutation<RiderDetail, { id: string; status: RiderKycStatus; notes?: string }>({
      query: ({ id, status, notes }) => ({
        url: `/admin/riders/${id}/kyc`,
        method: 'PATCH',
        body: { status, notes },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Rider', id }, 'Rider'],
      transformResponse: (res: Wrap<RiderDetail>) => res.data,
    }),

    toggleRiderActive: build.mutation<RiderDetail, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/riders/${id}/toggle-active`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Rider', id }, 'Rider'],
      transformResponse: (res: Wrap<RiderDetail>) => res.data,
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetRidersQuery,
  useGetRiderQuery,
  useGetRiderStatsQuery,
  useGetAvailableRidersQuery,
  useGetRiderOrdersQuery,
  useGetRiderEarningsQuery,
  useProcessWithdrawalMutation,
  useCreateRiderMutation,
  useUpdateRiderMutation,
  useUpdateRiderKycMutation,
  useToggleRiderActiveMutation,
} = ridersApi
