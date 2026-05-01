import { api } from '@/store/baseApi'
import type { AuditLog, PaginatedResponse, AuditLogFilters } from '@/types/api'

interface AuditLogsRaw {
  success: boolean
  data: AuditLog[]
  total: number
  page: number
  limit: number
}

export const auditApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAuditLogs: build.query<PaginatedResponse<AuditLog>, AuditLogFilters>({
      query: (params) => ({ url: '/admin/audit-logs', params }),
      providesTags: ['AuditLog'],
      transformResponse: (res: AuditLogsRaw): PaginatedResponse<AuditLog> => ({
        items: res.data,
        total: res.total,
        page: res.page,
        limit: res.limit,
        pages: Math.ceil(res.total / res.limit),
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetAuditLogsQuery } = auditApi
