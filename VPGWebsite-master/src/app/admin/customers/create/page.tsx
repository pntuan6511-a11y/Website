"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Toast from '@/components/Toast'

export default function CreateCustomerPage() {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState('')
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' as 'info' | 'success' | 'error' | 'warning' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // If there's a pending image file, upload it first
    let finalImageUrl: string | null = formData.get('imageUrl') as string | null

    if (pendingImage) {
      const up = new FormData()
      up.append('file', pendingImage)

      try {
        const upRes = await fetch('/api/upload', { method: 'POST', body: up })
        if (upRes.ok) {
          const upData = await upRes.json()
          // Construct a safe URL — prefer returned `url` if provided, otherwise compose and encode filename
          if (upData.url) {
            finalImageUrl = upData.url
          } else if (upData.filename) {
            const base = '/uploads'
            finalImageUrl = `${base}/${encodeURIComponent(upData.filename)}`
          }
        } else {
          setToast({ visible: true, message: 'Upload ảnh thất bại', variant: 'error' })
          return
        }
      } catch (err) {
        setToast({ visible: true, message: 'Upload ảnh thất bại', variant: 'error' })
        return
      }
    }

    const data = {
      name: formData.get('name'),
      imageUrl: finalImageUrl,
      order: Number(formData.get('order'))
    }

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setToast({ visible: true, message: 'Thêm khách hàng thành công!', variant: 'success' })
        setTimeout(() => router.push('/admin/customers'), 800)
      } else {
        setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
      }
    } catch (error) {
      setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // set pending file and preview; do not upload yet
    setPendingImage(file)
    const url = URL.createObjectURL(file)
    setPendingPreview(url)

    // Also set the text input to a placeholder until upload completes
    const imageInput = document.querySelector<HTMLInputElement>('input[name="imageUrl"]')
    if (imageInput) {
      imageInput.value = ''
    }
  }

  const handleRemovePending = () => {
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview)
    }
    setPendingImage(null)
    setPendingPreview(null)
  }

  return (
    <div>
      <Toast message={toast.message} visible={toast.visible} variant={toast.variant} onClose={() => setToast({ ...toast, visible: false })} />
      <h1 className="text-3xl font-bold mb-8">Thêm khách hàng mới</h1>

      <div className="bg-white shadow rounded-lg p-8 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 font-medium">Tên khách hàng</label>
            <input
              type="text"
              name="name"
              required
              className="input-custom"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Hình ảnh</label>
            <input
              type="text"
              name="imageUrl"
              className="input-custom mb-2 hidden"
              placeholder="/uploads/customer.jpg"
            />

            {pendingPreview ? (
              <div className="relative group w-full h-auto">
                <img src={pendingPreview} alt="Preview" className="w-full h-auto object-cover rounded-md aspect-[16/9]" />
                <button
                  type="button"
                  onClick={handleRemovePending}
                  className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                >
                  Xóa
                </button>
              </div>
            ) : imageUrl ? (
              <div className="relative group w-full h-auto">
                <img src={imageUrl} alt="Preview" className="w-full h-auto object-cover rounded-md aspect-[16/9]" />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('')
                    const input = document.querySelector<HTMLInputElement>('input[name="imageUrl"]')
                    if (input) input.value = ''
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                >
                  Xóa
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded h-24 flex items-center justify-center hover:border-luxury-gold transition-colors">
                <label className="cursor-pointer text-center w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">+ Thêm ảnh (Tỷ lệ 16:9)</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Thứ tự hiển thị</label>
            <input
              type="number"
              name="order"
              defaultValue={0}
              required
              className="input-custom"
              min="0"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/customers')}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Thêm khách hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
