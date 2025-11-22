import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactBubbles from '@/components/ContactBubbles'
import PriceQuotePopup from '@/components/PriceQuotePopup'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <ContactBubbles />
      <PriceQuotePopup />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
