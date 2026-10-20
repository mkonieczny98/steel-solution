/** @type {import('next').NextConfig} */
const nextConfig = {
  // Wdrożenie buduje do osobnego katalogu (NEXT_DIST_DIR=.next-build), żeby nie ruszać działającej wersji
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    // Zdjęcia z Unsplash skaluje ich CDN (loader w SmartImage), a pozostałe zewnętrzne adresy idą bez optymalizacji –
    // optymalizator nie musi pobierać obrazów z dowolnych domen.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ]
    // Wersja testowa: SITE_NOINDEX=true – żadna strona nie trafi do wyszukiwarek
    if (process.env.SITE_NOINDEX === 'true') {
      headers.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' })
    }
    return [{ source: '/:path*', headers }]
  },
}

module.exports = nextConfig
