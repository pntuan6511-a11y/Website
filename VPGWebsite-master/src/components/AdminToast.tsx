"use client"

import { useEffect } from 'react'

type AdminToastProps = {
    message: string
    visible: boolean
    variant?: 'success' | 'error' | 'warning' | 'info'
    onClose?: () => void
}

export default function AdminToast({ message, visible, variant = 'info', onClose }: AdminToastProps) {
    useEffect(() => {
        if (!visible) return
        const t = setTimeout(() => onClose && onClose(), 3000)
        return () => clearTimeout(t)
    }, [visible, onClose])

    if (!visible) return null

    const variantStyles = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-600 text-white'
    }

    return (
        <div
            style={{ zIndex: 99999 }}
            className="fixed left-1/2 top-4 transform -translate-x-1/2 animate-slide-down"
        >
            <div className={`min-w-[320px] max-w-md rounded-lg shadow-2xl px-6 py-4 flex items-center gap-3 ${variantStyles[variant]}`}>
                {/* Icon */}
                <div className="flex-shrink-0">
                    {variant === 'success' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {variant === 'error' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    {variant === 'warning' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )}
                    {variant === 'info' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>

                {/* Message */}
                <div className="flex-1 font-medium">
                    {message}
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
