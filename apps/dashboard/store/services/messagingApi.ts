import { api } from '../baseApi'

interface EmailPayload {
  subject: string
  html: string
  text?: string
}

interface EmailSinglePayload extends EmailPayload {
  to: string
}

interface EmailBatchPayload extends EmailPayload {
  emails: string
}

interface EmailResult {
  message: string
  sent?: number
  failed?: number
  total?: number
}

export const messagingApi = api.injectEndpoints({
  endpoints: (build) => ({
    sendEmailSingle: build.mutation<EmailResult, EmailSinglePayload>({
      query: (body) => ({ url: '/admin/messaging/email/single', method: 'POST', body }),
    }),

    sendEmailBatch: build.mutation<EmailResult, EmailBatchPayload>({
      query: (body) => ({ url: '/admin/messaging/email/batch', method: 'POST', body }),
    }),

    sendEmailAllCustomers: build.mutation<EmailResult, EmailPayload>({
      query: (body) => ({ url: '/admin/messaging/email/all-customers', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useSendEmailSingleMutation,
  useSendEmailBatchMutation,
  useSendEmailAllCustomersMutation,
} = messagingApi
