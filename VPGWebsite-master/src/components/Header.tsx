'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cars, setCars] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileCarsOpen, setMobileCarsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await fetch('/api/cars')
          if (!res.ok) return
          const data = await res.json()
          if (!mounted) return
          setCars(data)
        } catch (e) {
          // ignore
        }
      })()

    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', onDocClick)

    return () => {
      mounted = false
      document.removeEventListener('click', onDocClick)
    }
  }, [])
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname?.startsWith(href)
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/default/vinfastlogo.png"
              alt="VinFast Logo"
              className="h-12 w-auto"
            />
            {/* <div className="flex flex-col">
              <span className="text-base font-bold text-luxury-charcoal leading-tight">VinFast VPG An Giang</span>
            </div> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-semibold transition-colors ${isActive('/') ? 'text-luxury-gold' : 'text-luxury-charcoal hover:text-luxury-gold'}`}>
              Trang chủ
            </Link>
            <Link href="/bang-gia" className={`font-semibold transition-colors ${isActive('/bang-gia') ? 'text-luxury-gold' : 'text-luxury-charcoal hover:text-luxury-gold'}`}>
              Bảng giá
            </Link>
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(s => !s)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowDropdown(false)
                    return
                  }
                  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setShowDropdown(true)
                    // focus first menu item when opened
                    setTimeout(() => {
                      const first = dropdownRef.current?.querySelector('a') as HTMLAnchorElement | null
                      first?.focus()
                    }, 0)
                  }
                }}
                className={`font-semibold transition-colors flex items-center px-3 py-2 !pl-1 rounded ${showDropdown ? 'text-luxury-gold' : 'text-luxury-charcoal hover:text-luxury-gold'}`}
                aria-expanded={showDropdown}
                aria-haspopup="menu"
              >
                Mẫu xe
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border shadow-md rounded z-50">
                  <ul role="menu" className="py-1">
                    {cars.length === 0 ? (
                      <li className="px-4 py-2 text-sm text-luxury-charcoal">Đang tải...</li>
                    ) : (
                      cars.map((car, idx) => (
                        <li key={car.id} role="none">
                          <Link href={`/san-pham/${car.slug}`} className="block px-4 py-2 text-sm text-luxury-charcoal hover:bg-gray-100 focus:bg-gray-100" role="menuitem" tabIndex={0}>
                            {car.name}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
            <Link href="/tinh-tien-tra-gop" className={`!ml-2 font-semibold transition-colors ${isActive('/tinh-tien-tra-gop') ? 'text-luxury-gold' : 'text-luxury-charcoal hover:text-luxury-gold'}`}>
              Tính tiền trả góp
            </Link>
            <Link href="/du-toan-chi-phi" className={`font-semibold transition-colors ${isActive('/du-toan-chi-phi') ? 'text-luxury-gold' : 'text-luxury-charcoal hover:text-luxury-gold'}`}>
              Dự toán chi phí
            </Link>
            {/* Cars dropdown (click-to-toggle + keyboard access) */}

          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-luxury-charcoal"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Slide-in Panel with animation */}
        <div className="md:hidden">
          <div
            className={`fixed inset-0 z-50 flex transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
          >
            {/* Backdrop */}
            <div onClick={() => setIsMenuOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} />

            {/* Panel (2/3 width) - use translate-x for slide animation */}
            <aside className={`relative ml-auto h-full w-2/3 max-w-[420px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex items-center justify-between p-4 border-b">
               <img
              src="/default/vinfastlogo.png"
              alt="VinFast Logo"
              className="h-6 w-auto"
            />
                <button aria-label="Đóng" onClick={() => setIsMenuOpen(false)} className="text-luxury-charcoal">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 overflow-auto h-[calc(100%-64px)]">
                <nav className="space-y-3">
                  <Link href="/" onClick={() => setIsMenuOpen(false)} className={`block py-2 font-medium transition-colors ${isActive('/') ? 'text-luxury-gold' : 'text-luxury-charcoal hover:text-luxury-gold'}`}>
                    Trang chủ
                  </Link>
                  <Link href="/bang-gia" onClick={() => setIsMenuOpen(false)} className={`block py-2 font-medium transition-colors ${isActive('/bang-gia') ? 'text-luxury-gold' : 'text-luxury-charcoal hover:text-luxury-gold'}`}>
                    Bảng giá
                  </Link>
                  <div className="">
                    <button onClick={() => setMobileCarsOpen(v => !v)} className="w-full text-left py-2 font-medium flex items-center justify-between text-luxury-charcoal hover:text-luxury-gold">
                      <span>Mẫu xe</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileCarsOpen ? 'M6 18L18 6M6 6l12 12' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    </button>
                    {mobileCarsOpen && (
                      <div className="mt-2 space-y-1">
                        {cars.length === 0 ? (
                          <div className="px-4 text-sm text-luxury-charcoal">Đang tải...</div>
                        ) : (
                          cars.map(car => (
                            <Link key={car.id} href={`/san-pham/${car.slug}`} onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-luxury-charcoal hover:bg-gray-100">
                              {car.name}
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <Link href="/tinh-tien-tra-gop" onClick={() => setIsMenuOpen(false)} className={`block py-2 font-medium transition-colors ${isActive('/tinh-tien-tra-gop') ? 'text-luxury-gold' : 'text-luxury-charcoal hover:text-luxury-gold'}`}>
                    Tính tiền trả góp
                  </Link>
                  <Link href="/du-toan-chi-phi" onClick={() => setIsMenuOpen(false)} className={`block py-2 font-medium transition-colors ${isActive('/du-toan-chi-phi') ? 'text-luxury-gold' : 'text-luxury-charcoal hover:text-luxury-gold'}`}>
                    Dự toán chi phí
                  </Link>

                  
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </nav>
    </header>
  )
}
