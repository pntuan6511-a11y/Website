"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Toast from '@/components/Toast'

export default function PriceQuotePopup() {
  const pathname = usePathname()

  // If pathname is not yet available on first render, avoid mounting popup (prevents transient overlays)
  if (!pathname) return null

  // Do not render site-wide popup inside admin pages
  if (pathname.startsWith('/admin')) return null

  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const [contactAdmin, setContactAdmin] = useState('')
  const [cars, setCars] = useState<any[]>([])

  useEffect(() => {
    const key = 'priceQuoteDismissedAt'
    const saved = globalThis.sessionStorage?.getItem(key)
    if (saved) {
      const ts = parseInt(saved, 10)
      if (!isNaN(ts)) {
        const diff = Date.now() - ts
        if (diff < 3 * 60 * 1000) { // less than 3 minutes
          setDismissed(true)
          return
        }
      }
    }

    const t = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const contactA = data.find((s: any) => s.key === 'CONTACT_ADMIN')
          setContactAdmin(contactA?.value || '')
        }
      })
      .catch(() => {})

    // fetch a list of cars (small payload expected)
    fetch('/api/cars')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCars(data)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = new FormData(e.currentTarget)
    const carId = form.get('carId')
    const car = cars.find((c: any) => String(c.id) === String(carId))

    const payload = {
      fullName: form.get('fullName'),
      phone: form.get('phone'),
      carId: car?.id || null,
      carName: car?.name || null,
      versionId: form.get('versionId') || null,
      versionName: form.get('versionName') || null,
      paymentType: form.get('paymentType')
    }

    try {
      const res = await fetch('/api/price-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setToast({ visible: true, message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm.' })
        setShow(false)
        globalThis.sessionStorage?.setItem('priceQuoteDismissedAt', String(Date.now()))
      } else {
        setToast({ visible: true, message: 'Có lỗi xảy ra, vui lòng thử lại.' })
      }
    } catch (err) {
      setToast({ visible: true, message: 'Có lỗi xảy ra, vui lòng thử lại.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!show || dismissed) return null

  return (
    <div>
      <Toast message={toast.message} visible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full">
          <h3 className="text-xl font-bold mb-4">Nhận báo giá</h3>
          <form onSubmit={handleSubmit}>
            <div className="text-sm text-gray-700 mb-4">Quý khách vui lòng liên hệ 
              {contactAdmin ? (
                <a href={`tel:${contactAdmin}`} className="text-red-500 font-semibold px-2 py-0.5 rounded-sm">{contactAdmin}</a>
              ) : (
                ' quản trị viên '
              )}hoặc điền vào biểu mẫu dưới đây.
            </div>
            <div className="mb-2">
              <label className="block mb-1">Họ tên</label>
              <input name="fullName" required className="input-custom" />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Số điện thoại</label>
              <input name="phone" type="tel" required className="input-custom" />
            </div>

            <div className="mb-2">
              <label className="block mb-1">Chọn mẫu xe (tùy chọn)</label>
              <select name="carId" className="input-custom">
                <option value="">-- Chọn xe --</option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block mb-1">Hình thức thanh toán</label>
              <select name="paymentType" required className="input-custom">
                <option value="full">Trả hết</option>
                <option value="installment">Trả góp</option>
              </select>
            </div>

            

            <div className="flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => { setShow(false); setDismissed(true); globalThis.sessionStorage?.setItem('priceQuoteDismissedAt', String(Date.now())) }}>Hủy</button>
              <button type="submit" className="btn-primary flex-1">{isSubmitting ? 'Đang gửi...' : 'Gửi'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
