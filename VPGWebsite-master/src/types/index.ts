export interface Car {
  id: string
  name: string
  slug: string
  description: string | null
  article: string | null
  mainImage: string | null
  createdAt: Date
  updatedAt: Date
  versions?: CarVersion[]
  images?: CarImage[]
}

export interface CarVersion {
  id: string
  carId: string
  name: string
  price: number
  createdAt: Date
  updatedAt: Date
}

export interface CarImage {
  id: string
  carId: string
  imageUrl: string
  order: number
  createdAt: Date
}

export interface TestDrive {
  id: string
  fullName: string
  phone: string
  carId: string
  carName: string
  testDate: Date
  createdAt: Date
}

export interface PriceQuote {
  id: string
  fullName: string
  phone: string
  carId: string
  carName: string
  paymentType: 'full' | 'installment'
  createdAt: Date
}

export interface Customer {
  id: string
  name: string
  imageUrl: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}
