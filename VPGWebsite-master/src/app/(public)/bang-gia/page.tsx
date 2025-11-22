"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Toast from '@/components/Toast'
import { TagLabels, TAG_META } from '@/lib/constants'

export default function BangGiaPage() {
  const [cars, setCars] = useState<any[]>([])
  const [showTestDriveModal, setShowTestDriveModal] = useState(false)
  const [selectedCar, setSelectedCar] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })

  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.error(err))
  }, [])

  const handleTestDrive = (car: any) => {
    setSelectedCar(car)
    setShowTestDriveModal(true)
  }

  const handleSubmitTestDrive = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const data = {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      carId: selectedCar.id,
      carName: selectedCar.name,
      testDate: formData.get('testDate')
    }

    try {
      const res = await fetch('/api/test-drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setToast({ visible: true, message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm.' })
        setShowTestDriveModal(false)
      } else {
        setToast({ visible: true, message: 'Có lỗi xảy ra, vui lòng thử lại.' })
      }
    } catch (error) {
      setToast({ visible: true, message: 'Có lỗi xảy ra, vui lòng thử lại.' })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="py-16 bg-gray-50">
      <Toast message={toast.message} visible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
      <div className="container-custom">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">Bảng giá xe VinFast</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => {
            const mainImage = car.images?.find((img: any) => img.imageType === 'main')?.imageUrl || car.mainImage
            return (
            <div key={car.id} className="card-luxury overflow-hidden relative">
              {car.tag && TAG_META[car.tag] ? (
                (() => {
                  const meta = TAG_META[car.tag]
                  return (
                    <div className={`absolute top-3 right-3 ${meta.colorClass} px-3 py-1 rounded text-sm font-semibold z-10 flex items-center gap-2`}>
                      {/* {meta.icon === 'hot' && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v6"/><path d="M6 8c0 4 6 6 6 12"/></svg>
                      )}
                      {meta.icon === 'new' && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/></svg>
                      )}
                      {meta.icon === 'sale' && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12l9 9 9-9-9-9-9 9z"/></svg>
                      )} */}
                      <span>{meta.label}</span>
                    </div>
                  )
                })()
              ) : null}
              {mainImage && (
                <div className="relative h-64">
                  <Image
                    src={mainImage}
                    alt={car.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{car.name}</h2>
                
                {/* Versions List */}
                {car.versions && car.versions.length > 0 && (
                  <div className="mb-6 space-y-3">
                    {car.versions.map((version: any) => (
                      <div key={version.id} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-0">
                        <span className="text-sm text-gray-700 flex-1">{version.name}</span>
                        <span className="text-luxury-gold font-semibold text-sm ml-2 whitespace-nowrap">
                          {Number(version.price).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/du-toan-chi-phi" className="btn-outline text-center flex-1">
                    Dự toán chi phí
                  </Link>
                    <button 
                      onClick={() => handleTestDrive(car)}
                      className="btn-primary flex-1"
                    >
                      Đăng ký lái thử
                    </button>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* Test Drive Modal */}
      {showTestDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Đăng ký lái thử {selectedCar?.name}</h3>
            <form onSubmit={handleSubmitTestDrive}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Họ tên</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="input-custom"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="input-custom"
                  placeholder="0123 456 789"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium">Ngày lái thử</label>
                <input
                  type="date"
                  name="testDate"
                  required
                  className="input-custom"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTestDriveModal(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center">
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    'Đăng ký'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
