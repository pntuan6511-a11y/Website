'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Toast from '@/components/Toast'

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' as 'info' | 'success' | 'error' | 'warning' })

  useEffect(() => {
    if (params.id) {
      fetch(`/api/customers/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setCustomer(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get('name'),
      imageUrl: formData.get('imageUrl'),
      order: Number(formData.get('order'))
    }

    try {
      const res = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setToast({ visible: true, message: 'Cập nhật thành công!', variant: 'success' })
        router.push('/admin/customers')
      } else {
        setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
      }
    } catch (error) {
      setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        const imageInput = document.querySelector<HTMLInputElement>('input[name="imageUrl"]')
        if (imageInput) {
          imageInput.value = data.url
        }
        setCustomer({ ...customer, imageUrl: data.url })
        setToast({ visible: true, message: 'Upload thành công!', variant: 'success' })
      }
    } catch (error) {
      setToast({ visible: true, message: 'Upload thất bại', variant: 'error' })
    }
  }

  if (loading) {
    return <div className="p-8">Đang tải...</div>
  }

  if (!customer) {
    return <div className="p-8">Không tìm thấy khách hàng</div>
  }

  return (
    <div>
      <Toast message={toast.message} visible={toast.visible} variant={toast.variant} onClose={() => setToast({ ...toast, visible: false })} />
      <h1 className="text-3xl font-bold mb-8">Chỉnh sửa khách hàng: {customer.name}</h1>

      <div className="bg-white shadow rounded-lg p-8 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 font-medium">Tên khách hàng</label>
            <input
              type="text"
              name="name"
              defaultValue={customer.name}
              required
              className="input-custom"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Hình ảnh</label>
            <input
              type="text"
              name="imageUrl"
              defaultValue={customer.imageUrl || ''}
              className="input-custom mb-2"
              placeholder="/uploads/customer.jpg"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="input-custom"
            />
            {customer.imageUrl && (
              <img src={customer.imageUrl} alt={customer.name} className="mt-4 w-32 h-32 rounded-full object-cover" />
            )}
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Thứ tự hiển thị</label>
            <input
              type="number"
              name="order"
              defaultValue={customer.order}
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
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
