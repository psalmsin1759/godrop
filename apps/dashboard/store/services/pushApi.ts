import { api } from '../baseApi'
import type { PushNotificationPayload, PushSendResult } from '@/types/api'

type CustomerBatchPayload = PushNotificationPayload & { customerIds: string[] }
type RiderBatchPayload = PushNotificationPayload & { riderIds: string[] }
type SinglePayload = { id: string } & PushNotificationPayload

const wrap = (res: { success: boolean; message: string; successCount?: number; failureCount?: number }): PushSendResult => ({
  success: res.success,
  message: res.message,
  successCount: res.successCount ?? 0,
  failureCount: res.failureCount ?? 0,
})

export const pushApi = api.injectEndpoints({
  endpoints: (build) => ({
    broadcastToCustomers: build.mutation<PushSendResult, PushNotificationPayload>({
      query: (body) => ({ url: '/admin/push/customers/broadcast', method: 'POST', body }),
      transformResponse: wrap,
    }),

    sendToCustomerBatch: build.mutation<PushSendResult, CustomerBatchPayload>({
      query: (body) => ({ url: '/admin/push/customers/batch', method: 'POST', body }),
      transformResponse: wrap,
    }),

    sendToCustomer: build.mutation<PushSendResult, SinglePayload>({
      query: ({ id, ...body }) => ({ url: `/admin/push/customers/${id}`, method: 'POST', body }),
      transformResponse: wrap,
    }),

    broadcastToRiders: build.mutation<PushSendResult, PushNotificationPayload>({
      query: (body) => ({ url: '/admin/push/riders/broadcast', method: 'POST', body }),
      transformResponse: wrap,
    }),

    sendToRiderBatch: build.mutation<PushSendResult, RiderBatchPayload>({
      query: (body) => ({ url: '/admin/push/riders/batch', method: 'POST', body }),
      transformResponse: wrap,
    }),

    sendToRider: build.mutation<PushSendResult, SinglePayload>({
      query: ({ id, ...body }) => ({ url: `/admin/push/riders/${id}`, method: 'POST', body }),
      transformResponse: wrap,
    }),
  }),
  overrideExisting: false,
})

export const {
  useBroadcastToCustomersMutation,
  useSendToCustomerBatchMutation,
  useSendToCustomerMutation,
  useBroadcastToRidersMutation,
  useSendToRiderBatchMutation,
  useSendToRiderMutation,
} = pushApi
