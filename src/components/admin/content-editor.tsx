'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ExternalLink, Loader2, RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { FieldEditor } from '@/components/admin/field-editor'
import { cn } from '@/lib/utils'
import { contentDocs, type ContentKey } from '@/lib/content-schema'

type Obj = Record<string, unknown>

export function ContentEditor({ docKey, initial }: { docKey: ContentKey; initial: Record<string, Obj> }) {
  const doc = contentDocs[docKey]
  const router = useRouter()
  const { toast } = useToast()
  const [values, setValues] = useState(initial)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({ [doc.sections[0].key]: true })

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const setField = (section: string, field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
    setDirty(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: docKey, values }),
      })
      if (!res.ok) throw new Error()
      setDirty(false)
      toast({ title: 'Zapisano', description: 'Zmiany są już widoczne na stronie.' })
      router.refresh()
    } catch {
      toast({ variant: 'destructive', title: 'Błąd', description: 'Nie udało się zapisać zmian.' })
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content?key=${docKey}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setResetOpen(false)
      setDirty(false)
      toast({ title: 'Przywrócono', description: 'Przywrócono treści domyślne.' })
      // Pełne przeładowanie, żeby formularz dostał świeże wartości domyślne
      window.location.reload()
    } catch {
      toast({ variant: 'destructive', title: 'Błąd', description: 'Nie udało się przywrócić treści.' })
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 pb-24">
      {doc.sections.map((section) => {
        const isOpen = open[section.key]
        return (
          <Card key={section.key}>
            <button
              type="button"
              className="w-full text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen((o) => ({ ...o, [section.key]: !o[section.key] }))}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.description && <CardDescription className="mt-1">{section.description}</CardDescription>}
                </div>
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
              </CardHeader>
            </button>
            {isOpen && (
              <CardContent className="grid gap-5 border-t pt-6 md:grid-cols-2">
                {section.fields.map((field) => (
                  <div
                    key={field.key}
                    className={cn(field.type !== 'text' && 'md:col-span-2')}
                  >
                    <FieldEditor
                      id={`${section.key}-${field.key}`}
                      field={field}
                      value={values[section.key]?.[field.key]}
                      onChange={(v) => setField(section.key, field.key, v)}
                    />
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )
      })}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur lg:left-72">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className={cn('h-2 w-2 rounded-full', dirty ? 'bg-amber-500' : 'bg-green-500')} />
            {dirty ? 'Niezapisane zmiany' : 'Wszystko zapisane'}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" asChild>
              <Link href={doc.publicPath} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Podgląd
              </Link>
            </Button>
            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Przywróć domyślne
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Przywrócić treści domyślne?</DialogTitle>
                  <DialogDescription>
                    Wszystkie Twoje zmiany na stronie „{doc.title}” zostaną usunięte i zastąpione treściami domyślnymi.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setResetOpen(false)}>
                    Anuluj
                  </Button>
                  <Button variant="destructive" onClick={reset} disabled={saving}>
                    Przywróć
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={save} disabled={saving || !dirty}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Zapisz zmiany
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
