import { api } from '@/store/baseApi'
import type { Hero, CreateHeroRequest, UpdateHeroRequest } from '@/types/api'

type Wrap<T> = { success: boolean; data: T }

export const heroesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listHeroes: build.query<Hero[], void>({
      query: () => '/admin/heroes',
      providesTags: ['Hero'],
      transformResponse: (res: Wrap<Hero[]>) => res.data,
    }),

    getHero: build.query<Hero, string>({
      query: (id) => `/admin/heroes/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Hero', id }],
      transformResponse: (res: Wrap<Hero>) => res.data,
    }),

    createHero: build.mutation<Hero, CreateHeroRequest>({
      query: (body) => ({ url: '/admin/heroes', method: 'POST', body }),
      invalidatesTags: ['Hero'],
      transformResponse: (res: Wrap<Hero>) => res.data,
    }),

    updateHero: build.mutation<Hero, { id: string; body: UpdateHeroRequest }>({
      query: ({ id, body }) => ({ url: `/admin/heroes/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => ['Hero', { type: 'Hero', id }],
      transformResponse: (res: Wrap<Hero>) => res.data,
    }),

    uploadHeroImage: build.mutation<Hero, { id: string; file: File }>({
      query: ({ id, file }) => {
        const fd = new FormData()
        fd.append('image', file)
        return { url: `/admin/heroes/${id}/image`, method: 'POST', body: fd }
      },
      invalidatesTags: (_r, _e, { id }) => ['Hero', { type: 'Hero', id }],
      transformResponse: (res: Wrap<Hero>) => res.data,
    }),

    deleteHero: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/heroes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Hero'],
    }),
  }),
})

export const {
  useListHeroesQuery,
  useCreateHeroMutation,
  useUpdateHeroMutation,
  useUploadHeroImageMutation,
  useDeleteHeroMutation,
} = heroesApi
