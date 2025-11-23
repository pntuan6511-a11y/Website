'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { formatPhoneNumber } from '@/utils/format'

export default function Footer() {
  const [cars, setCars] = useState<any[]>([])
  const { contactAdmin, getSetting } = useSettings()
  const mst = getSetting('MST_ADMIN')
  const lmst = getSetting('LMST_ADMIN')

  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <footer className="bg-luxury-charcoal text-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo & Company Info */}
          <div>
            <div className="text-2xl font-bold text-white mb-2">Vinfast VFG An Giang</div>
            {/* <h3 className="font-semibold mb-2">Công ty TNHH VinFast VFG An Giang</h3> */}
            <p className="text-gray-400 text-sm text-luxury-cream">
              Đại lý ủy quyền chính thức của VinFast tại An Giang
            </p>
            <div className="space-y-2 text-md text-gray-400 mt-3">
              <p>Địa chỉ: Số 2070, Trần Hưng Đạo, Mỹ Thới, An Giang</p>
              {contactAdmin && <p>Điện thoại: <a href={`tel:${contactAdmin.replace(/\D/g, '')}`} className="hover:text-luxury-gold">{formatPhoneNumber(contactAdmin)}</a></p>}
              {mst && <p><a href={lmst} target='_blank'>MST/MSDN: <span className='text-luxury-gold'>{mst}</span></a></p>}
              {/* <p>Email: info@VFGauto.vn</p> */}
            </div>
          </div>

          {/* Contact Info
          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Địa chỉ: Số 2070, Trần Hưng Đạo, Mỹ Thới, An Giang</p>
              <p>Điện thoại: 0363 789 117</p>
            </div>
          </div> */}

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Sản phẩm</h3>
            <ul className="space-y-2 text-md text-gray-400">
              {cars.slice(0, 5).map((car) => (
                <li key={car.id}>
                  <Link href={`/san-pham/${car.slug}`} className="hover:text-luxury-gold transition-colors">
                    {car.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-md text-gray-400">
              <li>
                <Link href="/" className="hover:text-luxury-gold transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/bang-gia" className="hover:text-luxury-gold transition-colors">
                  Bảng giá
                </Link>
              </li>
              <li>
                <Link href="/tinh-tien-tra-gop" className="hover:text-luxury-gold transition-colors">
                  Tính tiền trả góp
                </Link>
              </li>
              <li>
                <Link href="/du-toan-chi-phi" className="hover:text-luxury-gold transition-colors">
                  Dự toán chi phí
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} VFG Auto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
