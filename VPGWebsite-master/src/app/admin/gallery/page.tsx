"use client"

import { useEffect, useState } from 'react'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function AdminGalleryPage() {
  const [banners, setBanners] = useState<any[]>([])
  interface PendingImage { file: File; preview: string }
  const [pending, setPending] = useState<PendingImage[]>([])
  const [uploads, setUploads] = useState<any[]>([])
  const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' as 'info' | 'success' | 'error' | 'warning' })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => { loadBanners() }, [])
  useEffect(() => { loadUploads() }, [])

  const loadBanners = () => {
    fetch('/api/car-images')
      .then(res => res.json())
      .then(data => {
        setBanners(data.filter((i: any) => i.imageType === 'banner'))
      })
      .catch(err => console.error(err))
  }

  const loadUploads = () => {
    fetch('/api/uploads')
      .then(res => res.json())
      .then(data => setUploads(data))
      .catch(err => console.error(err))
  }

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newImages: PendingImage[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const preview = URL.createObjectURL(file)
      newImages.push({ file, preview })
    }
    setPending([...pending, ...newImages])
    e.target.value = ''
  }

  const handleRemovePending = (index: number) => {
    const newPending = [...pending]
    URL.revokeObjectURL(newPending[index].preview)
    newPending.splice(index, 1)
    setPending(newPending)
  }

  const uploadPending = async () => {
    if (pending.length === 0) return
    setUploading(true)
    setUploadProgress(0)
    try {
      for (let i = 0; i < pending.length; i++) {
        const p = pending[i]
        const fd = new FormData()
        fd.append('file', p.file)
        fd.append('createDb', 'true')
        fd.append('imageType', 'banner')
        fd.append('carId', '')

        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!up.ok) {
          // continue but mark failure
          continue
        }
        // update progress
        setUploadProgress(Math.round(((i + 1) / pending.length) * 100))
      }

      pending.forEach(p => URL.revokeObjectURL(p.preview))
      setPending([])
      setToast({ visible: true, message: 'Upload thành công', variant: 'success' })
      loadBanners()
      loadUploads()
    } catch (err) {
      setToast({ visible: true, message: 'Upload thất bại', variant: 'error' })
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 500)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteTarget({ type: 'banner', id })
  }

  const handleDeleteUpload = async (name: string) => {
    setDeleteTarget({ type: 'upload', name })
  }

  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'banner') {
        const res = await fetch(`/api/car-images/${deleteTarget.id}`, { method: 'DELETE' })
        if (res.ok) {
          setToast({ visible: true, message: 'Xóa thành công', variant: 'success' })
          loadBanners()
        } else {
          setToast({ visible: true, message: 'Không thể xóa banner', variant: 'error' })
        }
      } else if (deleteTarget.type === 'upload') {
        const res = await fetch('/api/uploads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: deleteTarget.name }) })
        const data = await res.json()
        if (res.ok) {
          setToast({ visible: true, message: 'Xóa thành công', variant: 'success' })
          loadUploads()
        } else {
          setToast({ visible: true, message: data.error || 'Không thể xóa', variant: 'error' })
        }
      }
    } catch (err) {
      setToast({ visible: true, message: 'Xóa thất bại', variant: 'error' })
    } finally {
      setDeleteTarget(null)
    }
  }

  const cancelDelete = () => setDeleteTarget(null)

  return (
    <div>
      <Toast message={toast.message} visible={toast.visible} variant={toast.variant} onClose={() => setToast({ ...toast, visible: false })} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quản lý banner website</h1>
      </div>

      <div className="bg-white shadow rounded-lg py-3 px-6 mb-6">

        <div className="mb-6">
          <div className="grid grid-cols-1">
            <h3 className="font-semibold mb-2">Banner website</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 px-3 rounded-sm">
              {banners.map(b => (
                <div key={b.id} className="relative group">
                  <img src={b.imageUrl} className="w-full h-40 object-cover rounded" />
                  <button onClick={() => handleDelete(b.id)} className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100">Xóa</button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 px-3 rounded-sm">
              {pending.map((p, idx) => (
                <div key={idx} className="relative group">
                  <img src={p.preview} className="w-full h-24 object-cover rounded" />
                  <button onClick={() => handleRemovePending(idx)} type="button" className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100">Xóa</button>
                </div>
              ))}
              <div className="border-2 border-dashed border-gray-300 rounded h-24 flex items-center justify-center hover:border-luxury-gold transition-colors">
                <label className="cursor-pointer text-center w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">+ Thêm ảnh (Tỷ lệ 16:9)</span>
                  <input type="file" accept="image/*" multiple onChange={handleAddImages} className="hidden" />
                </label>
              </div>
            </div>
            {pending.length > 0 && (
              <div className="mt-4">
                <Button variant="primary" className="px-3 py-2 flex items-center gap-2" onClick={uploadPending} disabled={uploading}>
                  {/* upload icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {uploading ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M12 3v3m0 12v3M5 12H2m20 0h-3M6.343 6.343L4.222 4.222M19.778 19.778l-2.121-2.121M6.343 17.657L4.222 19.778M19.778 4.222l-2.121 2.121" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 5v11" />
                    )}
                  </svg>
                  <span>{uploading ? `Đang tải... ${uploadProgress}%` : `Tải lên ${pending.length} file`}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Thư viện ảnh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploads.map(f => (
              <div key={f.name} className={`group bg-white shadow rounded p-3 relative overflow-hidden border ${f.used ? 'border-gray-100' : 'border-yellow-300'}`}>
                <div className="w-full h-40 bg-gray-50 rounded overflow-hidden mb-3">
                  <img src={f.url} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="truncate pr-2">{f.name}</div>
                  <div className="text-xs text-gray-500">{(f.size / 1024).toFixed(0)} KB</div>
                </div>
                {!f.used && (<div className="absolute top-3 left-3 bg-yellow-300 text-black px-2 py-0.5 text-xs rounded">Unused</div>)}
                {!f.used && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100">
                    <button onClick={() => handleDeleteUpload(f.name)} className="bg-red-600 text-white px-2 py-1 rounded text-sm">Xóa</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <ConfirmModal open={!!deleteTarget} title="Xác nhận xóa" description={deleteTarget?.type === 'banner' ? 'Bạn có chắc muốn xóa banner này?' : 'Bạn có chắc muốn xóa file upload này?'} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </div>
  )
}
