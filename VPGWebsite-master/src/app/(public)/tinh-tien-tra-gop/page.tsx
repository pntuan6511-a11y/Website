'use client'

import { useEffect, useState } from 'react'

export default function InstallmentCalculatorPage() {
  const [cars, setCars] = useState<any[]>([])
  const [selectedCar, setSelectedCar] = useState<any>(null)
  const [selectedVersion, setSelectedVersion] = useState<any>(null)
  const [loanPercent, setLoanPercent] = useState(80)
  const [years, setYears] = useState(8)
  const [interestRate, setInterestRate] = useState(6.8)
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

  const calculateInstallment = () => {
    if (!selectedVersion) return

    const price = Number(selectedVersion.price)
    const loanAmount = price * (loanPercent / 100)
    const downPayment = price - loanAmount
    const monthlyRate = interestRate / 100 / 12
    const months = years * 12

    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)

    const schedule = []
    let remainingBalance = loanAmount

    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      
      schedule.push({
        month,
        remainingBalance: remainingBalance,
        principalPayment,
        interestPayment,
        total: monthlyPayment
      })

      remainingBalance -= principalPayment
    }

    setResult({
      carPrice: price,
      downPayment,
      loanAmount,
      monthlyPayment,
      totalPayment: monthlyPayment * months,
      totalInterest: (monthlyPayment * months) - loanAmount,
      schedule
    })
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container-custom">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">Tính tiền trả góp</h1>

        <div className="max-w-4xl mx-auto">
          <div className="card-luxury p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="block mb-2 font-medium">Số tiền vay: {loanPercent}%</label>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="10"
                  value={loanPercent}
                  onChange={(e) => setLoanPercent(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>10%</span>
                  <span>80%</span>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Thời gian: {years} năm</label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>1 năm</span>
                  <span>8 năm</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">Lãi suất</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="6.8"
                      checked={interestRate === 6.8}
                      onChange={() => setInterestRate(6.8)}
                      className="mr-2"
                    />
                    6.8%
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="7.9"
                      checked={interestRate === 7.9}
                      onChange={() => setInterestRate(7.9)}
                      className="mr-2"
                    />
                    7.9%
                  </label>
                </div>
              </div>
            </div>

            <button 
              onClick={calculateInstallment}
              disabled={!selectedVersion}
              className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tính biên độ trả góp
            </button>
          </div>

          {result && (
            <div className="space-y-6">
              <div className="card-luxury p-8">
                <h2 className="text-2xl font-bold mb-4">Kết quả</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-600">Giá xe</p>
                    <p className="text-xl font-semibold">{result.carPrice.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Trả trước</p>
                    <p className="text-xl font-semibold">{result.downPayment.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Số tiền vay</p>
                    <p className="text-xl font-semibold">{result.loanAmount.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Trả hàng tháng</p>
                    <p className="text-2xl font-bold text-luxury-gold">{result.monthlyPayment.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tổng lãi suất</p>
                    <p className="text-xl font-semibold">{result.totalInterest.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tổng thanh toán</p>
                    <p className="text-xl font-semibold">{result.totalPayment.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                </div>
              </div>

              <div className="card-luxury p-8">
                <h2 className="text-2xl font-bold mb-4">Lịch trả góp chi tiết</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-luxury-charcoal text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Tháng</th>
                        <th className="px-4 py-3 text-right">Dư nợ đầu kì</th>
                        <th className="px-4 py-3 text-right">Trả gốc</th>
                        <th className="px-4 py-3 text-right">Trả lãi</th>
                        <th className="px-4 py-3 text-right">Gốc + Lãi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row: any, index: number) => (
                        <tr key={row.month} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-2">{row.month}</td>
                          <td className="px-4 py-2 text-right">{row.remainingBalance.toLocaleString('vi-VN')}</td>
                          <td className="px-4 py-2 text-right">{row.principalPayment.toLocaleString('vi-VN')}</td>
                          <td className="px-4 py-2 text-right">{row.interestPayment.toLocaleString('vi-VN')}</td>
                          <td className="px-4 py-2 text-right font-semibold">{row.total.toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
