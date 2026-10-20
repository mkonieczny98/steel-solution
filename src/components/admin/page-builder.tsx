'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Save,
  Settings2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { BlocksEditor } from '@/components/admin/blocks-editor'
import { cn, slugify } from '@/lib/utils'
import { BLOCK_TYPES, DEFAULT_PAGE_BLOCKS, type Block } from '@/lib/blocks'

export type BuilderPage = {
  id: string
  title: string
  slug: string
  description: string | null
  published: boolean
  showInMenu: boolean
  sortOrder: number
  system: boolean
  version: string
  publicPath: string
}

export function PageBuilder({ page, initialBlocks, revisions = [] }: { page: BuilderPage; initialBlocks: Block[]; revisions?: { id: string; createdAt: string }[] }) {
  const router = useRouter()
  const version = useRef(page.version)
  const { toast } = useToast()
  const [blocks, setBlocks] = useState(initialBlocks)
  const [meta, setMeta] = useState({
    title: page.title,
    slug: page.slug,
    description: page.description || '',
    published: page.published,
    showInMenu: page.showInMenu,
    sortOrder: page.sortOrder,
  })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const change = (next: Block[]) => {
    setBlocks(next)
    setDirty(true)
  }
  const setMetaField = <K extends keyof typeof meta>(key: K, value: (typeof meta)[K]) => {
    setMeta((m) => ({ ...m, [key]: value }))
    setDirty(true)
  }

  const save = async (action: 'draft' | 'publish' = 'draft') => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meta, blocks, action, version: version.current }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Nie udało się zapisać strony')
      setDirty(false)
      version.current = json.updatedAt
      if (action === 'publish' && json.slug && json.slug !== meta.slug) setMeta((m) => ({ ...m, slug: json.slug }))
      toast({ title: action === 'publish' ? 'Opublikowano' : 'Zapisano szkic', description: action === 'publish' ? 'Zmiany są widoczne na stronie.' : 'Wersja publiczna pozostaje bez zmian. Otwórz podgląd szkicu.' })
      router.refresh()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Błąd', description: error instanceof Error ? error.message : 'Nie udało się zapisać' })
    } finally {
      setSaving(false)
    }
  }

  const deletePage = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setDirty(false)
      router.push('/admin/strony')
      router.refresh()
    } catch {
      toast({ variant: 'destructive', title: 'Błąd', description: 'Nie udało się usunąć strony' })
      setSaving(false)
    }
  }

  const publicPath = page.system ? page.publicPath : `/${meta.slug}`

  return (
    <div className="space-y-4 pb-28">
      {/* Ustawienia strony */}
      <Card>
        <button
          type="button"
          onClick={() => setSettingsOpen((o) => !o)}
          aria-expanded={settingsOpen}
          className="flex w-full items-center justify-between gap-4 p-5 text-left"
        >
          <span className="flex items-center gap-3">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            <span>
              <span className="block font-semibold">Ustawienia strony</span>
              <span className="text-sm text-muted-foreground">
                {publicPath} · {page.system || meta.published ? 'opublikowana' : 'szkic'}
                {!page.system && meta.showInMenu && ' · w menu'}
              </span>
            </span>
          </span>
          <ChevronDown className={cn('h-5 w-5 text-muted-foreground transition-transform', settingsOpen && 'rotate-180')} />
        </button>
        {settingsOpen && (
          <CardContent className="grid gap-5 border-t pt-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="page-title">Tytuł strony</Label>
              <Input id="page-title" value={meta.title} onChange={(e) => setMetaField('title', e.target.value)} />
              <p className="text-xs text-muted-foreground">Pokazuje się w karcie przeglądarki, w Google i w menu.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-slug">Adres</Label>
              <div className="flex items-center rounded-md border bg-muted/40 pl-3 text-sm text-muted-foreground">
                /
                <Input
                  id="page-slug"
                  value={page.system ? page.publicPath.replace(/^\//, '') : meta.slug}
                  disabled={page.system}
                  onChange={(e) => setMetaField('slug', slugify(e.target.value))}
                  className="border-0 bg-transparent pl-1 shadow-none focus-visible:ring-0"
                />
              </div>
              {page.system && <p className="text-xs text-muted-foreground">Adres tej strony jest stały.</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="page-description">Opis dla Google (meta description)</Label>
              <Textarea
                id="page-description"
                rows={2}
                maxLength={300}
                value={meta.description}
                onChange={(e) => setMetaField('description', e.target.value)}
                placeholder="1–2 zdania o tym, co jest na stronie (do 160 znaków najlepiej)."
              />
              <p className="text-xs text-muted-foreground">{meta.description.length} / 160 znaków</p>
            </div>
            {page.system && DEFAULT_PAGE_BLOCKS[page.slug] && (
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3 md:col-span-2">
                <span className="text-sm">
                  <span className="block font-medium">Układ domyślny</span>
                  <span className="text-muted-foreground">Wczytuje oryginalne sekcje tej strony (zmiany zapiszesz przyciskiem na dole).</span>
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (window.confirm('Zastąpić obecne sekcje układem domyślnym?')) change(structuredClone(DEFAULT_PAGE_BLOCKS[page.slug]))
                  }}
                >
                  Przywróć układ domyślny
                </Button>
              </div>
            )}
            {!page.system && (
              <>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <Label htmlFor="page-published" className="cursor-pointer">
                    Opublikowana
                    <span className="block text-xs font-normal text-muted-foreground">Szkic widzisz tylko Ty po zalogowaniu.</span>
                  </Label>
                  <Switch id="page-published" checked={meta.published} onCheckedChange={(v) => setMetaField('published', v)} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <Label htmlFor="page-menu" className="cursor-pointer">
                    Pokaż w menu
                    <span className="block text-xs font-normal text-muted-foreground">Link w nagłówku i w stopce.</span>
                  </Label>
                  <Switch id="page-menu" checked={meta.showInMenu} onCheckedChange={(v) => setMetaField('showInMenu', v)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page-order">Kolejność w menu</Label>
                  <Input
                    id="page-order"
                    type="number"
                    value={meta.sortOrder}
                    onChange={(e) => setMetaField('sortOrder', Number(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-end justify-end">
                  <Button variant="ghost" className="text-destructive" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Usuń stronę
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>

      <BlocksEditor blocks={blocks} onChange={change} types={BLOCK_TYPES} />

      {revisions.length > 0 && <details className="rounded-lg border p-5">
        <summary className="cursor-pointer font-medium">Historia publikacji ({revisions.length})</summary>
        <p className="mt-2 text-sm text-muted-foreground">Przywrócenie wczytuje poprzednią wersję do szkicu. Opublikujesz ją osobno.</p>
        <ul className="mt-3 space-y-2">{revisions.map(revision => <li key={revision.id} className="flex items-center justify-between gap-3 text-sm"><span>{new Date(revision.createdAt).toLocaleString('pl-PL')}</span><Button variant="outline" size="sm" disabled={saving || dirty} onClick={async () => {
          setSaving(true)
          try {
            const response = await fetch(`/api/admin/pages/${page.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'restore', revisionId: revision.id, version: version.current }) })
            const json = await response.json()
            if (!response.ok) throw new Error(json.error)
            const draft = JSON.parse(json.draft)
            setBlocks(JSON.parse(draft.content || '[]'))
            setMeta({ title: draft.title, slug: draft.slug, description: draft.description || '', published: draft.published, showInMenu: draft.showInMenu, sortOrder: draft.sortOrder })
            version.current = json.updatedAt
            setDirty(false)
            toast({ title: 'Wczytano wersję do szkicu' })
            router.refresh()
          } catch (error) { toast({ variant: 'destructive', title: 'Błąd', description: error instanceof Error ? error.message : 'Nie udało się przywrócić wersji.' }) }
          finally { setSaving(false) }
        }}>Wczytaj do szkicu</Button></li>)}</ul>
      </details>}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usunąć stronę?</DialogTitle>
            <DialogDescription>Strona „{meta.title}” zniknie z serwisu i z menu. Tej operacji nie można cofnąć.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={deletePage} disabled={saving}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur lg:left-72">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className={cn('h-2 w-2 rounded-full', dirty ? 'bg-amber-500' : 'bg-green-500')} />
            {dirty ? 'Niezapisane zmiany' : 'Wszystko zapisane'}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" asChild>
              <Link href={`/podglad/${page.id}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Podgląd szkicu
              </Link>
            </Button>
            <Button variant="outline" onClick={() => save('draft')} disabled={saving || !dirty}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Zapisz szkic
            </Button>
            <Button onClick={() => save('publish')} disabled={saving}>Opublikuj zmiany</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
