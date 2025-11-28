'use client'
import { useState, useEffect } from 'react'
import Toast from '@/components/Toast'

interface InterestRate {
    id: string
    rate: number
    label: string | null
    isActive: boolean
    order: number
}

export default function InterestRatesPage() {
    const [rates, setRates] = useState<InterestRate[]>([])
    const [showModal, setShowModal] = useState(false)
    const [editingRate, setEditingRate] = useState<InterestRate | null>(null)
    const [formData, setFormData] = useState({
        rate: '',
        label: '',
        isActive: true,
        order: 0
    })
    const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' as 'info' | 'success' | 'error' | 'warning' })
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        fetchRates()
    }, [])

    const fetchRates = async () => {
        try {
            const res = await fetch('/api/admin/interest-rates')
            const data = await res.json()
            setRates(data)
        } catch (err) {
            setToast({ visible: true, message: 'Không thể tải danh sách lãi suất', variant: 'error' })
        }
    }

    const handleAdd = () => {
        setEditingRate(null)
        setFormData({
            rate: '',
            label: '',
            isActive: true,
            order: rates.length
        })
        setShowModal(true)
    }

    const handleEdit = (rate: InterestRate) => {
        setEditingRate(rate)
        setFormData({
            rate: rate.rate.toString(),
            label: rate.label || '',
            isActive: rate.isActive,
            order: rate.order
        })
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingRate
                ? `/api/admin/interest-rates/${editingRate.id}`
                : '/api/admin/interest-rates'

            const method = editingRate ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rate: parseFloat(formData.rate),
                    label: formData.label || null,
                    isActive: formData.isActive,
                    order: formData.order
                })
            })

            if (!res.ok) throw new Error('Failed to save')

            setToast({
                visible: true,
                message: editingRate ? 'Cập nhật thành công!' : 'Thêm mới thành công!',
                variant: 'success'
            })
            setShowModal(false)
            fetchRates()
        } catch (err) {
            setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/interest-rates/${id}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Failed to delete')

            setToast({ visible: true, message: 'Xóa thành công!', variant: 'success' })
            setDeleteConfirm(null)
            fetchRates()
        } catch (err) {
            setToast({ visible: true, message: 'Có lỗi xảy ra khi xóa', variant: 'error' })
        }
    }

    return (
        <div>
            <Toast
                message={toast.message}
                visible={toast.visible}
                variant={toast.variant}
                onClose={() => setToast({ ...toast, visible: false })}
            />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý lãi suất</h1>
                <button onClick={handleAdd} className="btn-primary">
                    + Thêm lãi suất
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Lãi suất (%)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Nhãn
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Thứ tự
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {rates.map((rate) => (
                            <tr key={rate.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {rate.rate}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {rate.label || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rate.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                        {rate.isActive ? 'Hoạt động' : 'Tắt'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {rate.order}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(rate)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                                    >
                                        Sửa
                                    </button>
                                    {deleteConfirm === rate.id ? (
                                        <span className="inline-flex gap-2">
                                            <button
                                                onClick={() => handleDelete(rate.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                Xác nhận
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                Hủy
                                            </button>
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(rate.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {rates.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Chưa có lãi suất nào. Nhấn "Thêm lãi suất" để bắt đầu.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                {editingRate ? 'Sửa lãi suất' : 'Thêm lãi suất'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Lãi suất (%) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                        className="input-custom w-full"
                                        placeholder="Ví dụ: 6.8"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nhãn (tùy chọn)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        className="input-custom w-full"
                                        placeholder="Ví dụ: Ưu đãi đặc biệt"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Thứ tự hiển thị
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="input-custom w-full"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Kích hoạt
                                        </span>
                                    </label>
                                </div>

                                <div className="flex gap-3">
                                    <button type="submit" className="btn-primary flex-1">
                                        {editingRate ? 'Cập nhật' : 'Thêm mới'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex-1"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
