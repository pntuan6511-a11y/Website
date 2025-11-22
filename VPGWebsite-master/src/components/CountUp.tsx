"use client"

import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  value?: number | null
  duration?: number // milliseconds
  className?: string
}

export default function CountUp({ value, duration = 300, className }: CountUpProps) {
  const [display, setDisplay] = useState<number>(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef<number>(0)

  useEffect(() => {
    if (typeof value !== 'number' || isNaN(value)) {
      setDisplay(0)
      return
    }

    const start = performance.now()
    startRef.current = start
    fromRef.current = display

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(1, elapsed / duration)
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easeInOutQuad-ish
      const current = Math.round(fromRef.current + (value - fromRef.current) * eased)
      setDisplay(current)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      startRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span className={className}>{display}</span>
}
