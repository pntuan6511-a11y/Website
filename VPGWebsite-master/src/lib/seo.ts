import { Metadata } from 'next'

interface SEOConfig {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
  siteName?: string
}

const DEFAULT_SITE_NAME = 'VinFast VFG An Giang'
const DEFAULT_DESCRIPTION = 'Đại lý ủy quyền chính thức của VinFast tại An Giang. Cung cấp đầy đủ các dòng xe VinFast với giá tốt nhất, dịch vụ tư vấn chuyên nghiệp.'
const DEFAULT_KEYWORDS = 'VinFast, xe điện, ô tô điện, VF8, VF9, VF5, VFe34, đại lý VinFast, mua xe VinFast, giá xe VinFast'
const DEFAULT_IMAGE = '/images/default-og.jpg'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vinfast3s-angiang.com'

export function generateSEO(config: SEOConfig): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    image = DEFAULT_IMAGE,
    url = SITE_URL,
    type = 'website',
    siteName = DEFAULT_SITE_NAME,
  } = config
  
  const ogType = type === 'product' ? 'website' : type

  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: siteName }],
    openGraph: {
      type: ogType as 'website' | 'article',
      locale: 'vi_VN',
      url: fullUrl,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export function generateCarStructuredData(car: any) {
  const mainImage = car.images?.find((img: any) => img.imageType === 'main')?.imageUrl || car.ogImage || car.mainImage
  const mainImageUrl = mainImage ?? undefined
  const lowestPrice = car.versions?.length > 0 
    ? Math.min(...car.versions.map((v: any) => Number(v.price)))
    : 0

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: car.metaTitle || car.name,
    description: car.metaDescription || car.description,
    image: mainImageUrl,
    brand: {
      '@type': 'Brand',
      name: 'VinFast',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'VND',
      lowPrice: lowestPrice,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/cars/${car.slug}`,
    },
  }
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    name: 'VinFast VFG An Giang',
    description: 'Đại lý ủy quyền chính thức của VinFast tại An Giang',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      // Add your social media links here
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
      addressLocality: 'Việt Nam',
    },
  }
}

export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}
