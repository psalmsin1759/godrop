import { api } from '@/store/baseApi'
import type { AuditLog, PaginatedResponse, AuditLogFilters } from '@/types/api'

interface AuditLogsRaw {
  success: boolean
  data: AuditLog[]
  total: number
  page: number
  limit: number
}

function transform(res: AuditLogsRaw): PaginatedResponse<AuditLog> {
  return {
    items: res.data,
    total: res.total,
    page: res.page,
    limit: res.limit,
    pages: Math.ceil(res.total / res.limit),
  }
}

export const auditApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAuditLogs: build.query<PaginatedResponse<AuditLog>, AuditLogFilters>({
      query: (params) => ({ url: '/admin/audit-logs', params }),
      providesTags: ['AuditLog'],
      transformResponse: transform,
    }),
    getVendorAuditLogs: build.query<PaginatedResponse<AuditLog>, Omit<AuditLogFilters, 'vendorId'>>({
      query: (params) => ({ url: '/vendor-admin/audit-logs', params }),
      providesTags: ['AuditLog'],
      transformResponse: transform,
    }),
  }),
  overrideExisting: false,
})

export const { useGetAuditLogsQuery, useGetVendorAuditLogsQuery } = auditApi
