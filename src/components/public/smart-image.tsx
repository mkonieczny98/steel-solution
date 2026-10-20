'use client'

import Image, { type ImageProps, type ImageLoaderProps } from 'next/image'
import { isUnsplash } from '@/lib/images'

// Unsplash skaluje zdjęcia po swojej stronie, więc pomijamy optymalizator Next.js.
function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality || 75))
  return url.toString()
}

export function SmartImage({ src, alt, ...props }: Omit<ImageProps, 'src'> & { src: string }) {
  if (isUnsplash(src)) {
    return <Image src={src} alt={alt} loader={unsplashLoader} {...props} />
  }
  if (src.startsWith('/uploads/')) {
    return <Image src={src} alt={alt} loader={({ src, width }) => {
      const size = [320, 640, 960, 1280, 1920, 2400].find((value) => value >= width) || 2400
      return `/api/media/${encodeURIComponent(src.slice('/uploads/'.length))}?w=${size}`
    }} {...props} />
  }
  return <Image src={src} alt={alt} unoptimized={!src.startsWith('/')} {...props} />
}
