'use client'
import { useState, useEffect } from 'react'
import Toast from '@/components/Toast'

export default function AdminSettingsPage() {
    const [smtpUser, setSmtpUser] = useState('')
    const [smtpPass, setSmtpPass] = useState('')
    const [sendMail, setSendMail] = useState(true)
    const [contactAdmin, setContactAdmin] = useState('')
    const [mstAdmin, setMstAdmin] = useState('')
    const [lmstAdmin, setLmstAdmin] = useState('')
    const [zaloAdmin, setZaloAdmin] = useState('')
    const [facebookAdmin, setFacebookAdmin] = useState('')
    const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' as 'info' | 'success' | 'error' | 'warning' })

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const usr = data.find((s: any) => s.key === 'SMTP_USER')
                    const pass = data.find((s: any) => s.key === 'SMTP_PASS')
                    const send = data.find((s: any) => s.key === 'SEND_MAIL')
                    const contactA = data.find((s: any) => s.key === 'CONTACT_ADMIN')
                    const mst = data.find((s: any) => s.key === 'MST_ADMIN')
                    const lmst = data.find((s: any) => s.key === 'LMST_ADMIN')
                    const zalo = data.find((s: any) => s.key === 'ZALO_ADMIN')
                    const fb = data.find((s: any) => s.key === 'FACEBOOK_ADMIN')
                    if (usr) setSmtpUser(usr.value)
                    if (pass) setSmtpPass(pass.value)
                    if (send) setSendMail(String(send.value).toLowerCase() === 'true')
                    if (contactA) setContactAdmin(contactA.value)
                    if (mst) setMstAdmin(mst.value)
                    if (lmst) setLmstAdmin(lmst.value)
                    if (zalo) setZaloAdmin(zalo.value)
                    if (fb) setFacebookAdmin(fb.value)
                }
            })
            .catch(() => { })
    }, [])

    const saveSetting = async (key: string, value: string) => {
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            })

            if (!res.ok) {
                throw new Error('Save failed')
            }
        } catch (err) {
            throw err
        }
    }

    const handleSaveAll = async () => {
        try {
            // Save SEND_MAIL first
            await saveSetting('SEND_MAIL', sendMail ? 'true' : 'false')
            if (sendMail) {
                await saveSetting('SMTP_USER', smtpUser)
                await saveSetting('SMTP_PASS', smtpPass)
            }
            // Save contact fields
            await saveSetting('CONTACT_ADMIN', contactAdmin)
            await saveSetting('MST_ADMIN', mstAdmin)
            await saveSetting('ZALO_ADMIN', zaloAdmin)
            await saveSetting('FACEBOOK_ADMIN', facebookAdmin)

            // Show success toast
            setToast({ visible: true, message: 'Lưu cấu hình thành công!', variant: 'success' })
        } catch (err) {
            setToast({ visible: true, message: 'Có lỗi xảy ra khi lưu', variant: 'error' })
        }
    }

    return (
        <div>
            <Toast message={toast.message} visible={toast.visible} variant={toast.variant} onClose={() => setToast({ ...toast, visible: false })} />
            <h1 className="text-3xl font-bold mb-6">Cấu hình</h1>

            <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                <div className="mb-4 flex items-center gap-3">
                    <label className="block text-sm font-medium text-gray-700">Gửi email</label>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={sendMail} onChange={(e) => setSendMail(e.target.checked)} className="sr-only" />
                        <span className={`w-11 h-6 flex items-center bg-gray-200 rounded-full p-1 transition-colors ${sendMail ? 'bg-green-500' : ''}`}>
                            <span className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${sendMail ? 'translate-x-5' : ''}`} />
                        </span>
                    </label>
                </div>
                {sendMail && (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản nhận email (SMTP_USER)</label>
                            <input type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="input-custom w-full" disabled={!sendMail} />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu SMTP (SMTP_PASS)</label>
                            <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} className="input-custom w-full" disabled={!sendMail} />
                            <p className='text-sm text-gray-600'>Truy cập vào tài khoản Google của mình (Đã xác thực 2 lớp), vào mục "Bảo mật", tìm phần "Mật khẩu ứng dụng" để tạo một mật khẩu riêng cho việc này</p>

                        </div>
                    </>
                )}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại quản trị (CONTACT_ADMIN)</label>
                    <input type="text" value={contactAdmin} onChange={(e) => setContactAdmin(e.target.value)} className="input-custom w-full" />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">MST/ mã số thuế (MST_ADMIN)</label>
                    <input type="text" value={mstAdmin} onChange={(e) => setMstAdmin(e.target.value)} className="input-custom w-full" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link MST/ mã số thuế (LMST_ADMIN)</label>
                    <input type="text" value={lmstAdmin} onChange={(e) => setLmstAdmin(e.target.value)} className="input-custom w-full" />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiktok quản trị (Tiktok_ADMIN)</label>
                    <input type="text" value={zaloAdmin} onChange={(e) => setZaloAdmin(e.target.value)} className="input-custom w-full" />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook quản trị (FACEBOOK_ADMIN)</label>
                    <input type="text" value={facebookAdmin} onChange={(e) => setFacebookAdmin(e.target.value)} className="input-custom w-full" />
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleSaveAll} className="btn-primary">Lưu</button>
                </div>
            </div>
        </div>
    )
}
