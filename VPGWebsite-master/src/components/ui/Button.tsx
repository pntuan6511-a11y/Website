"use client"

import React from 'react'
import clsx from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost' | 'danger'
}

export default function Button({ variant = 'default', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
