import { api } from '@/store/baseApi'
import type {
  TeamMember,
  InviteTeamMemberRequest,
  VendorSettings,
  UpdateVendorSettingsRequest,
  VendorAdminSettings,
  UpdateVendorAdminSettingsRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AdminUser,
} from '@/types/api'

type Wrap<T> = { success: boolean; data: T }

export const teamApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTeamMembers: build.query<TeamMember[], void>({
      query: () => '/vendor-admin/team',
      providesTags: ['TeamMember'],
      transformResponse: (res: Wrap<TeamMember[]>) => res.data,
    }),

    inviteTeamMember: build.mutation<TeamMember, InviteTeamMemberRequest>({
      query: (body) => ({ url: '/vendor-admin/team', method: 'POST', body }),
      invalidatesTags: ['TeamMember'],
      transformResponse: (res: Wrap<TeamMember>) => res.data,
    }),

    updateTeamMemberRole: build.mutation<TeamMember, { memberId: string; role: 'MANAGER' | 'STAFF' }>({
      query: ({ memberId, role }) => ({
        url: `/vendor-admin/team/${memberId}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['TeamMember'],
      transformResponse: (res: Wrap<TeamMember>) => res.data,
    }),

    removeTeamMember: build.mutation<void, string>({
      query: (memberId) => ({ url: `/vendor-admin/team/${memberId}`, method: 'DELETE' }),
      invalidatesTags: ['TeamMember'],
    }),

    getVendorSettings: build.query<VendorSettings, void>({
      query: () => '/vendor-admin/settings',
      providesTags: ['VendorSettings'],
      transformResponse: (res: Wrap<VendorSettings>) => res.data,
    }),

    updateVendorSettings: build.mutation<VendorSettings, UpdateVendorSettingsRequest>({
      query: (body) => ({ url: '/vendor-admin/settings', method: 'PUT', body }),
      invalidatesTags: ['VendorSettings'],
      transformResponse: (res: Wrap<VendorSettings>) => res.data,
    }),

    getVendorAdminSettings: build.query<VendorAdminSettings, void>({
      query: () => '/vendor-admin/me/settings',
      providesTags: ['VendorAdminSettings'],
      transformResponse: (res: Wrap<VendorAdminSettings>) => res.data,
    }),

    updateVendorAdminSettings: build.mutation<VendorAdminSettings, UpdateVendorAdminSettingsRequest>({
      query: (body) => ({ url: '/vendor-admin/me/settings', method: 'PATCH', body }),
      invalidatesTags: ['VendorAdminSettings'],
      transformResponse: (res: Wrap<VendorAdminSettings>) => res.data,
    }),

    updateVendorAdminProfile: build.mutation<AdminUser, UpdateProfileRequest>({
      query: (body) => ({ url: '/vendor-admin/me/profile', method: 'PATCH', body }),
      transformResponse: (res: Wrap<AdminUser>) => res.data,
    }),

    changeVendorAdminPassword: build.mutation<{ message: string }, ChangePasswordRequest>({
      query: (body) => ({ url: '/vendor-admin/me/change-password', method: 'POST', body }),
      transformResponse: (res: { success: boolean; message: string }) => ({ message: res.message }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useUpdateTeamMemberRoleMutation,
  useRemoveTeamMemberMutation,
  useGetVendorSettingsQuery,
  useUpdateVendorSettingsMutation,
  useGetVendorAdminSettingsQuery,
  useUpdateVendorAdminSettingsMutation,
  useUpdateVendorAdminProfileMutation,
  useChangeVendorAdminPasswordMutation,
} = teamApi
