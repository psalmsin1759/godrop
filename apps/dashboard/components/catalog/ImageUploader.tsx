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
          borderColor: error ? '#FF3B30' : '#E7EAF1',
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
              className="w-20 h-20 object-cover rounded-lg border border-[#E7EAF1]"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
              style={{ backgroundColor: '#FF3B30' }}
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
              style={{ backgroundColor: '#1E5FFF' }}
            >
              <Upload className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-2 py-5">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#1E5FFF' }} />
            <span className="text-[11px] text-[#9AA1B4]">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#E7EEFF' }}
            >
              <ImageIcon className="w-4.5 h-4.5" style={{ color: '#1E5FFF', width: 18, height: 18 }} />
            </div>
            <span className="text-[11px] text-[#525A72]">Click to upload</span>
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
      <p className="text-[11px] text-[#9AA1B4]">
        Recommended 200×200 px · Max 2 MB · JPG, PNG, WebP
      </p>
      {error && <p className="text-[11px]" style={{ color: '#FF3B30' }}>{error}</p>}
    </div>
  )
}
