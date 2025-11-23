'use client'

import { useEffect, useState } from 'react'
import { TagLabels, TAG_META } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [cars, setCars] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [siteBanners, setSiteBanners] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentCustomerSlide, setCurrentCustomerSlide] = useState(0)

  // compute how many customer items are visible per viewport width
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 1
    const w = window.innerWidth
    if (w >= 1024) return 3 // lg
    if (w >= 768) return 2 // md
    return 1 // sm
  }

  const [visibleCount, setVisibleCount] = useState(1)

  useEffect(() => {
    const onResize = () => setVisibleCount(getVisibleCount())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.error(err))

    fetch('/api/car-images')
      .then(res => res.json())
      .then(data => {
        // site banners are car images with imageType 'banner' and no carId
        const banners = (data || []).filter((img: any) => img.imageType === 'banner' && !img.carId)
        setSiteBanners(banners)
      })
      .catch(err => console.error(err))

    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(siteBanners.length, 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [siteBanners.length])

  useEffect(() => {
    if (customers.length === 0) return

    const maxIndex = Math.max(0, customers.length - visibleCount)
    // clamp current slide when visibleCount or customers change
    setCurrentCustomerSlide((prev) => Math.min(prev, maxIndex))

    if (maxIndex === 0) return

    const timer = setInterval(() => {
      setCurrentCustomerSlide((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, 3000)

    return () => clearInterval(timer)
  }, [customers.length, visibleCount])

  return (
    <div>
      {/* Hero Banner Slider */}
      <section className="relative bg-gray-900">
        {siteBanners.length > 0 && (
          <div className="w-full max-w-full mx-auto ">
            <div className="relative aspect-[16/9] mx-auto overflow-hidden ">
              {siteBanners.map((item: any, index: number) => {
                const bannerImage = item.imageUrl
                return (
                  <div
                    key={item.id || index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                    {bannerImage && (
                      <Image
                        src={bannerImage}
                        alt={item.name || 'Banner'}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    )}
                    {/* <div className="absolute inset-0 bg-black bg-opacity-40" /> */}
                  </div>
                )
              })}

              {/* Slider dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                {siteBanners.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-luxury-gold w-8' : 'bg-white bg-opacity-50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="py-4 md:py-10 bg-gradient-to-r from-luxury-charcoal to-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
            <Link href="/bang-gia" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg py-1 px-2 md:py-3 md:px-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20 h-full md:min-h-[180px]">
                <div className="w-6 h-6 md:w-16 md:h-16 bg-luxury-gold hidden md:flex rounded-full flex items-center justify-center mx-auto mb-1 md:mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 md:w-8 md:h-8 text-white " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">YÊU CẦU BÁO GIÁ</h3>
                <p className="text-gray-300 text-sm">Nhận báo giá chi tiết và ưu đãi tốt nhất</p>
              </div>
            </Link>

            <Link href="/tinh-tien-tra-gop" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg py-1 px-2 md:py-3 md:px-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20 h-full md:min-h-[180px]">
                <div className="w-6 h-6 md:w-16 md:h-16 bg-luxury-gold hidden md:flex rounded-full flex items-center justify-center mx-auto mb-1 md:mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 md:w-8 md:h-8 text-white " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">ƯỚC TÍNH TRẢ GÓP</h3>
                <p className="text-gray-300 text-sm">Tính toán chi phí trả góp dễ dàng</p>
              </div>
            </Link>

            <Link href="/bang-gia" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg py-1 px-2 md:py-3 md:px-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20 h-full md:min-h-[180px]">
                <div className="w-6 h-6 md:w-16 md:h-16 bg-luxury-gold hidden md:flex rounded-full flex items-center justify-center mx-auto mb-1 md:mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 md:w-8 md:h-8 text-white " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">ĐĂNG KÝ LÁI THỬ</h3>
                <p className="text-gray-300 text-sm">Trải nghiệm xe miễn phí tại showroom</p>
              </div>
            </Link>
          </div>
        </div>
      </section>



      {/* Cars List */}
      <section className="py-8 md:py-10 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Dòng xe VinFast</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8">
            {cars.map((car) => {
              const mainImage = car.images?.find((img: any) => img.imageType === 'main')?.imageUrl || car.mainImage
              return (
                <Link key={car.id} href={`/san-pham/${car.slug}`}>
                  <div className="card-luxury overflow-hidden group rounded-md relative">
                    {car.tag && TAG_META[car.tag] ? (
                      (() => {
                        const meta = TAG_META[car.tag]
                        return (
                          <div className={`absolute top-3 right-3 ${meta.colorClass} px-3 py-1 rounded text-sm font-semibold z-10 flex items-center gap-2`}>
                            {/* simple icons */}
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
                    {/* {car.tag && (
                      <div className="absolute top-3 right-3 bg-luxury-gold text-white px-3 py-1 rounded text-sm font-semibold z-10">
                        {TagLabels[car.tag] || 'Tag'}
                      </div>
                    )} */}
                    {mainImage && (
                      <div className="relative overflow-hidden aspect-[16/9] w-full">
                        <Image
                          src={mainImage}
                          alt={car.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300 !h-auto"
                        />
                      </div>
                    )}
                    <div className="py-2 px-3 md:p-3 text-center">
                      <h3 className="text-lg md:text-2xl font-bold mb-0 text-[#666600]">{car.name}</h3>
                      {car.versions && car.versions.length > 0 && (
                        <p className="text-lg text-luxury-gold md:text-xl font-semibold">
                          {Number(car.versions[0].price).toLocaleString('vi-VN')} VNĐ
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-luxury-charcoal">
                TẠI SAO NÊN MUA XE VỚI VINFAST AN GIANG?
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1 text-luxury-charcoal">GIÁ XE TỐT NHẤT</h3>
                    <p className="text-sm text-gray-600">
                      Chúng tôi luôn cam kết mang lại mức giá tốt nhất thị trường cho quý khách, cùng với sự tư vấn tận tâm, chuyên nghiệp nhất.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1 text-luxury-charcoal">TƯ VẤN TẬN TÌNH</h3>
                    <p className="text-sm text-gray-600">
                      Với kinh nghiệm nhiều năm bán xe Ô tô VinFast, Chúng tôi tin sẽ giúp quý khách chọn được chiếc xe ưng ý và phù hợp nhất cho bản thân và gia đình.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1 text-luxury-charcoal">HỖ TRỢ TRẢ GÓP</h3>
                    <p className="text-sm text-gray-600">
                      Chúng tôi sẽ giúp Quý khách lựa chọn được cách trả góp với lãi suất cạnh tranh nhất. Phương thức thanh toán tiện lợi với hệ thống ngân hàng tốt nhất.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1 text-luxury-charcoal">KHUYẾN MÃI NHIỀU NHẤT</h3>
                    <p className="text-sm text-gray-600">
                      Với hoạt động bán hàng sôi nổi, chúng tôi luôn cập nhật sớm nhất các chương trình khuyến mãi của hãng và đại lý.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl aspect-[16/9]">
              <Image
                src="/default/dai-ly.webp"
                alt="VinFast An Giang"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Customers Slider */}
      {customers.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Khách hàng của chúng tôi</h2>
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentCustomerSlide * (100 / Math.max(visibleCount, 1))}%)`
                }}
              >
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
                  >
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow h-full">
                      {customer.imageUrl && (
                        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                          <Image
                            src={customer.imageUrl}
                            alt={customer.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <p className="text-center font-medium text-lg">{customer.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider dots */}
              {/* compute dots based on visible count and number of pages */}
              {customers.length > visibleCount && (
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: Math.max(1, customers.length - visibleCount + 1) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCustomerSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${index === currentCustomerSlide ? 'bg-luxury-gold w-8' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
