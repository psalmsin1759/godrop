import { api } from '@/store/baseApi'
import type {
  ParcelVehicleType,
  CreateParcelVehicleTypeRequest,
  UpdateParcelVehicleTypeRequest,
  Order,
  Pagination,
  ParcelOrdersParams,
  OrderStatus,
} from '@/types/api'

interface ParcelVehicleTypesResponse {
  success: boolean
  types: ParcelVehicleType[]
}

interface ParcelVehicleTypeResponse {
  success: boolean
  type: ParcelVehicleType
}

interface ParcelOrdersResponse {
  success: boolean
  data: Order[]
  meta: Pagination
}

export const parcelsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdminParcelVehicleTypes: build.query<ParcelVehicleType[], void>({
      query: () => '/parcel/admin/vehicle-types',
      providesTags: ['ParcelVehicleType'],
      transformResponse: (res: ParcelVehicleTypesResponse) => res.types,
    }),

    createParcelVehicleType: build.mutation<ParcelVehicleType, CreateParcelVehicleTypeRequest>({
      query: (body) => ({ url: '/parcel/vehicle-types', method: 'POST', body }),
      invalidatesTags: ['ParcelVehicleType'],
      transformResponse: (res: ParcelVehicleTypeResponse) => res.type,
    }),

    updateParcelVehicleType: build.mutation<ParcelVehicleType, { id: string } & UpdateParcelVehicleTypeRequest>({
      query: ({ id, ...body }) => ({ url: `/parcel/vehicle-types/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['ParcelVehicleType'],
      transformResponse: (res: ParcelVehicleTypeResponse) => res.type,
    }),

    deleteParcelVehicleType: build.mutation<void, string>({
      query: (id) => ({ url: `/parcel/vehicle-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ParcelVehicleType'],
    }),

    getParcelOrders: build.query<{ data: Order[]; meta: Pagination }, ParcelOrdersParams>({
      query: ({ page = 1, limit = 15, status }: ParcelOrdersParams = {}) => ({
        url: '/admin/orders',
        params: { type: 'PARCEL', page, limit, ...(status ? { status } : {}) },
      }),
      providesTags: ['ParcelOrder'],
      transformResponse: (res: ParcelOrdersResponse) => ({ data: res.data, meta: res.meta }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAdminParcelVehicleTypesQuery,
  useCreateParcelVehicleTypeMutation,
  useUpdateParcelVehicleTypeMutation,
  useDeleteParcelVehicleTypeMutation,
  useGetParcelOrdersQuery,
} = parcelsApi
