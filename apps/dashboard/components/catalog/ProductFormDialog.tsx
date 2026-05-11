'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import * as Label from '@radix-ui/react-label'
import { Loader2, X } from 'lucide-react'
import type { ProductAdmin, ProductCategory } from '@/types/api'
import ImageUploader from './ImageUploader'

const schema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  priceKobo: z.coerce.number().int().min(1, 'Price must be at least ₦0.01'),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean(),
  stock: z.coerce.number().int().min(0).optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductAdmin | null
  categories: ProductCategory[]
  onSubmit: (values: FormValues) => Promise<void>
  loading?: boolean
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSubmit,
  loading,
}: Props) {
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      priceKobo: 0,
      imageUrl: '',
      isAvailable: true,
      stock: null,
    },
  })

  const imageUrl = watch('imageUrl') ?? ''

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              categoryId: product.categoryId,
              name: product.name,
              description: product.description ?? '',
              priceKobo: product.priceKobo,
              imageUrl: product.imageUrl ?? '',
              isAvailable: product.isAvailable,
              stock: product.stock ?? null,
            }
          : {
              categoryId: categories[0]?.id ?? '',
              name: '',
              description: '',
              priceKobo: 0,
              imageUrl: '',
              isAvailable: true,
              stock: null,
            }
      )
    }
  }, [open, product, categories, reset])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl focus:outline-none max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6] shrink-0">
            <Dialog.Title className="text-sm font-bold text-[#283c50]">
              {isEdit ? 'Edit Product' : 'New Product'}
            </Dialog.Title>
            <Dialog.Close className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f3f4f6]">
              <X className="w-4 h-4 text-[#9ca3af]" />
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <Label.Root className="text-xs font-medium text-[#4b5563]" htmlFor="prod-cat">
                  Category <span className="text-[#ea4d4d]">*</span>
                </Label.Root>
                <select
                  id="prod-cat"
                  {...register('categoryId')}
                  className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-2 text-[#283c50] bg-white focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-[11px] text-[#ea4d4d]">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label.Root className="text-xs font-medium text-[#4b5563]" htmlFor="prod-name">
                  Name <span className="text-[#ea4d4d]">*</span>
                </Label.Root>
                <input
                  id="prod-name"
                  {...register('name')}
                  placeholder="e.g. Chicken Burger"
                  className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-2 text-[#283c50] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
                />
                {errors.name && <p className="text-[11px] text-[#ea4d4d]">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label.Root className="text-xs font-medium text-[#4b5563]" htmlFor="prod-desc">
                  Description
                </Label.Root>
                <textarea
                  id="prod-desc"
                  {...register('description')}
                  placeholder="Describe this product…"
                  rows={2}
                  className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-2 text-[#283c50] placeholder:text-[#9ca3af] resize-none focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label.Root className="text-xs font-medium text-[#4b5563]" htmlFor="prod-price">
                    Price (Kobo) <span className="text-[#ea4d4d]">*</span>
                  </Label.Root>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]">₦</span>
                    <input
                      id="prod-price"
                      type="number"
                      min={1}
                      {...register('priceKobo')}
                      placeholder="0"
                      className="w-full text-xs border border-[#e5e7eb] rounded-lg pl-6 pr-3 py-2 text-[#283c50] focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
                    />
                  </div>
                  <p className="text-[10px] text-[#9ca3af]">Value in kobo (100 = ₦1)</p>
                  {errors.priceKobo && <p className="text-[11px] text-[#ea4d4d]">{errors.priceKobo.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label.Root className="text-xs font-medium text-[#4b5563]" htmlFor="prod-stock">
                    Stock
                  </Label.Root>
                  <input
                    id="prod-stock"
                    type="number"
                    min={0}
                    {...register('stock')}
                    placeholder="Blank = unlimited"
                    className="w-full text-xs border border-[#e5e7eb] rounded-lg px-3 py-2 text-[#283c50] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label.Root className="text-xs font-medium text-[#4b5563]">Image</Label.Root>
                <ImageUploader
                  value={imageUrl}
                  onChange={(url) => setValue('imageUrl', url)}
                  onClear={() => setValue('imageUrl', '')}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isAvailable')} className="w-4 h-4 rounded accent-[#3454d1]" />
                  <span className="text-xs text-[#4b5563]">Available (visible to customers)</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#f3f4f6] shrink-0">
              <Dialog.Close className="px-4 py-1.5 text-xs rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb] font-medium">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs rounded text-white font-medium disabled:opacity-50 flex items-center gap-1.5"
                style={{ backgroundColor: '#3454d1' }}
              >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export type { FormValues as ProductFormValues }
