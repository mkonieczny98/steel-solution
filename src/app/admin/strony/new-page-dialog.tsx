'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn, slugify } from '@/lib/utils'
import { PAGE_TEMPLATES } from '@/lib/blocks'

export function NewPageDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [template, setTemplate] = useState(PAGE_TEMPLATES[0].key)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const create = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug: slug || title, template }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Nie udało się utworzyć strony')
      router.push(`/admin/strony/${json.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się utworzyć strony')
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nowa strona
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nowa strona</DialogTitle>
          <DialogDescription>Strona powstanie jako szkic – opublikujesz ją, gdy będzie gotowa.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-title">Tytuł</Label>
            <Input
              id="new-title"
              value={title}
              placeholder="np. Dofinansowania dla OSP"
              onChange={(e) => {
                setTitle(e.target.value)
                if (!slugTouched) setSlug(slugify(e.target.value))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-slug">Adres</Label>
            <div className="flex items-center rounded-md border bg-muted/40 pl-3 text-sm text-muted-foreground">
              /
              <Input
                id="new-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(slugify(e.target.value))
                }}
                className="border-0 bg-transparent pl-1 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Szablon</Label>
            <div className="grid gap-2">
              {PAGE_TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTemplate(t.key)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors',
                    template === t.key ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/40'
                  )}
                >
                  <span className="block font-medium">{t.label}</span>
                  <span className="text-sm text-muted-foreground">{t.description}</span>
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={create} disabled={saving || !title.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Utwórz i edytuj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
