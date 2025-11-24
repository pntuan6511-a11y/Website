'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Toast from '@/components/Toast'
import CurrencyInput from '@/components/ui/CurrencyInput'

// Dynamic import of react-quill (no SSR). Cast as any to avoid missing types.
const ReactQuill: any = dynamic(() => import('react-quill'), { ssr: false })
import { useRouter, useParams } from 'next/navigation'

interface PendingImage {
  file: File
  preview: string
  imageType: string
}

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState('')
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  // State for existing versions (editable)
  const [versions, setVersions] = useState<Array<{ id: string; name: string; price: string }>>([])
  // State for new versions (to be created)
  const [newVersions, setNewVersions] = useState<Array<{ name: string; price: string }>>([])

  const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' as 'info' | 'success' | 'error' | 'warning' })
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  const generateSlug = (value: string) => {
    // normalize and remove diacritics, then keep only [a-z0-9 -], replace spaces with -, collapse dashes
    const s = value
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\n+a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return s
  }

  useEffect(() => {
    if (params.id) {
      fetch(`/api/cars/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setCar(data)
          setArticle(data.article || '')
          setSlug(data.slug || '')
          // Initialize versions state with existing versions
          if (data.versions) {
            setVersions(data.versions.map((v: any) => ({
              id: v.id,
              name: v.name,
              price: v.price.toString()
            })))
          }
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
    setSaving(true)

    try {
      const formData = new FormData(e.currentTarget)

      const data = {
        name: formData.get('name'),
        tag: formData.get('tag') ? parseInt(String(formData.get('tag'))) : undefined,
        slug: slug, // Use the state slug
        description: formData.get('description'),
        article: article, // Use the state article
        mainImage: formData.get('mainImage'),
        metaTitle: formData.get('metaTitle'),
        metaDescription: formData.get('metaDescription'),
        metaKeywords: formData.get('metaKeywords'),
        ogImage: formData.get('ogImage')
      }

      // Cập nhật thông tin xe
      const res = await fetch(`/api/cars/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        throw new Error('Failed to update car')
      }

      // Xóa các ảnh đã đánh dấu xóa
      for (const imageId of imagesToDelete) {
        await fetch(`/api/car-images/${imageId}`, {
          method: 'DELETE'
        })
      }

      // Upload và lưu các ảnh mới
      for (const pendingImage of pendingImages) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', pendingImage.file)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()

          await fetch('/api/car-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              carId: params.id,
              imageUrl: uploadData.url,
              imageType: pendingImage.imageType,
              order: car.images?.filter((img: any) => img.imageType === pendingImage.imageType).length || 0
            })
          })
        }
      }

      // Cập nhật các phiên bản hiện có
      for (const version of versions) {
        if (version.name && version.price) {
          await fetch(`/api/car-versions/${version.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: version.name,
              price: parseFloat(version.price.toString().replace(/,/g, ''))
            })
          })
        }
      }

      // Thêm các phiên bản mới
      for (const version of newVersions.filter(v => v.name && v.price)) {
        await fetch('/api/car-versions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carId: params.id,
            name: version.name,
            price: parseFloat(version.price.toString().replace(/,/g, ''))
          })
        })
      }

      setToast({ visible: true, message: 'Cập nhật thành công!', variant: 'success' })
      setTimeout(() => router.push('/admin/cars'), 800)
    } catch (error) {
      setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
      setSaving(false)
    }
  }

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>, imageType: string) => {
    const files = e.target.files
    if (!files) return

    const newImages: PendingImage[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const preview = URL.createObjectURL(file)
      newImages.push({ file, preview, imageType })
    }

    setPendingImages([...pendingImages, ...newImages])
    e.target.value = '' // Reset input
  }

  const handleRemovePendingImage = (index: number) => {
    const newPendingImages = [...pendingImages]
    URL.revokeObjectURL(newPendingImages[index].preview)
    newPendingImages.splice(index, 1)
    setPendingImages(newPendingImages)
  }

  const handleMarkImageForDelete = (imageId: string) => {
    setImagesToDelete([...imagesToDelete, imageId])
  }

  const handleUnmarkImageForDelete = (imageId: string) => {
    setImagesToDelete(imagesToDelete.filter(id => id !== imageId))
  }

  // Functions for existing versions
  const updateVersion = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...versions]
    updated[index][field] = value
    setVersions(updated)
  }

  const deleteVersion = async (index: number, id: string) => {
    if (!confirm('Xóa phiên bản này?')) return
    try {
      const res = await fetch(`/api/car-versions/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setVersions(versions.filter((_, i) => i !== index))
        setToast({ visible: true, message: 'Đã xóa phiên bản', variant: 'success' })
      }
    } catch (error) {
      setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
    }
  }

  // Functions for new versions
  const addNewVersion = () => {
    setNewVersions([...newVersions, { name: '', price: '' }])
  }

  const removeNewVersion = (index: number) => {
    setNewVersions(newVersions.filter((_, i) => i !== index))
  }

  const updateNewVersion = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...newVersions]
    updated[index][field] = value
    setNewVersions(updated)
  }

  if (loading) {
    return <div className="p-8">Đang tải...</div>
  }

  if (!car) {
    return <div className="p-8">Không tìm thấy xe</div>
  }

  return (
    <div>
      <Toast message={toast.message} visible={toast.visible} variant={toast.variant} onClose={() => setToast({ ...toast, visible: false })} />
      <h1 className="text-3xl font-bold mb-8">Chỉnh sửa xe: {car.name}</h1>

      <div className="bg-white shadow rounded-lg p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 font-medium">Tên xe *</label>
              <input
                type="text"
                name="name"
                defaultValue={car.name}
                required
                className="input-custom"
                onChange={(e) => {
                  if (!slugEdited) {
                    setSlug(generateSlug(e.target.value))
                  }
                }}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Slug *</label>
              <div className="gap-0 flex items-center h-12 border border-gray-300 rounded-lg px-2 py-2">
                <span className="text-luxury-gold">{process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/</span>
                <input
                  type="text"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => {
                    const sanitized = generateSlug(e.target.value)
                    setSlug(sanitized)
                    setSlugEdited(true)
                  }}
                  className="input-custom pl-0 border-x-0 border-none rounded-none focus:ring-0 focus:border-luxury-gold flex-1 pb-0 pt-0"
                  placeholder="vinfast-vf-8"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Tag</label>
              <select name="tag" defaultValue={car.tag || ''} className="input-custom">
                <option value="">Không</option>
                <option value="1">New</option>
                <option value="2">Hot</option>
                <option value="3">Best Sale</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Mô tả ngắn</label>
            <textarea
              name="description"
              defaultValue={car.description || ''}
              rows={3}
              className="input-custom"
              placeholder="Mô tả ngắn gọn về xe..."
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Bài viết (HTML)</label>
            <div className="quill-custom">
              {typeof window !== 'undefined' ? (
                <ReactQuill value={article} onChange={setArticle} />
              ) : (
                <textarea readOnly value={article} className="input-custom font-mono text-sm min-h-[400px]" />
              )}
            </div>
            <input type="hidden" name="article" value={article} />
          </div>

          {/* SEO Section */}
          <div className="mb-6 pt-6 border-t">
            <h2 className="text-xl font-bold mb-6">SEO & Social Media</h2>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                defaultValue={car.metaTitle || ''}
                placeholder="Nếu để trống sẽ dùng tên xe"
                className="input-custom"
                maxLength={60}
              />
              <p className="text-sm text-gray-500 mt-1">Độ dài tối ưu: 50-60 ký tự</p>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Meta Description</label>
              <textarea
                name="metaDescription"
                defaultValue={car.metaDescription || ''}
                placeholder="Mô tả ngắn gọn về xe để hiển thị trên Google"
                rows={3}
                className="input-custom"
                maxLength={160}
              />
              <p className="text-sm text-gray-500 mt-1">Độ dài tối ưu: 150-160 ký tự</p>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Meta Keywords</label>
              <input
                type="text"
                name="metaKeywords"
                defaultValue={car.metaKeywords || ''}
                placeholder="VinFast VF8, xe điện, ô tô điện..."
                className="input-custom"
              />
              <p className="text-sm text-gray-500 mt-1">Các từ khóa cách nhau bằng dấu phẩy</p>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">OG Image URL (cho Facebook, Twitter)</label>
              <input
                type="url"
                name="ogImage"
                defaultValue={car.ogImage || ''}
                placeholder="https://example.com/image.jpg"
                className="input-custom"
              />
              <p className="text-sm text-gray-500 mt-1">Nếu để trống sẽ dùng ảnh main. Kích thước khuyến nghị: 1200x630px</p>
            </div>
          </div>

          {/* Images Section */}
          <div className="mb-6 pt-6 border-t">
            <h2 className="text-xl font-bold mb-6">Quản lý hình ảnh</h2>



            {/* Main Image */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Ảnh Chính</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {car.images?.filter((img: any) => img.imageType === 'main' && !imagesToDelete.includes(img.id)).map((img: any) => (
                  <div key={img.id} className="relative group">
                    <img src={img.imageUrl} alt="Main" className="w-full h-32 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => handleMarkImageForDelete(img.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                {car.images?.filter((img: any) => img.imageType === 'main' && imagesToDelete.includes(img.id)).map((img: any) => (
                  <div key={img.id} className="relative group opacity-50">
                    <img src={img.imageUrl} alt="Main" className="w-full h-32 object-cover rounded" />
                    <div className="absolute inset-0 bg-red-600 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">Sẽ xóa</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnmarkImageForDelete(img.id)}
                      className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                ))}
                {pendingImages.filter(img => img.imageType === 'main').map((img, index) => {
                  const actualIndex = pendingImages.indexOf(img)
                  return (
                    <div key={`pending-${actualIndex}`} className="relative group">
                      <img src={img.preview} alt="New Main" className="w-full h-32 object-cover rounded border-2 border-green-500" />
                      <div className="absolute top-0 left-0 bg-green-600 text-white px-2 py-0.5 text-xs rounded-br">
                        Mới
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePendingImage(actualIndex)}
                        className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Xóa
                      </button>
                    </div>
                  )
                })}
                <div className="border-2 border-dashed border-gray-300 rounded h-32 flex items-center justify-center hover:border-luxury-gold transition-colors">
                  <label className="cursor-pointer text-center">
                    <span className="text-gray-500">+ Thêm ảnh (Tỷ lệ 16:9)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleAddImage(e, 'main')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Thư viện ảnh</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {car.images?.filter((img: any) => img.imageType === 'gallery' && !imagesToDelete.includes(img.id)).map((img: any) => (
                  <div key={img.id} className="relative group">
                    <img src={img.imageUrl} alt="Gallery" className="w-full h-32 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => handleMarkImageForDelete(img.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                {car.images?.filter((img: any) => img.imageType === 'gallery' && imagesToDelete.includes(img.id)).map((img: any) => (
                  <div key={img.id} className="relative group opacity-50">
                    <img src={img.imageUrl} alt="Gallery" className="w-full h-32 object-cover rounded" />
                    <div className="absolute inset-0 bg-red-600 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">Sẽ xóa</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnmarkImageForDelete(img.id)}
                      className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                ))}
                {pendingImages.filter(img => img.imageType === 'gallery').map((img, index) => {
                  const actualIndex = pendingImages.indexOf(img)
                  return (
                    <div key={`pending-${actualIndex}`} className="relative group">
                      <img src={img.preview} alt="New Gallery" className="w-full h-32 object-cover rounded border-2 border-green-500" />
                      <div className="absolute top-0 left-0 bg-green-600 text-white px-2 py-0.5 text-xs rounded-br">
                        Mới
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePendingImage(actualIndex)}
                        className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Xóa
                      </button>
                    </div>
                  )
                })}
                <div className="border-2 border-dashed border-gray-300 rounded h-32 flex items-center justify-center hover:border-luxury-gold transition-colors">
                  <label className="cursor-pointer text-center">
                    <span className="text-gray-500">+ Thêm ảnh (Tỷ lệ 16:9)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleAddImage(e, 'gallery')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Versions Section */}
          <div className="mb-6 pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Các phiên bản</h2>
              <button
                type="button"
                onClick={addNewVersion}
                className="btn-secondary text-sm"
              >
                + Thêm phiên bản
              </button>
            </div>

            <div className="space-y-4">
              {/* Existing Versions (Editable) */}
              {versions.map((version, index) => (
                <div key={version.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium">Tên phiên bản</label>
                      <input
                        type="text"
                        value={version.name}
                        onChange={(e) => updateVersion(index, 'name', e.target.value)}
                        className="input-custom"
                        placeholder="Eco"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Giá (VNĐ)</label>
                      <CurrencyInput
                        value={version.price}
                        onChange={(val) => updateVersion(index, 'price', val)}
                        className="input-custom"
                        placeholder="1,200,000,000"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteVersion(index, version.id)}
                    className="text-red-600 hover:text-red-900 mt-8"
                  >
                    Xóa
                  </button>
                </div>
              ))}

              {/* New Versions */}
              {newVersions.map((version, index) => (
                <div key={`new-${index}`} className="flex gap-4 items-start p-4 bg-green-50 rounded border-2 border-green-500">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium">Tên phiên bản</label>
                      <input
                        type="text"
                        value={version.name}
                        onChange={(e) => updateNewVersion(index, 'name', e.target.value)}
                        className="input-custom"
                        placeholder="Eco"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Giá (VNĐ)</label>
                      <CurrencyInput
                        value={version.price}
                        onChange={(val) => updateNewVersion(index, 'price', val)}
                        className="input-custom"
                        placeholder="1,200,000,000"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-8">
                    <div className="bg-green-600 text-white px-2 py-0.5 text-xs rounded">
                      Mới
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewVersion(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin/cars')}
                className="btn-secondary"
                disabled={saving}
              >
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
