'use client'

import { useEffect, useState } from 'react'

export default function ContactBubbles() {
  const [contact, setContact] = useState({ contactAdmin: '', zalo: '', facebook: '' })

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const contactA = data.find((s: any) => s.key === 'CONTACT_ADMIN')
          const zalo = data.find((s: any) => s.key === 'ZALO_ADMIN')
          const fb = data.find((s: any) => s.key === 'FACEBOOK_ADMIN')
          setContact({
            contactAdmin: contactA?.value || '',
            zalo: zalo?.value || '',
            facebook: fb?.value || ''
          })
        }
      })
      .catch(() => { })
  }, [])

  const items: { key: string; value: string; href?: string; bg: string; icon: React.ReactNode; target?: string }[] = []



  if (contact.zalo) {
    const digits = contact.zalo
    items.push({
      key: 'zalo',
      value: contact.zalo,
      href: digits ? digits : undefined,
      bg: 'bg-blue-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <path d="M12 3C7 3 3 6.8 3 11c0 2.3 1.1 4.4 3 5.9V21l3.1-1.7c1 .3 2.1.5 3.3.5 5 0 9-3.8 9-8.5S17 3 12 3z" />
        </svg>
      ),
      target: '_blank'
    })
  }

  if (contact.facebook) {
    const raw = contact.facebook
    items.push({
      key: 'facebook',
      value: contact.facebook,
      href: raw,
      bg: 'bg-sky-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <path d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      target: '_blank'
    })
  }
  if (contact.contactAdmin) {
    const tel = contact.contactAdmin
    items.push({
      key: 'contact',
      value: contact.contactAdmin,
      href: `tel:${tel}`,
      bg: 'bg-[red]',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12.96.48 1.87 1.06 2.65a2 2 0 0 1-.45 2.54L9.91 11.09a14.05 14.05 0 0 0 4 4l1.18-1.18a2 2 0 0 1 2.54-.45c.78.58 1.69.94 2.65 1.06A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    })
  }

  return (
    <div className="fixed left-4 bottom-4 z-40 flex flex-col gap-5">
      {items.map((it, idx) => {
        if (!it.value) return null
        const delay = `${idx * 160}ms`
        const props: any = {
          className: `${it.bg} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 relative`,
          'aria-label': it.key,
          style: { transformOrigin: 'center', zIndex: 10 }
        }
        if (it.target) {
          props.target = it.target
          props.rel = 'noreferrer'
        }

        const haloColor = it.bg.includes('red')
          ? 'rgba(255, 56, 56, 0.28)'
          : it.bg.includes('blue-500')
            ? 'rgba(59,130,246,0.22)'
            : it.bg.includes('sky-600')
              ? 'rgba(14,165,233,0.22)'
              : 'rgba(255,255,255,0.18)'

        const ringStyle: any = {
          position: 'absolute',
          left: '-8px',
          top: '-8px',
          width: 'calc(100% + 16px)',
          height: 'calc(100% + 16px)',
          borderRadius: '9999px',
          pointerEvents: 'none',
          border: `2px solid ${haloColor}`,
          boxSizing: 'border-box',
          transformOrigin: 'center',
          animation: `outerPulse 1.6s ${delay} infinite ease-in-out`,
          backgroundColor: haloColor
        }

        return (
          <div key={it.key} className="relative flex items-center" style={{ zIndex: 10 }}>
            <a href={it.href} {...props}>
              <span style={ringStyle} />
              <span style={{ display: 'inline-block', animation: `shake 1.2s ${delay} infinite ease-in-out` }}>{it.icon}</span>
            </a>
            {it.key === 'contact' ? (
              <span style={{ backgroundColor: "red" }} className="-ml-3  px-3 py-2 pl-6 rounded-r-full text-sm bg-white/95 text-white shadow-sm max-w-xs truncate card-luxury">
                {it.value}
              </span>
            ) : null}
          </div>
        )
      })}

      <style jsx>{`
        @keyframes outerPulse {
          0% {
              -webkit-transform: scale3d(1, 1, 1);
              transform: scale3d(1, 1, 1);
          }
          50% {
              -webkit-transform: scale3d(1.05, 1.05, 1.05);
              transform: scale3d(1.05, 1.05, 1.05);
          }
          100% {
              -webkit-transform: scale3d(1, 1, 1);
              transform: scale3d(1, 1, 1);
          }
        }

        @keyframes shake {
          0% { transform: rotate(-12deg) translateY(0); }
          15% { transform: rotate(14deg) translateY(-3px); }
          30% { transform: rotate(-10deg) translateY(0); }
          50% { transform: rotate(10deg) translateY(-2px); }
          70% { transform: rotate(-6deg) translateY(0); }
          85% { transform: rotate(6deg) translateY(-1px); }
          100% { transform: rotate(-12deg) translateY(0); }
        }
      `}</style>
    </div>
  )
}
