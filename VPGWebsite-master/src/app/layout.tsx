import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './critical.css'
import './components.css'
// Quill editor styles (global). Ensure `react-quill` is installed in the project.
import 'react-quill/dist/quill.snow.css'
import { generateSEO, generateOrganizationStructuredData } from '@/lib/seo'
import AuthProvider from '@/components/AuthProvider'
import { SettingsProvider } from '@/context/SettingsContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap' // Optimize font loading
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  ...generateSEO({
    title: undefined, // Will use default site name
    description: 'Đại lý ủy quyền chính thức của VinFast tại Việt Nam. Cung cấp đầy đủ các dòng xe VinFast với giá tốt nhất, dịch vụ tư vấn chuyên nghiệp.',
    keywords: 'VinFast, xe điện, ô tô điện, VF8, VF9, VF5, VFe34, đại lý VinFast, mua xe VinFast, giá xe VinFast, lái thử VinFast',
  })
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationStructuredData()

  return (
    <html lang="vi">
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch for potential external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* Preload critical images */}
        <link
          rel="preload"
          as="image"
          href="/default/vinfastlogo.webp"
          type="image/webp"
        />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={inter.variable}>
        <AuthProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
