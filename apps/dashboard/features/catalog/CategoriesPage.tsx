'use client'

import { useState } from 'react'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
} from '@/store/services/catalogApi'
import type { ProductCategory } from '@/types/api'
import CategoryFormDialog, { type CategoryFormValues } from '@/components/catalog/CategoryFormDialog'
import ConfirmDeleteDialog from '@/components/catalog/ConfirmDeleteDialog'
import { Plus, Pencil, Trash2, Loader2, ToggleLeft, ToggleRight, Tag } from 'lucide-react'

export default function CategoriesPage() {
  const { data: categories = [], isLoading, isError } = useGetCategoriesQuery()
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()
  const [toggleActive] = useToggleCategoryActiveMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(values: CategoryFormValues) {
    setError(null)
    try {
      if (editing) {
        await updateCategory({
          id: editing.id,
          name: values.name,
          description: values.description || null,
          imageUrl: values.imageUrl || null,
          sortOrder: values.sortOrder,
        }).unwrap()
      } else {
        await createCategory({
          name: values.name,
          description: values.description || undefined,
          imageUrl: values.imageUrl || undefined,
          isActive: values.isActive,
          sortOrder: values.sortOrder,
        }).unwrap()
      }
      setFormOpen(false)
      setEditing(null)
    } catch {
      setError('Failed to save category. Please try again.')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteCategory(deleteTarget.id).unwrap()
      setDeleteTarget(null)
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message
      setError(msg ?? 'Failed to delete. Category may still have products.')
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleToggle(cat: ProductCategory) {
    setToggling(cat.id)
    try {
      await toggleActive({ id: cat.id, isActive: !cat.isActive }).unwrap()
    } finally {
      setToggling(null)
    }
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(cat: ProductCategory) {
    setEditing(cat)
    setFormOpen(true)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#283c50]">Product Categories</h2>
          <p className="text-xs text-[#9ca3af] mt-0.5">Organise products into browsable categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Category
        </button>
      </div>

      {error && (
        <div className="text-xs text-[#ea4d4d] bg-[#fdf0f0] border border-[#f9c8c8] rounded-lg px-4 py-2.5">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading categories…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">
            Failed to load categories. Check your connection.
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eef1fb' }}>
              <Tag className="w-6 h-6" style={{ color: '#3454d1' }} />
            </div>
            <p className="text-xs text-[#9ca3af]">No categories yet</p>
            <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Create your first category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                  {['Category', 'Description', 'Products', 'Sort', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#eef1fb' }}>
                            <Tag className="w-4 h-4" style={{ color: '#3454d1' }} />
                          </div>
                        )}
                        <p className="text-xs font-semibold text-[#283c50]">{cat.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-xs text-[#6b7885] truncate block" title={cat.description}>
                        {cat.description || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-[#283c50]">
                        {cat._count?.products ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#6b7885]">{cat.sortOrder}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(cat)}
                        disabled={toggling === cat.id}
                        className="flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2 py-0.5 transition-colors"
                        style={
                          cat.isActive
                            ? { backgroundColor: '#e8faf2', color: '#17c666' }
                            : { backgroundColor: '#f3f4f6', color: '#6b7885' }
                        }
                      >
                        {toggling === cat.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : cat.isActive ? (
                          <ToggleRight className="w-3 h-3" />
                        ) : (
                          <ToggleLeft className="w-3 h-3" />
                        )}
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#eef1fb] transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" style={{ color: '#3454d1' }} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
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
        )}
      </div>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null) }}
        category={editing}
        onSubmit={handleSubmit}
        loading={creating || updating}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Delete category"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This will fail if the category still has products.`
            : ''
        }
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
