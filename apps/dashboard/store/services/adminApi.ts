import { api } from '../baseApi'
import type {
  AdminUser,
  LoginRequest,
  LoginResponse,
  CreateAdminRequest,
  UpdateAdminRequest,
} from '@/types/api'


type Wrap<T> = { success: boolean; data: T }

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/admin/login', method: 'POST', body }),
      transformResponse: (res: Wrap<LoginResponse>) => res.data,
    }),

    getMe: build.query<AdminUser, void>({
      query: () => '/admin/me',
      transformResponse: (res: Wrap<AdminUser>) => res.data,
    }),

    getAdmins: build.query<AdminUser[], void>({
      query: () => '/admin/admins',
      providesTags: ['Admin'],
      transformResponse: (res: Wrap<AdminUser[]>) => res.data,
    }),

    createAdmin: build.mutation<AdminUser, CreateAdminRequest>({
      query: (body) => ({ url: '/admin/admins', method: 'POST', body }),
      invalidatesTags: ['Admin'],
      transformResponse: (res: Wrap<AdminUser>) => res.data,
    }),

    updateAdmin: build.mutation<AdminUser, { id: string; body: UpdateAdminRequest }>({
      query: ({ id, body }) => ({ url: `/admin/admins/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin'],
      transformResponse: (res: Wrap<AdminUser>) => res.data,
    }),
  }),
  overrideExisting: false,
})

export const {
  useLoginMutation,
  useGetMeQuery,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
} = adminApi
