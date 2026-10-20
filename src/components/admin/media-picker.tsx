'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { IMAGES, sized } from '@/lib/images'

type Item = { url: string; name: string; meta?: string }

// Czytelna nazwa zdjęcia poglądowego z klucza, np. fireTruckForest → „fire truck forest”
const stockItems: Item[] = Object.entries(IMAGES).map(([key, url]) => ({
  url,
  name: key.replace(/([A-Z])/g, ' $1').toLowerCase(),
  meta: 'Unsplash',
}))

const formatSize = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)

// Okno wyboru zdjęć: wgrane w panelu (tabela Media) i zdjęcia poglądowe
export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  max,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (urls: string[]) => void
  multiple?: boolean
  max?: number
}) {
  const [tab, setTab] = useState<'uploads' | 'stock'>('uploads')
  const [uploads, setUploads] = useState<Item[] | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setSelected([])
    setQuery('')
    setError('')
    fetch('/api/admin/media')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((rows: { url: string; originalName: string; size: number; createdAt: string }[]) =>
        setUploads(
          rows.map((r) => ({
            url: r.url,
            name: r.originalName,
            meta: `${formatSize(r.size)} · ${new Date(r.createdAt).toLocaleDateString('pl-PL')}`,
          }))
        )
      )
      .catch(() => setError('Nie udało się wczytać biblioteki.'))
  }, [open])

  const items = useMemo(() => {
    const source = tab === 'uploads' ? uploads ?? [] : stockItems
    const q = query.trim().toLowerCase()
    return q ? source.filter((i) => i.name.toLowerCase().includes(q)) : source
  }, [tab, uploads, query])

  const toggle = (url: string) => {
    if (!multiple) {
      onSelect([url])
      onOpenChange(false)
      return
    }
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : max && s.length >= max ? s : [...s, url]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>Biblioteka zdjęć</DialogTitle>
          <DialogDescription>
            {multiple ? 'Zaznacz jedno lub kilka zdjęć i kliknij „Dodaj”.' : 'Kliknij zdjęcie, aby je wybrać.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ['uploads', `Wgrane${uploads ? ` (${uploads.length})` : ''}`],
              ['stock', `Zdjęcia poglądowe (${stockItems.length})`],
            ] as const
          ).map(([key, label]) => (
            <Button key={key} type="button" size="sm" variant={tab === key ? 'default' : 'outline'} onClick={() => setTab(key)}>
              {label}
            </Button>
          ))}
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj po nazwie" className="pl-9" />
          </div>
        </div>

        <div className="min-h-[240px] flex-1 overflow-y-auto">
          {tab === 'uploads' && uploads === null && !error && (
            <div className="flex h-60 items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {error && <p className="p-6 text-center text-sm text-destructive">{error}</p>}
          {!error && items.length === 0 && (tab === 'stock' || uploads !== null) && (
            <p className="p-10 text-center text-sm text-muted-foreground">
              {query
                ? 'Brak zdjęć pasujących do wyszukiwania.'
                : 'Nie ma jeszcze wgranych zdjęć – wgraj pierwsze przyciskiem obok pola zdjęcia.'}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => {
              const isSelected = selected.includes(item.url)
              return (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => toggle(item.url)}
                  aria-pressed={multiple ? isSelected : undefined}
                  className={cn(
                    'group overflow-hidden rounded-lg border text-left transition-colors hover:border-primary',
                    isSelected && 'border-primary ring-2 ring-primary'
                  )}
                >
                  <span className="relative block aspect-[4/3] bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sized(item.url, 320)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    {isSelected && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </span>
                  <span className="block truncate px-2 pt-1.5 text-xs font-medium">{item.name}</span>
                  {item.meta && <span className="block truncate px-2 pb-1.5 text-[11px] text-muted-foreground">{item.meta}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {multiple && (
          <DialogFooter className="items-center gap-2 sm:justify-between">
            <span className="text-sm text-muted-foreground">
              Zaznaczono: {selected.length}
              {max ? ` (maks. ${max})` : ''}
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Anuluj
              </Button>
              <Button
                type="button"
                disabled={selected.length === 0}
                onClick={() => {
                  onSelect(selected)
                  onOpenChange(false)
                }}
              >
                Dodaj {selected.length > 0 ? selected.length : ''}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
