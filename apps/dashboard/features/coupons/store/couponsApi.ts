import { api } from '@/store/baseApi'
import type {
  Promotion,
  PromotionDetail,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from '@/types/api'

type Wrap<T> = { success: boolean; data: T }

export const couponsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listPromotions: build.query<Promotion[], void>({
      query: () => '/admin/promotions',
      providesTags: ['Promotion'],
      transformResponse: (res: Wrap<Promotion[]>) => res.data,
    }),

    getPromotion: build.query<PromotionDetail, string>({
      query: (id) => `/admin/promotions/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Promotion', id }],
      transformResponse: (res: Wrap<PromotionDetail>) => res.data,
    }),

    createPromotion: build.mutation<Promotion, CreatePromotionRequest>({
      query: (body) => ({ url: '/admin/promotions', method: 'POST', body }),
      invalidatesTags: ['Promotion'],
      transformResponse: (res: Wrap<Promotion>) => res.data,
    }),

    updatePromotion: build.mutation<Promotion, { id: string; body: UpdatePromotionRequest }>({
      query: ({ id, body }) => ({ url: `/admin/promotions/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => ['Promotion', { type: 'Promotion', id }],
      transformResponse: (res: Wrap<Promotion>) => res.data,
    }),

    deletePromotion: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/promotions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Promotion'],
    }),
  }),
})

export const {
  useListPromotionsQuery,
  useGetPromotionQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} = couponsApi
