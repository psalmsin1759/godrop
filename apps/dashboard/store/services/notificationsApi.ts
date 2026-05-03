import { api } from '../baseApi'
import type { AdminNotification, NotificationsListParams, RidersListMeta } from '@/types/api'

type WrapList = {
  success: boolean
  data: AdminNotification[]
  meta: RidersListMeta
  unreadCount: number
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<
      { data: AdminNotification[]; meta: RidersListMeta; unreadCount: number },
      NotificationsListParams
    >({
      query: (params = {}) => ({ url: '/admin/notifications', params }),
      providesTags: ['Notification'],
      transformResponse: (res: WrapList) => ({
        data: res.data ?? [],
        meta: res.meta,
        unreadCount: res.unreadCount ?? 0,
      }),
    }),

    getUnreadCount: build.query<number, void>({
      query: () => '/admin/notifications/unread-count',
      providesTags: ['Notification'],
      transformResponse: (res: { success: boolean; unreadCount: number }) => res.unreadCount ?? 0,
    }),

    markNotificationRead: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: build.mutation<void, void>({
      query: () => ({ url: '/admin/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi
