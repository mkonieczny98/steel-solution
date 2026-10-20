'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

// Film ładuje się dopiero po kliknięciu – do tego czasu nic nie trafia do YouTube.
export function VideoEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Odtwórz film: ${title}`}
      className="group absolute inset-0 flex items-center justify-center bg-ink"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <span className="clip-corner relative flex h-20 w-28 items-center justify-center bg-primary transition-transform group-hover:scale-110">
        <Play className="h-9 w-9 fill-white text-white" />
      </span>
    </button>
  )
}

