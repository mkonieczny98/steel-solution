'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database, ExternalLink, Loader2, Pencil, RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { BlocksEditor } from '@/components/admin/blocks-editor'
import { cn } from '@/lib/utils'
import { blockTypesFor, defaultEntityBlocks, type Block } from '@/lib/blocks'

// Edytor układu strony kategorii produktów / marki pojazdu
export function EntityLayoutEditor({
  kind,
  id,
  name,
  publicPath,
  formPath,
  initialBlocks,
  isDefault,
}: {
  kind: 'category' | 'brand'
  id: string
  name: string
  publicPath: string
  formPath: string
  initialBlocks: Block[]
  isDefault: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [blocks, setBlocks] = useState(initialBlocks)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const api = kind === 'category' ? `/api/admin/categories/${id}/blocks` : `/api/admin/vehicle-brands/${id}/blocks`

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const save = async (next: Block[] | null) => {
    setSaving(true)
    try {
      const res = await fetch(api, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: next }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Nie udało się zapisać')
      setDirty(false)
      toast({ title: 'Zapisano', description: 'Zmiany są już widoczne na stronie.' })
      router.refresh()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Błąd', description: error instanceof Error ? error.message : 'Nie udało się zapisać' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 pb-28">
      <Card className="bg-muted/40">
        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5 text-sm">
          <div className="flex max-w-2xl gap-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Sekcje oznaczone <strong className="text-foreground">„z danych”</strong> pokazują treść z formularza{' '}
              {kind === 'category' ? 'kategorii' : 'marki'} (nazwa, opisy, cechy, specyfikacja, galeria, powiązania) – tam ją edytujesz.
              Pozostałe sekcje dodajesz i wypełniasz tutaj. W tekstach możesz użyć <code>{'{nazwa}'}</code>, a nazwa podstawi się sama.
              {isDefault && ' Ta strona ma teraz układ domyślny.'}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={formPath}>
              <Pencil className="mr-2 h-4 w-4" />
              Edytuj dane: {name}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <BlocksEditor
        blocks={blocks}
        onChange={(next) => {
          setBlocks(next)
          setDirty(true)
        }}
        types={blockTypesFor(kind)}
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur lg:left-72">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className={cn('h-2 w-2 rounded-full', dirty ? 'bg-amber-500' : 'bg-green-500')} />
            {dirty ? 'Niezapisane zmiany' : 'Wszystko zapisane'}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" asChild>
              <Link href={publicPath} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Podgląd
              </Link>
            </Button>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => {
                if (!window.confirm('Przywrócić domyślny układ sekcji? Twoje dodatkowe sekcje zostaną usunięte.')) return
                setBlocks(defaultEntityBlocks(kind))
                save(null)
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Układ domyślny
            </Button>
            <Button onClick={() => save(blocks)} disabled={saving || !dirty}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Zapisz zmiany
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
