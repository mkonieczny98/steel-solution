'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/public/modal'
import { SmartImage } from '@/components/public/smart-image'

export function Gallery({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  const [open, setOpen] = useState<number | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(
    (dir: number) => setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length]
  )

  const isOpen = open !== null
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, step])

  if (images.length === 0) return null

  return (
    <>
      <div className={cn('grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4', className)}>
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Powiększ zdjęcie ${i + 1} z ${images.length}`}
            className={cn(
              'group relative overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              i === 0 && images.length > 2 ? 'col-span-2 row-span-2 aspect-square sm:aspect-[4/3]' : 'aspect-[4/3]'
            )}
          >
            <SmartImage
              src={src}
              alt={`${alt} – zdjęcie ${i + 1}`}
              fill
              sizes={i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/40">
              <Expand className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </button>
        ))}
      </div>

      <Modal open={isOpen} onClose={close} label="Galeria zdjęć" className="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-black/95 p-0 text-white open:flex open:items-center open:justify-center">
          <div className="relative h-[80vh] w-[92vw] max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <SmartImage src={images[open ?? 0]} alt={`${alt} – zdjęcie ${(open ?? 0) + 1}`} fill sizes="92vw" className="object-contain" />
          </div>
          <button
            type="button"
            autoFocus
            onClick={close}
            aria-label="Zamknij galerię"
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center text-white hover:text-primary"
          >
            <X className="h-7 w-7" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                aria-label="Poprzednie zdjęcie"
                className="absolute left-2 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-white hover:text-primary"
              >
                <ChevronLeft className="h-9 w-9" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                aria-label="Następne zdjęcie"
                className="absolute right-2 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-white hover:text-primary"
              >
                <ChevronRight className="h-9 w-9" />
              </button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-display text-sm tracking-widest text-zinc-400">
                {(open ?? 0) + 1} / {images.length}
              </p>
            </>
          )}
      </Modal>
    </>
  )
}
