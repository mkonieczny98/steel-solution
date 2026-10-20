'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/admin/image-upload'
import { cn } from '@/lib/utils'
import { emptyValue, type Field } from '@/lib/fields'

// Edytor pojedynczego pola ze schematu (tekst, zdjęcie, lista, wybór…) – wspólny dla bloków i danych firmy.
type Obj = Record<string, unknown>

function emptyItem(fields: Field[]): Obj {
  return Object.fromEntries(fields.map((f) => [f.key, emptyValue(f)]))
}

export function move<T>(list: T[], from: number, to: number) {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function ListControls({
  index,
  length,
  onMove,
  onRemove,
}: {
  index: number
  length: number
  onMove: (to: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Przesuń w górę">
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" disabled={index === length - 1} onClick={() => onMove(index + 1)} aria-label="Przesuń w dół">
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={onRemove} aria-label="Usuń">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function FieldEditor({
  field,
  value,
  onChange,
  id,
}: {
  field: Field
  value: unknown
  onChange: (value: unknown) => void
  id: string
}) {
  // Zmiana kolejności remontuje pola listy, żeby komponenty z własnym stanem (zdjęcia) nie pokazywały starych wartości
  const [version, setVersion] = useState(0)

  if (field.type === 'image') {
    return (
      <div>
        <ImageUpload value={(value as string) || ''} onChange={onChange} label={field.label} />
        {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
      </div>
    )
  }

  if (field.type === 'boolean') {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <Label htmlFor={id} className="cursor-pointer">
          {field.label}
        </Label>
        <Switch id={id} checked={value === true} onCheckedChange={onChange} />
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{field.label}</Label>
        <Select value={(value as string) || field.options[0]?.value} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
      </div>
    )
  }

  if (field.type === 'strings') {
    const list = Array.isArray(value) ? (value as string[]) : []
    const update = (next: string[], structural = false) => {
      onChange(next)
      if (structural) setVersion((v) => v + 1)
    }
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        {list.map((item, i) => (
          <div key={`${version}-${i}`} className="flex items-center gap-2">
            <Input value={item} onChange={(e) => update(list.map((v, j) => (j === i ? e.target.value : v)))} aria-label={`${field.itemLabel || 'Pozycja'} ${i + 1}`} />
            <ListControls
              index={i}
              length={list.length}
              onMove={(to) => update(move(list, i, to), true)}
              onRemove={() => update(list.filter((_, j) => j !== i), true)}
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => update([...list, ''], true)}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj: {field.itemLabel?.toLowerCase() || 'pozycję'}
        </Button>
      </div>
    )
  }

  if (field.type === 'list') {
    const list = Array.isArray(value) ? (value as Obj[]) : []
    const update = (next: Obj[], structural = false) => {
      onChange(next)
      if (structural) setVersion((v) => v + 1)
    }
    return (
      <div className="space-y-3">
        <Label>{field.label}</Label>
        {list.map((item, i) => (
          <div key={`${version}-${i}`} className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">
                {field.itemLabel} {i + 1}
              </span>
              <ListControls
                index={i}
                length={list.length}
                onMove={(to) => update(move(list, i, to), true)}
                onRemove={() => update(list.filter((_, j) => j !== i), true)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {field.fields.map((sub) => (
                <div key={sub.key} className={cn((sub.type === 'textarea' || sub.type === 'image' || sub.type === 'list') && 'md:col-span-2')}>
                  <FieldEditor
                    id={`${id}-${i}-${sub.key}`}
                    field={sub}
                    value={item[sub.key]}
                    onChange={(v) => update(list.map((it, j) => (j === i ? { ...it, [sub.key]: v } : it)))}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => update([...list, emptyItem(field.fields)], true)}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj: {field.itemLabel.toLowerCase()}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{field.label}</Label>
      {field.type === 'textarea' ? (
        <Textarea id={id} rows={4} value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />
      )}
      {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
    </div>
  )
}
