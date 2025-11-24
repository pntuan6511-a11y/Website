'use client'

import React, { useState, useEffect } from 'react'

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string | number
    onChange: (value: string) => void
    className?: string
}

export default function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('')

    // Format number with commas
    const formatNumber = (num: string) => {
        return num.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    useEffect(() => {
        if (value !== undefined && value !== null) {
            setDisplayValue(formatNumber(value.toString()))
        } else {
            setDisplayValue('')
        }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '')

        // Only allow numbers
        if (!/^\d*$/.test(rawValue)) return

        setDisplayValue(formatNumber(rawValue))
        onChange(rawValue)
    }

    return (
        <input
            {...props}
            type="text"
            value={displayValue}
            onChange={handleChange}
            className={className}
        />
    )
}
