'use client'

import { useRef, useState } from 'react'
import { ImageIcon, Loader2, X, Upload } from 'lucide-react'
import { useUploadCatalogImageMutation } from '@/store/services/catalogApi'

const MAX_BYTES = 2 * 1024 * 1024

interface Props {
  value: string
  onChange: (url: string) => void
  onClear: () => void
}

export default function ImageUploader({ value, onChange, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadImage, { isLoading }] = useUploadCatalogImageMutation()
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setError('')
    if (file.size > MAX_BYTES) {
      setError('Image must be 2 MB or smaller.')
      return
    }
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { url } = await uploadImage(fd).unwrap()
      onChange(url)
    } catch {
      setError('Upload failed. Please try again.')
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        className="relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors"
        style={{
          borderColor: error ? '#ea4d4d' : '#e5e7eb',
          minHeight: 110,
          cursor: isLoading ? 'default' : 'pointer',
        }}
        onClick={() => !isLoading && inputRef.current?.click()}
      >
        {value ? (
          <div className="relative py-3">
            <img
              src={value}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-[#e5e7eb]"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
              style={{ backgroundColor: '#ea4d4d' }}
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
              style={{ backgroundColor: '#3454d1' }}
            >
              <Upload className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-2 py-5">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#3454d1' }} />
            <span className="text-[11px] text-[#9ca3af]">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#eef1fb' }}
            >
              <ImageIcon className="w-4.5 h-4.5" style={{ color: '#3454d1', width: 18, height: 18 }} />
            </div>
            <span className="text-[11px] text-[#6b7885]">Click to upload</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </div>
      <p className="text-[11px] text-[#9ca3af]">
        Recommended 200×200 px · Max 2 MB · JPG, PNG, WebP
      </p>
      {error && <p className="text-[11px]" style={{ color: '#ea4d4d' }}>{error}</p>}
    </div>
  )
}
