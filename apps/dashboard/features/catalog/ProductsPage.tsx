'use client'

import { useState } from 'react'
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductAvailabilityMutation,
} from '@/store/services/catalogApi'
import type { ProductAdmin } from '@/types/api'
import ProductFormDialog, { type ProductFormValues } from '@/components/catalog/ProductFormDialog'
import ConfirmDeleteDialog from '@/components/catalog/ConfirmDeleteDialog'
import { formatNaira } from '@/lib/utils'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  ToggleLeft,
  ToggleRight,
  Package,
} from 'lucide-react'

const PAGE_SIZE = 20

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data: categories = [] } = useGetCategoriesQuery()
  const {
    data,
    isLoading,
    isError,
  } = useGetProductsQuery({ categoryId: categoryFilter || undefined, page, limit: PAGE_SIZE })

  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()
  const [toggleAvailability] = useToggleProductAvailabilityMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductAdmin | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductAdmin | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const products = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const filtered = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.name.toLowerCase().includes(search.toLowerCase())
      )
    : products

  async function handleSubmit(values: ProductFormValues) {
    setError(null)
    try {
      if (editing) {
        await updateProduct({
          id: editing.id,
          categoryId: values.categoryId,
          name: values.name,
          description: values.description || null,
          priceKobo: values.priceKobo,
          imageUrl: values.imageUrl || null,
          isAvailable: values.isAvailable,
          stock: values.stock ?? null,
        }).unwrap()
      } else {
        await createProduct({
          categoryId: values.categoryId,
          name: values.name,
          description: values.description || undefined,
          priceKobo: values.priceKobo,
          imageUrl: values.imageUrl || undefined,
          isAvailable: values.isAvailable,
          stock: values.stock ?? undefined,
        }).unwrap()
      }
      setFormOpen(false)
      setEditing(null)
    } catch {
      setError('Failed to save product. Please try again.')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteProduct(deleteTarget.id).unwrap()
      setDeleteTarget(null)
    } catch {
      setError('Failed to delete product.')
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleToggle(product: ProductAdmin) {
    setToggling(product.id)
    try {
      await toggleAvailability({ id: product.id, isAvailable: !product.isAvailable }).unwrap()
    } finally {
      setToggling(null)
    }
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(product: ProductAdmin) {
    setEditing(product)
    setFormOpen(true)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#283c50]">Products</h2>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {total > 0 ? `${total} product${total !== 1 ? 's' : ''} total` : 'Manage your product catalogue'}
          </p>
        </div>
        <button onClick={openCreate} disabled={categories.length === 0} className="btn-primary flex items-center gap-1.5 disabled:opacity-50" title={categories.length === 0 ? 'Create a category first' : undefined}>
          <Plus className="w-3.5 h-3.5" /> New Product
        </button>
      </div>

      {error && (
        <div className="text-xs text-[#ea4d4d] bg-[#fdf0f0] border border-[#f9c8c8] rounded-lg px-4 py-2.5">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {categories.length === 0 && !isLoading && (
        <div className="text-xs text-[#ffa21d] bg-[#fff6e8] border border-[#ffe0a3] rounded-lg px-4 py-2.5">
          No categories exist yet. Create a category first before adding products.
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#3454d1] focus:border-[#3454d1] w-52"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading products…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">
            Failed to load products.
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eef1fb' }}>
              <Package className="w-6 h-6" style={{ color: '#3454d1' }} />
            </div>
            <p className="text-xs text-[#9ca3af]">
              {search ? 'No products match your search.' : 'No products yet.'}
            </p>
            {!search && categories.length > 0 && (
              <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add your first product
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Product', 'Category', 'Price', 'Stock', 'Availability', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9fafb]">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-9 h-9 rounded object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#f3f4f6' }}>
                              <Package className="w-4 h-4 text-[#9ca3af]" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-[#283c50]">{product.name}</p>
                            {product.description && (
                              <p className="text-[11px] text-[#9ca3af] truncate max-w-[160px]" title={product.description}>
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#6b7885]">{product.category.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-[#283c50]">
                          {formatNaira(product.priceKobo)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#6b7885]">
                          {product.stock != null ? product.stock : '∞'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(product)}
                          disabled={toggling === product.id}
                          className="flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2 py-0.5 transition-colors"
                          style={
                            product.isAvailable
                              ? { backgroundColor: '#e8faf2', color: '#17c666' }
                              : { backgroundColor: '#f3f4f6', color: '#6b7885' }
                          }
                        >
                          {toggling === product.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : product.isAvailable ? (
                            <ToggleRight className="w-3 h-3" />
                          ) : (
                            <ToggleLeft className="w-3 h-3" />
                          )}
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#eef1fb] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" style={{ color: '#3454d1' }} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#fdf0f0] transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: '#ea4d4d' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-[#f3f4f6] flex items-center justify-between">
              <p className="text-xs text-[#9ca3af]">
                Page {page} of {totalPages} · {total} products
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb] disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb] disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null) }}
        product={editing}
        categories={categories}
        onSubmit={handleSubmit}
        loading={creating || updating}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Delete product"
        description={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
