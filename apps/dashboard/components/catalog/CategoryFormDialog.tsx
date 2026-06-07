'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import * as Label from '@radix-ui/react-label'
import { Loader2, X } from 'lucide-react'
import type { ProductCategory } from '@/types/api'
import ImageUploader from './ImageUploader'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ProductCategory | null
  onSubmit: (values: FormValues) => Promise<void>
  loading?: boolean
}

export default function CategoryFormDialog({ open, onOpenChange, category, onSubmit, loading }: Props) {
  const isEdit = !!category

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', imageUrl: '', isActive: true, sortOrder: 0 },
  })

  const imageUrl = watch('imageUrl') ?? ''

  useEffect(() => {
    if (open) {
      reset(
        category
          ? {
              name: category.name,
              description: category.description ?? '',
              imageUrl: category.imageUrl ?? '',
              isActive: category.isActive,
              sortOrder: category.sortOrder,
            }
          : { name: '', description: '', imageUrl: '', isActive: true, sortOrder: 0 }
      )
    }
  }, [open, category, reset])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDF0F6]">
            <Dialog.Title className="text-sm font-bold text-[#0D1426]">
              {isEdit ? 'Edit Category' : 'New Category'}
            </Dialog.Title>
            <Dialog.Close className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#EDF0F6]">
              <X className="w-4 h-4 text-[#9AA1B4]" />
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label.Root className="text-xs font-medium text-[#525A72]" htmlFor="cat-name">
                  Name <span className="text-[#FF3B30]">*</span>
                </Label.Root>
                <input
                  id="cat-name"
                  {...register('name')}
                  placeholder="e.g. Burgers, Soft Drinks"
                  className="w-full text-xs border border-[#E7EAF1] rounded-lg px-3 py-2 text-[#0D1426] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
                />
                {errors.name && <p className="text-[11px] text-[#FF3B30]">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label.Root className="text-xs font-medium text-[#525A72]" htmlFor="cat-desc">
                  Description
                </Label.Root>
                <textarea
                  id="cat-desc"
                  {...register('description')}
                  placeholder="Short description for this category…"
                  rows={2}
                  className="w-full text-xs border border-[#E7EAF1] rounded-lg px-3 py-2 text-[#0D1426] placeholder:text-[#9AA1B4] resize-none focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
                />
              </div>

              <div className="space-y-1.5">
                <Label.Root className="text-xs font-medium text-[#525A72]">Image</Label.Root>
                <ImageUploader
                  value={imageUrl}
                  onChange={(url) => setValue('imageUrl', url)}
                  onClear={() => setValue('imageUrl', '')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label.Root className="text-xs font-medium text-[#525A72]" htmlFor="cat-sort">
                    Sort Order
                  </Label.Root>
                  <input
                    id="cat-sort"
                    type="number"
                    min={0}
                    {...register('sortOrder')}
                    className="w-full text-xs border border-[#E7EAF1] rounded-lg px-3 py-2 text-[#0D1426] focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
                  />
                  {errors.sortOrder && <p className="text-[11px] text-[#FF3B30]">{errors.sortOrder.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label.Root className="text-xs font-medium text-[#525A72]">Status</Label.Root>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded accent-[#1E5FFF]" />
                    <span className="text-xs text-[#525A72]">Active (visible to customers)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#EDF0F6]">
              <Dialog.Close className="px-4 py-1.5 text-xs rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC] font-medium">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs rounded text-white font-medium disabled:opacity-50 flex items-center gap-1.5"
                style={{ backgroundColor: '#1E5FFF' }}
              >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export type { FormValues as CategoryFormValues }
