import type { Metadata, Viewport } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ConversionTracker } from '@/components/public/conversion-tracker'
import { Providers } from '@/components/providers'
import { site, noindex } from '@/lib/site'
import { getSiteInfo, type SiteInfo } from '@/lib/content'
import { IMAGES, sized } from '@/lib/images'

const sans = Barlow({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const display = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...(noindex ? { robots: { index: false, follow: false } } : {}),
  title: {
    default: `${site.name} – Zabudowy wozów strażackich na wymiar`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: ['zabudowy strażackie', 'wozy strażackie', 'półki do kabin', 'boksy narzędziowe', 'mocowania sprzętu', 'zabudowy pickup'],
  authors: [{ name: site.name }],
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: site.name,
    url: site.url,
  },
}

export const viewport: Viewport = {
  themeColor: '#101215',
}

const organizationJsonLd = (info: SiteInfo) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: info.phone,
  email: info.email,
  image: sized(IMAGES.heroTruck, 1200),
  address: {
    '@type': 'PostalAddress',
    streetAddress: info.address.street,
    postalCode: info.address.postalCode,
    addressLocality: info.address.city,
    addressCountry: info.address.country,
  },
  areaServed: 'PL',
  hasMap: info.mapsUrl,
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const info = await getSiteInfo()
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(info)) }}
        />
        <a href="#main" className="skip-link">Przejdź do treści</a>
        <Providers>
          <ConversionTracker />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
