import { api } from '@/store/baseApi'
import type {
  SystemAnalytics,
  VendorAnalytics,
  SystemGraphData,
  VendorGraphData,
  AnalyticsDateParams,
} from '@/types/api'

type Wrap<T> = { success: boolean; data: T }

export const analyticsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSystemAnalytics: build.query<SystemAnalytics, AnalyticsDateParams | void>({
      query: (params) => ({
        url: '/admin/analytics',
        params: params ?? {},
      }),
      providesTags: ['Analytics'],
      transformResponse: (res: Wrap<SystemAnalytics>) => res.data,
    }),

    getSystemGraph: build.query<SystemGraphData, AnalyticsDateParams | void>({
      query: (params) => ({
        url: '/admin/analytics/graph',
        params: params ?? {},
      }),
      providesTags: ['Analytics'],
      transformResponse: (res: Wrap<SystemGraphData>) => res.data,
    }),

    getVendorAnalytics: build.query<VendorAnalytics, AnalyticsDateParams | void>({
      query: (params) => ({
        url: '/vendor-admin/analytics',
        params: params ?? {},
      }),
      providesTags: ['Analytics'],
      transformResponse: (res: Wrap<VendorAnalytics>) => res.data,
    }),

    getVendorGraph: build.query<VendorGraphData, AnalyticsDateParams | void>({
      query: (params) => ({
        url: '/vendor-admin/analytics/graph',
        params: params ?? {},
      }),
      providesTags: ['Analytics'],
      transformResponse: (res: Wrap<VendorGraphData>) => res.data,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSystemAnalyticsQuery,
  useGetSystemGraphQuery,
  useGetVendorAnalyticsQuery,
  useGetVendorGraphQuery,
} = analyticsApi
