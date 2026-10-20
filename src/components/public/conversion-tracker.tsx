'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export type ConversionEvent = 'quote_click' | 'phone_click' | 'quote_start' | 'quote_error'
export function trackConversion(event: ConversionEvent) {
  const path = window.location.pathname
  const page = path === '/' ? 'home' : path === '/kontakt' ? 'contact' : path.startsWith('/realizacje') ? 'projects' : path.startsWith('/oferta') ? 'offer' : 'other'
  void fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event, page }), keepalive: true }).catch(() => {})
}
export function ConversionTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if ((pathname.startsWith('/admin') || pathname.startsWith('/podglad'))) return
    const click = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest('a')
      const href = link?.getAttribute('href') || ''
      if (href.startsWith('tel:')) trackConversion('phone_click')
      else if (href.startsWith('/kontakt') && (href.includes('#formularz') || /wycen/i.test(link?.textContent || ''))) trackConversion('quote_click')
    }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [pathname])
  return null
}
