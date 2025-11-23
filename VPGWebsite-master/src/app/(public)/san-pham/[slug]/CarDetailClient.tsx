'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Toast from '@/components/Toast'
import { useSettings } from '@/context/SettingsContext'
import { formatPhoneNumber } from '@/utils/format'

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

// LightGallery imports
import LightGallery from 'lightgallery/react'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lg-thumbnail.css'

interface CarDetailClientProps {
  car: any
}

export default function CarDetailClient({ car }: CarDetailClientProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null)
  const [showPriceQuoteModal, setShowPriceQuoteModal] = useState(false)
  const [showTestDriveModal, setShowTestDriveModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const [dismissedPopup, setDismissedPopup] = useState(false)
  const { contactAdmin } = useSettings()

  const handlePriceQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    const selectedVersionId = formData.get('versionId')
    const version = car.versions?.find((v: any) => String(v.id) === String(selectedVersionId))

    const data = {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      carId: car.id,
      carName: car.name,
      versionId: version?.id || null,
      versionName: version?.name || null,
      paymentType: formData.get('paymentType')
    }

    try {
      const res = await fetch('/api/price-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setToast({ visible: true, message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm.' })
        setShowPriceQuoteModal(false)
      } else {
        setToast({ visible: true, message: 'Có lỗi xảy ra, vui lòng thử lại.' })
      }
    } catch (error) {
      setToast({ visible: true, message: 'Có lỗi xảy ra, vui lòng thử lại.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // useEffect(() => {
  //   if (dismissedPopup || showPriceQuoteModal) return
  //   const t = setTimeout(() => {
  //     setShowPriceQuoteModal(true)
  //   }, 5000)
  //   return () => clearTimeout(t)
  // }, [dismissedPopup, showPriceQuoteModal])

  const handleTestDrive = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    const data = {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      carId: car.id,
      carName: car.name,
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const galleryImages = car.images?.filter((img: any) => img.imageType === 'gallery') || []
  const mainImage = car.images?.find((img: any) => img.imageType === 'main')?.imageUrl || car.mainImage
  const images = galleryImages.length > 0 ? galleryImages : (mainImage ? [{ imageUrl: mainImage }] : [])

  return (
    <div className="py-16">
      <Toast message={toast.message} visible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Slider */}
          {/* Image Slider */}
          <div>
            {images.length > 0 && (
              <>
                <LightGallery
                  speed={500}
                  plugins={[lgThumbnail, lgZoom]}
                  elementClassNames=""
                  selector=".gallery-item"
                >
                  <Swiper
                    spaceBetween={10}
                    navigation={{
                      nextEl: '.swiper-button-next-custom',
                      prevEl: '.swiper-button-prev-custom',
                    }}
                    autoplay={{
                      delay: 2500,
                      disableOnInteraction: false,
                    }}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    modules={[FreeMode, Navigation, Thumbs, Autoplay]}
                    className="h-96 mb-4 rounded-lg group relative"
                  >
                    {images.map((img: any, index: number) => (
                      <SwiperSlide key={index}>
                        <a
                          href={img.imageUrl}
                          data-src={img.imageUrl}
                          className="gallery-item block relative w-full h-full cursor-zoom-in"
                        >
                          <Image
                            src={img.imageUrl}
                            alt={`${car.name} ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        </a>
                      </SwiperSlide>
                    ))}

                    {/* Custom Navigation Buttons */}
                    <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all text-luxury-charcoal opacity-0 group-hover:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </div>
                    <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all text-luxury-charcoal opacity-0 group-hover:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </Swiper>
                </LightGallery>

                {images.length > 1 && (
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={4}
                    freeMode={true}
                    autoplay={{
                      delay: 2500,
                      disableOnInteraction: false,
                    }}
                    watchSlidesProgress={true}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="thumbs-swiper h-24"
                  >
                    {images.map((img: any, index: number) => (
                      <SwiperSlide key={index}>
                        <div className="relative w-full h-full cursor-pointer rounded-md overflow-hidden max-w-[120px] lg:max-w-[150px]">
                          <Image
                            src={img.imageUrl}
                            alt={`${car.name} thumb ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </>
            )}
          </div>

          {/* Car Info */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{car.name}</h1>
            {car.versions && car.versions.length > 0 && (
              <p className="text-3xl text-luxury-gold font-bold mb-6">
                Từ {Number(car.versions[0].price).toLocaleString('vi-VN')} VNĐ
              </p>
            )}

            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setShowPriceQuoteModal(true)}
                className="btn-primary flex-1"
              >
                Nhận báo giá
              </button>
              <button
                onClick={() => setShowTestDriveModal(true)}
                className="btn-outline flex-1"
              >
                Đăng ký lái thử
              </button>
            </div>
            {car.versions && car.versions.length > 0 && (
              <div className="mb-12 lg:hidden">
                <h2 className="text-3xl font-bold mb-6">Bảng giá các phiên bản</h2>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
                    <thead className="bg-luxury-charcoal text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xl">Phiên bản</th>
                        <th className="px-6 py-4 text-right text-xl">Giá (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="[&>tr:nth-child(even)]:bg-[#f2f2f2]">
                      {car.versions.map((version: any, index: number) => (
                        <tr key={version.id}>
                          <td className="px-6 py-4 text-xl">{version.name}</td>
                          <td className="px-6 py-4 text-right font-semibold text-luxury-gold text-xl">
                            {Number(version.price).toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {car.description && (
              <div className="mb-6">
                <p className="text-gray-700">{car.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Versions Table */}
        {car.versions && car.versions.length > 0 && (
          <div className="mb-12 hidden lg:block">
            <h2 className="text-3xl font-bold mb-6">Bảng giá các phiên bản</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-luxury-charcoal text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Phiên bản</th>
                    <th className="px-6 py-4 text-right">Giá (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className=" [&>tr:nth-child(even)]:bg-[#f2f2f2]">
                  {car.versions.map((version: any, index: number) => (
                    <tr key={version.id}>
                      <td className="px-6 py-4">{version.name}</td>
                      <td className="px-6 py-4 text-right font-semibold text-luxury-gold">
                        {Number(version.price).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Article */}
        {car.article && (
          <div className="prose max-w-none">
            <h2 className="text-3xl font-bold mb-6">Giới thiệu</h2>
            <div dangerouslySetInnerHTML={{ __html: car.article }} />
          </div>
        )}
      </div>

      {/* Price Quote Modal */}
      {showPriceQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Nhận báo giá {car.name}</h3>
            <form onSubmit={handlePriceQuote}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Họ tên</label>
                <input type="text" name="fullName" required className="input-custom" />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Số điện thoại</label>
                <input type="tel" name="phone" required className="input-custom" />
              </div>

              {car.versions && car.versions.length > 0 && (
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Chọn mẫu xe</label>
                  <select name="versionId" className="input-custom">
                    <option value="">-- Chọn phiên bản (mặc định: {car.versions[0].name}) --</option>
                    {car.versions.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name} - {Number(v.price).toLocaleString('vi-VN')} VNĐ</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label className="block mb-2 font-medium">Hình thức thanh toán</label>
                <select name="paymentType" required className="input-custom">
                  <option value="full">Trả hết</option>
                  <option value="installment">Trả góp</option>
                </select>
              </div>

              <div className="mb-4 text-sm text-gray-700">
                Quý khách vui lòng liên hệ {contactAdmin ? <a href={`tel:${contactAdmin.replace(/\D/g, '')}`} className="font-bold text-luxury-gold hover:underline">{formatPhoneNumber(contactAdmin)}</a> : 'quản trị viên'} hoặc điền vào biểu mẫu dưới đây.
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowPriceQuoteModal(false); setDismissedPopup(true); }}
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
                    'Gửi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Drive Modal */}
      {showTestDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Đăng ký lái thử {car.name}</h3>
            <form onSubmit={handleTestDrive}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Họ tên</label>
                <input type="text" name="fullName" required className="input-custom" />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Số điện thoại</label>
                <input type="tel" name="phone" required className="input-custom" />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium">Ngày lái thử</label>
                <input type="date" name="testDate" required className="input-custom" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowTestDriveModal(false)} className="btn-secondary flex-1">
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
