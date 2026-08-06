import { api } from '../baseApi'
import type {
  Dispute,
  DisputeDetail,
  DisputeMessage,
  DisputesListParams,
  DisputesListMeta,
  DisputeStatus,
  ResolveDisputeRequest,
} from '@/types/api'

type Wrap<T> = { success: boolean; data: T }
type WrapMeta<T> = { success: boolean; data: T; meta: DisputesListMeta }

export const disputesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDisputes: build.query<{ data: Dispute[]; meta: DisputesListMeta }, DisputesListParams>({
      query: (params = {}) => ({ url: '/admin/disputes', params }),
      providesTags: ['Dispute'],
      transformResponse: (res: WrapMeta<Dispute[]>) => ({ data: res.data ?? [], meta: res.meta }),
    }),

    getDispute: build.query<DisputeDetail, string>({
      query: (id) => `/admin/disputes/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Dispute', id }],
      transformResponse: (res: Wrap<DisputeDetail>) => res.data,
    }),

    addDisputeMessage: build.mutation<DisputeMessage, { id: string; message: string; isInternal?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/admin/disputes/${id}/messages`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Dispute', id }, 'Dispute'],
      transformResponse: (res: Wrap<DisputeMessage>) => res.data,
    }),

    assignDispute: build.mutation<Dispute, { id: string; adminId?: string }>({
      query: ({ id, adminId }) => ({ url: `/admin/disputes/${id}/assign`, method: 'PATCH', body: { adminId } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Dispute', id }, 'Dispute'],
      transformResponse: (res: Wrap<Dispute>) => res.data,
    }),

    updateDisputeStatus: build.mutation<Dispute, { id: string; status: DisputeStatus }>({
      query: ({ id, status }) => ({ url: `/admin/disputes/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Dispute', id }, 'Dispute'],
      transformResponse: (res: Wrap<Dispute>) => res.data,
    }),

    resolveDispute: build.mutation<Dispute, { id: string } & ResolveDisputeRequest>({
      query: ({ id, ...body }) => ({ url: `/admin/disputes/${id}/resolve`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Dispute', id }, 'Dispute'],
      transformResponse: (res: Wrap<Dispute>) => res.data,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetDisputesQuery,
  useGetDisputeQuery,
  useAddDisputeMessageMutation,
  useAssignDisputeMutation,
  useUpdateDisputeStatusMutation,
  useResolveDisputeMutation,
} = disputesApi
