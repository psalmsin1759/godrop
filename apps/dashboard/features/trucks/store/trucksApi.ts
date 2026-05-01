import { api } from '@/store/baseApi'
import type {
  TruckType,
  CreateTruckTypeRequest,
  UpdateTruckTypeRequest,
  ApartmentType,
  CreateApartmentTypeRequest,
  UpdateApartmentTypeRequest,
  TruckPricingConfig,
  TruckPricingSummary,
  Order,
  Pagination,
  TruckOrdersParams,
  AdminOrder,
  OrderStatus,
} from '@/types/api'

interface TruckTypesResponse {
  success: boolean
  types: TruckType[]
}

interface TruckTypeResponse {
  success: boolean
  truckType: TruckType
}

interface TruckOrdersResponse {
  success: boolean
  data: Order[]
  meta: Pagination
}

interface AdminOrderResponse {
  success: boolean
  data: AdminOrder
}

interface ApartmentTypesResponse {
  success: boolean
  types: ApartmentType[]
}

interface ApartmentTypeResponse {
  success: boolean
  type: ApartmentType
}

interface PricingConfigResponse {
  success: boolean
  config: TruckPricingConfig
}

export const trucksApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTruckTypes: build.query<TruckType[], void>({
      query: () => '/truck/types',
      providesTags: ['TruckType'],
      transformResponse: (res: TruckTypesResponse) => res.types,
    }),

    createTruckType: build.mutation<TruckType, CreateTruckTypeRequest>({
      query: (body) => ({ url: '/truck/types', method: 'POST', body }),
      invalidatesTags: ['TruckType'],
      transformResponse: (res: TruckTypeResponse) => res.truckType,
    }),

    updateTruckType: build.mutation<TruckType, { id: string } & UpdateTruckTypeRequest>({
      query: ({ id, ...body }) => ({ url: `/truck/types/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['TruckType'],
      transformResponse: (res: TruckTypeResponse) => res.truckType,
    }),

    deleteTruckType: build.mutation<void, string>({
      query: (id) => ({ url: `/truck/types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TruckType'],
    }),


    getAdminOrder: build.query<AdminOrder, string>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'TruckOrder', id }],
      transformResponse: (res: AdminOrderResponse) => res.data,
    }),

    updateOrderStatus: build.mutation<AdminOrder, { id: string; status: OrderStatus; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/orders/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'TruckOrder', id }, 'TruckOrder'],
      transformResponse: (res: AdminOrderResponse) => res.data,
    }),

    getTruckOrders: build.query<{ data: Order[]; meta: Pagination }, TruckOrdersParams>({
      query: ({ page = 1, limit = 15, status } = {}) => ({
        url: '/admin/orders',
        params: { type: 'TRUCK', page, limit, ...(status ? { status } : {}) },
      }),
      providesTags: ['TruckOrder'],
      transformResponse: (res: TruckOrdersResponse) => ({ data: res.data, meta: res.meta }),
    }),

    // ─── Pricing ────────────────────────────────────────────────────────────

    getTruckPricing: build.query<TruckPricingSummary, void>({
      query: () => '/truck/pricing',
      providesTags: ['TruckPricing'],
      transformResponse: (res: TruckPricingSummary & { success: boolean }) => ({
        apartmentTypes: res.apartmentTypes,
        perKmKobo: res.perKmKobo,
        perLoaderKobo: res.perLoaderKobo,
      }),
    }),

    getAdminApartmentTypes: build.query<ApartmentType[], void>({
      query: () => '/truck/admin/apartment-types',
      providesTags: ['TruckPricing'],
      transformResponse: (res: ApartmentTypesResponse) => res.types,
    }),

    createApartmentType: build.mutation<ApartmentType, CreateApartmentTypeRequest>({
      query: (body) => ({ url: '/truck/apartment-types', method: 'POST', body }),
      invalidatesTags: ['TruckPricing'],
      transformResponse: (res: ApartmentTypeResponse) => res.type,
    }),

    updateApartmentType: build.mutation<ApartmentType, { id: string } & UpdateApartmentTypeRequest>({
      query: ({ id, ...body }) => ({ url: `/truck/apartment-types/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['TruckPricing'],
      transformResponse: (res: ApartmentTypeResponse) => res.type,
    }),

    deleteApartmentType: build.mutation<void, string>({
      query: (id) => ({ url: `/truck/apartment-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TruckPricing'],
    }),

    updatePerKmRate: build.mutation<TruckPricingConfig, { perKmKobo: number }>({
      query: (body) => ({ url: '/truck/pricing/per-km', method: 'PUT', body }),
      invalidatesTags: ['TruckPricing'],
      transformResponse: (res: PricingConfigResponse) => res.config,
    }),

    updatePerLoaderRate: build.mutation<TruckPricingConfig, { perLoaderKobo: number }>({
      query: (body) => ({ url: '/truck/pricing/per-loader', method: 'PUT', body }),
      invalidatesTags: ['TruckPricing'],
      transformResponse: (res: PricingConfigResponse) => res.config,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTruckTypesQuery,
  useCreateTruckTypeMutation,
  useUpdateTruckTypeMutation,
  useDeleteTruckTypeMutation,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
  useGetTruckOrdersQuery,
  useGetTruckPricingQuery,
  useGetAdminApartmentTypesQuery,
  useCreateApartmentTypeMutation,
  useUpdateApartmentTypeMutation,
  useDeleteApartmentTypeMutation,
  useUpdatePerKmRateMutation,
  useUpdatePerLoaderRateMutation,
} = trucksApi
