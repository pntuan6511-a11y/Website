'use client'

import { useEffect, useState } from 'react'

export default function CostEstimatorPage() {
  const [cars, setCars] = useState<any[]>([])
  const [selectedCar, setSelectedCar] = useState<any>(null)
  const [selectedVersion, setSelectedVersion] = useState<any>(null)
  const [registrationLocation, setRegistrationLocation] = useState('')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.error(err))
  }, [])

  const handleCarChange = (carId: string) => {
    const car = cars.find(c => c.id === carId)
    setSelectedCar(car)
    setSelectedVersion(null)
    setResult(null)
  }

  const handleVersionChange = (versionId: string) => {
    const version = selectedCar?.versions.find((v: any) => v.id === versionId)
    setSelectedVersion(version)
    setResult(null)
  }

  const calculateCost = () => {
    if (!selectedVersion || !registrationLocation) return

    const price = Number(selectedVersion.price)

    // Các chi phí ước tính (có thể điều chỉnh)
    const registrationFee = price * 0.02 // 2% giá xe
    const licensePlateFee = 20000000 // 20 triệu (ước tính)
    const insurance = price * 0.015 // 1.5% giá xe
    const roadMaintenanceFee = 1560000 // Phí bảo trì đường bộ năm
    const registrationCertificateFee = 2000000 // Phí đăng kiểm

    const totalCost = price + registrationFee + licensePlateFee + insurance + roadMaintenanceFee + registrationCertificateFee

    setResult({
      carPrice: price,
      registrationFee,
      licensePlateFee,
      insurance,
      roadMaintenanceFee,
      registrationCertificateFee,
      totalCost
    })
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container-custom">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">Dự toán chi phí</h1>

        <div className="max-w-2xl mx-auto">
          <div className="card-luxury p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium">Chọn mẫu xe</label>
                <select
                  className="input-custom"
                  onChange={(e) => handleCarChange(e.target.value)}
                  value={selectedCar?.id || ''}
                >
                  <option value="">-- Chọn mẫu xe --</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>{car.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Chọn phiên bản</label>
                <select
                  className="input-custom"
                  onChange={(e) => handleVersionChange(e.target.value)}
                  value={selectedVersion?.id || ''}
                  disabled={!selectedCar}
                >
                  <option value="">-- Chọn phiên bản --</option>
                  {selectedCar?.versions?.map((version: any) => (
                    <option key={version.id} value={version.id}>
                      {version.name} - {Number(version.price).toLocaleString('vi-VN')} VNĐ
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Nơi đăng ký</label>
                <select
                  className="input-custom"
                  onChange={(e) => setRegistrationLocation(e.target.value)}
                  value={registrationLocation}
                >
                  <option value="">-- Chọn nơi đăng ký --</option>
                  {[
                    'An Giang', 'Đồng Tháp', 'Cần Thơ', 'Hậu Giang', 'Sóc Trăng',
                    'Bạc Liêu', 'Cà Mau', 'Vĩnh Long', 'Bến Tre', 'Trà Vinh',
                    'Tiền Giang', 'Long An', 'Kiên Giang'
                  ].map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={calculateCost}
                disabled={!selectedVersion || !registrationLocation}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tính chi phí
              </button>
            </div>
          </div>

          {result && (
            <div className="card-luxury p-8">
              <h2 className="text-2xl font-bold mb-6">Chi phí dự toán</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Giá xe</span>
                  <span className="font-semibold">{result.carPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Phí trước bạ (2%)</span>
                  <span className="font-semibold">{result.registrationFee.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Phí biển số</span>
                  <span className="font-semibold">{result.licensePlateFee.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Bảo hiểm (1.5%)</span>
                  <span className="font-semibold">{result.insurance.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Phí bảo trì đường bộ</span>
                  <span className="font-semibold">{result.roadMaintenanceFee.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Phí đăng kiểm</span>
                  <span className="font-semibold">{result.registrationCertificateFee.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-luxury-gold">
                  <span className="text-xl font-bold">Tổng chi phí</span>
                  <span className="text-2xl font-bold text-luxury-gold">{result.totalCost.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                * Các chi phí trên chỉ mang tính chất tham khảo và có thể thay đổi tùy theo từng khu vực.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
