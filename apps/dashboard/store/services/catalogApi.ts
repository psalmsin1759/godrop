import { api } from '@/store/baseApi'
import type {
  ProductCategory,
  ProductAdmin,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateProductRequest,
  UpdateProductRequest,
  ProductsListResponse,
  ProductsListParams,
} from '@/types/api'

type Wrap<T> = { success: boolean; data: T }

export const catalogApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── Categories ───────────────────────────────────────────────
    getCategories: build.query<ProductCategory[], void>({
      query: () => '/vendor-admin/categories',
      providesTags: ['ProductCategory'],
      transformResponse: (res: Wrap<ProductCategory[]>) => res.data,
    }),

    getCategory: build.query<ProductCategory, string>({
      query: (id) => `/vendor-admin/categories/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'ProductCategory', id }],
      transformResponse: (res: Wrap<ProductCategory>) => res.data,
    }),

    createCategory: build.mutation<ProductCategory, CreateCategoryRequest>({
      query: (body) => ({ url: '/vendor-admin/categories', method: 'POST', body }),
      invalidatesTags: ['ProductCategory'],
      transformResponse: (res: Wrap<ProductCategory>) => res.data,
    }),

    updateCategory: build.mutation<ProductCategory, { id: string } & UpdateCategoryRequest>({
      query: ({ id, ...body }) => ({ url: `/vendor-admin/categories/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ProductCategory', id }, 'ProductCategory'],
      transformResponse: (res: Wrap<ProductCategory>) => res.data,
    }),

    deleteCategory: build.mutation<void, string>({
      query: (id) => ({ url: `/vendor-admin/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ProductCategory'],
    }),

    toggleCategoryActive: build.mutation<ProductCategory, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/vendor-admin/categories/${id}/active`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ProductCategory', id }, 'ProductCategory'],
      transformResponse: (res: Wrap<ProductCategory>) => res.data,
    }),

    // ── Products ─────────────────────────────────────────────────
    getProducts: build.query<ProductsListResponse, ProductsListParams>({
      query: ({ categoryId, page = 1, limit = 20 } = {}) => ({
        url: '/vendor-admin/products',
        params: { ...(categoryId ? { categoryId } : {}), page, limit },
      }),
      providesTags: ['Product'],
    }),

    getProduct: build.query<ProductAdmin, string>({
      query: (id) => `/vendor-admin/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
      transformResponse: (res: Wrap<ProductAdmin>) => res.data,
    }),

    createProduct: build.mutation<ProductAdmin, CreateProductRequest>({
      query: (body) => ({ url: '/vendor-admin/products', method: 'POST', body }),
      invalidatesTags: ['Product'],
      transformResponse: (res: Wrap<ProductAdmin>) => res.data,
    }),

    updateProduct: build.mutation<ProductAdmin, { id: string } & UpdateProductRequest>({
      query: ({ id, ...body }) => ({ url: `/vendor-admin/products/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }, 'Product'],
      transformResponse: (res: Wrap<ProductAdmin>) => res.data,
    }),

    deleteProduct: build.mutation<void, string>({
      query: (id) => ({ url: `/vendor-admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),

    toggleProductAvailability: build.mutation<ProductAdmin, { id: string; isAvailable: boolean }>({
      query: ({ id, isAvailable }) => ({
        url: `/vendor-admin/products/${id}/availability`,
        method: 'PATCH',
        body: { isAvailable },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }, 'Product'],
      transformResponse: (res: Wrap<ProductAdmin>) => res.data,
    }),

    uploadCatalogImage: build.mutation<{ url: string }, FormData>({
      query: (body) => ({ url: '/vendor-admin/catalog/image', method: 'POST', body, formData: true }),
      transformResponse: (res: Wrap<{ url: string }>) => res.data,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductAvailabilityMutation,
  useUploadCatalogImageMutation,
} = catalogApi
