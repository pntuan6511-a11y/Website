"use client"

import { useEffect } from 'react'

type ToastProps = {
  message: string
  visible: boolean
  variant?: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
}

export default function Toast({ message, visible, variant = 'info', onClose }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => onClose && onClose(), 3000)
    return () => clearTimeout(t)
  }, [visible, onClose])

  return (
    <div
      className={`fixed left-1/2 top-4 z-50 transform -translate-x-1/2 transition-all duration-300 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'
      }`}
    >
      <div className={`min-w-[280px] rounded-md shadow-lg px-4 py-3 text-sm ${
        variant === 'success' ? 'bg-blue-600 text-white' : variant === 'error' ? 'bg-red-600 text-white' : variant === 'warning' ? 'bg-yellow-500 text-black' : 'bg-luxury-charcoal text-white'
      }`}>
        {message}
      </div>
    </div>
  )
}
