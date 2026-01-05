import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: {
    default: 'Steel Solution - Profesjonalne zabudowy wozów strażackich',
    template: '%s | Steel Solution',
  },
  description: 'Profesjonalne zabudowy wozów strażackich, półki do kabin, boksy na narzędzia, mocowania sprzętu. Wszystko na wymiar pod wymagania klienta.',
  keywords: ['zabudowy strażackie', 'wozy strażackie', 'półki do kabin', 'boksy narzędziowe', 'mocowania sprzętu', 'zabudowy pickup'],
  authors: [{ name: 'Steel Solution' }],
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: 'Steel Solution',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
