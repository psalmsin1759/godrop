'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => Promise<void>
  loading?: boolean
}

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#fdf0f0' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#ea4d4d' }} />
            </div>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-sm font-bold text-[#283c50]">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[#6b7885] leading-relaxed">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#f3f4f6] shrink-0">
              <X className="w-4 h-4 text-[#9ca3af]" />
            </Dialog.Close>
          </div>

          <div className="mt-5 flex gap-2 justify-end">
            <Dialog.Close className="px-4 py-1.5 text-xs rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb] font-medium">
              Cancel
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-1.5 text-xs rounded text-white font-medium disabled:opacity-50 flex items-center gap-1.5"
              style={{ backgroundColor: '#ea4d4d' }}
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
