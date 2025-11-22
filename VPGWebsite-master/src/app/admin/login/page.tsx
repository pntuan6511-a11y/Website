'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const result = await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirect: false
    })

    if (result?.error) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-luxury-charcoal">Đăng nhập Admin</h1>
          <p className="mt-2 text-gray-600">VPG Auto Management</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                required
                className="input-custom"
                placeholder="admin"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Mật khẩu</label>
              <input
                type="password"
                name="password"
                required
                className="input-custom"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
