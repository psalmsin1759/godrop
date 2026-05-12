import { api } from '../baseApi'
import type {
  AdminUser,
  LoginRequest,
  LoginResponse,
  CreateAdminRequest,
  UpdateAdminRequest,
  UpdateAdminEmailPrefsRequest,
  SystemAdminSettings,
  UpdateSystemAdminSettingsRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  PlatformSettings,
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

    updateProfile: build.mutation<AdminUser, UpdateProfileRequest>({
      query: (body) => ({ url: '/admin/me/profile', method: 'PATCH', body }),
      transformResponse: (res: Wrap<AdminUser>) => res.data,
    }),

    changePassword: build.mutation<{ message: string }, ChangePasswordRequest>({
      query: (body) => ({ url: '/admin/me/change-password', method: 'POST', body }),
      transformResponse: (res: { success: boolean; message: string }) => ({ message: res.message }),
    }),

    getSystemAdminSettings: build.query<SystemAdminSettings, void>({
      query: () => '/admin/me/settings',
      providesTags: ['SystemAdminSettings'],
      transformResponse: (res: Wrap<SystemAdminSettings>) => res.data,
    }),

    updateSystemAdminSettings: build.mutation<SystemAdminSettings, UpdateSystemAdminSettingsRequest>({
      query: (body) => ({ url: '/admin/me/settings', method: 'PATCH', body }),
      invalidatesTags: ['SystemAdminSettings'],
      transformResponse: (res: Wrap<SystemAdminSettings>) => res.data,
    }),

    getPlatformSettings: build.query<PlatformSettings, void>({
      query: () => '/admin/platform-settings',
      providesTags: ['PlatformSettings'],
      transformResponse: (res: Wrap<PlatformSettings>) => res.data,
    }),

    updatePlatformSettings: build.mutation<PlatformSettings, Partial<Pick<PlatformSettings, 'riderEarningRate' | 'coverageRadiusKm'>>>({
      query: (body) => ({ url: '/admin/platform-settings', method: 'PATCH', body }),
      invalidatesTags: ['PlatformSettings'],
      transformResponse: (res: Wrap<PlatformSettings>) => res.data,
    }),

    getAdmins: build.query<{ data: AdminUser[]; total: number; page: number; limit: number }, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/admin/admins', params: params ?? {} }),
      providesTags: ['Admin'],
      transformResponse: (res: { success: boolean; data: AdminUser[]; total: number; page: number; limit: number }) => ({
        data: res.data ?? [],
        total: res.total ?? 0,
        page: res.page ?? 1,
        limit: res.limit ?? 20,
      }),
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

    updateAdminEmailPrefs: build.mutation<AdminUser, { id: string; body: UpdateAdminEmailPrefsRequest }>({
      query: ({ id, body }) => ({ url: `/admin/admins/${id}/email-prefs`, method: 'PATCH', body }),
      invalidatesTags: ['Admin'],
      transformResponse: (res: Wrap<AdminUser>) => res.data,
    }),
  }),
  overrideExisting: false,
})

export const {
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetSystemAdminSettingsQuery,
  useUpdateSystemAdminSettingsMutation,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useUpdateAdminEmailPrefsMutation,
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} = adminApi
