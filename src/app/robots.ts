import type { MetadataRoute } from 'next'
import { site, noindex } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  // Podgląd: bez sitemapy, a noindex przekazują meta tagi i nagłówek X-Robots-Tag
  // (blokada w robots.txt sprawiłaby, że roboty nie zobaczyłyby noindex)
  if (noindex) return { rules: { userAgent: '*', allow: '/' } }
  return {
    rules: { userAgent: '*', allow: ['/', '/api/media/'], disallow: ['/admin', '/api', '/podglad'] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
