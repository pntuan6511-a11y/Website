import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// Quill editor styles (global). Ensure `react-quill` is installed in the project.
import 'react-quill/dist/quill.snow.css'
import { generateSEO, generateOrganizationStructuredData } from '@/lib/seo'
import AuthProvider from '@/components/AuthProvider'
import { SettingsProvider } from '@/context/SettingsContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

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
        <link rel="icon" href="/default/fa-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/default/fa-icon.png" />
        <link rel="manifest" href="/manifest.json" />
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
