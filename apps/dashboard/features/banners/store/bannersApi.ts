import { api } from '@/store/baseApi'
import type { Banner, CreateBannerRequest, UpdateBannerRequest } from '@/types/api'

type Wrap<T> = { success: boolean; data: T }

export const bannersApi = api.injectEndpoints({
  endpoints: (build) => ({
    listBanners: build.query<Banner[], void>({
      query: () => '/admin/banners',
      providesTags: ['Banner'],
      transformResponse: (res: Wrap<Banner[]>) => res.data,
    }),

    getBanner: build.query<Banner, string>({
      query: (id) => `/admin/banners/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Banner', id }],
      transformResponse: (res: Wrap<Banner>) => res.data,
    }),

    createBanner: build.mutation<Banner, CreateBannerRequest>({
      query: (body) => ({ url: '/admin/banners', method: 'POST', body }),
      invalidatesTags: ['Banner'],
      transformResponse: (res: Wrap<Banner>) => res.data,
    }),

    updateBanner: build.mutation<Banner, { id: string; body: UpdateBannerRequest }>({
      query: ({ id, body }) => ({ url: `/admin/banners/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => ['Banner', { type: 'Banner', id }],
      transformResponse: (res: Wrap<Banner>) => res.data,
    }),

    uploadBannerImage: build.mutation<Banner, { id: string; file: File }>({
      query: ({ id, file }) => {
        const fd = new FormData()
        fd.append('image', file)
        return { url: `/admin/banners/${id}/image`, method: 'POST', body: fd }
      },
      invalidatesTags: (_r, _e, { id }) => ['Banner', { type: 'Banner', id }],
      transformResponse: (res: Wrap<Banner>) => res.data,
    }),

    deleteBanner: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/banners/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Banner'],
    }),
  }),
})

export const {
  useListBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useUploadBannerImageMutation,
  useDeleteBannerMutation,
} = bannersApi
