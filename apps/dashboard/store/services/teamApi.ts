import { api } from '@/store/baseApi'
import type { TeamMember, InviteTeamMemberRequest, VendorSettings, UpdateVendorSettingsRequest } from '@/types/api'

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
} = teamApi
