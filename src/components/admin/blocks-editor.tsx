'use client'

import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Copy, Database, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FieldEditor, move } from '@/components/admin/field-editor'
import { BlockIcon } from '@/components/admin/block-icons'
import { cn } from '@/lib/utils'
import { BLOCKS, createBlock, isDataBlock, newBlockId, type Block, type BlockType } from '@/lib/blocks'

// Lista sekcji strony z dodawaniem, przeciąganiem, ukrywaniem i edycją – wspólna dla stron, kategorii i marek.
function blockSummary(block: Block) {
  const d = block.data as Record<string, unknown>
  const text = [d.title, d.quote, d.eyebrow].find((v) => typeof v === 'string' && v.trim()) as string | undefined
  return text ? text.slice(0, 80) : BLOCKS[block.type].description
}

function AddBlockDialog({
  open,
  onOpenChange,
  onPick,
  types,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (type: BlockType) => void
  types: BlockType[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj sekcję</DialogTitle>
          <DialogDescription>Wybierz rodzaj sekcji – po dodaniu uzupełnisz jej treść.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onPick(type)}
              className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <BlockIcon type={type} className="h-5 w-5 text-primary" />
              </span>
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  {BLOCKS[type].label}
                  {isDataBlock(type) && <Badge variant="secondary">z danych</Badge>}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{BLOCKS[type].description}</span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InsertButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="group relative flex h-6 items-center justify-center">
      <div className="absolute inset-x-0 top-1/2 h-px bg-transparent transition-colors group-hover:bg-primary/40" />
      <button
        type="button"
        onClick={onClick}
        aria-label="Wstaw sekcję w tym miejscu"
        className="relative flex h-6 items-center gap-1 rounded-full border bg-background px-2 text-xs text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-primary focus:opacity-100 group-hover:opacity-100"
      >
        <Plus className="h-3.5 w-3.5" />
        Wstaw sekcję
      </button>
    </div>
  )
}

export function BlocksEditor({
  blocks,
  onChange,
  types,
  emptyText = 'Strona nie ma jeszcze sekcji.',
}: {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  types: BlockType[]
  emptyText?: string
}) {
  const change = onChange
  const [expanded, setExpanded] = useState<string | null>(null)
  const [insertAt, setInsertAt] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const updateBlock = (id: string, key: string, value: unknown) =>
    change(blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, [key]: value } } : b)))

  const insertBlock = (type: BlockType) => {
    const block = createBlock(type)
    const at = insertAt ?? blocks.length
    change([...blocks.slice(0, at), block, ...blocks.slice(at)])
    setInsertAt(null)
    setExpanded(block.id)
    setTimeout(() => blockRefs.current[block.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const duplicate = (index: number) => {
    const copy = { ...structuredClone(blocks[index]), id: newBlockId() }
    change([...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)])
    setExpanded(copy.id)
  }

  const remove = (index: number) => {
    if (!window.confirm(`Usunąć sekcję „${BLOCKS[blocks[index].type].label}”?`)) return
    change(blocks.filter((_, i) => i !== index))
  }

  const onDrop = (to: number) => {
    if (dragIndex !== null && dragIndex !== to) change(move(blocks, dragIndex, to))
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <>
      {/* Sekcje */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-semibold">Sekcje ({blocks.length})</h2>
        <p className="hidden text-sm text-muted-foreground sm:block">Przeciągnij za uchwyt, aby zmienić kolejność</p>
      </div>

      {blocks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">{emptyText}</CardContent>
        </Card>
      )}

      <div>
        {blocks.map((block, index) => {
          const def = BLOCKS[block.type]
          const isOpen = expanded === block.id
          return (
            <div key={block.id}>
              {index > 0 && <InsertButton onClick={() => setInsertAt(index)} />}
              <div
                ref={(el) => {
                  blockRefs.current[block.id] = el
                }}
                onDragOver={(e) => {
                  if (dragIndex === null) return
                  e.preventDefault()
                  setOverIndex(index)
                }}
                onDrop={() => onDrop(index)}
                className={cn(
                  'scroll-mt-24 rounded-lg border bg-card transition-shadow',
                  block.hidden && 'opacity-60',
                  isOpen && 'ring-2 ring-primary/30',
                  dragIndex === index && 'opacity-40',
                  overIndex === index && dragIndex !== null && dragIndex !== index && 'ring-2 ring-primary'
                )}
              >
                <div className="flex items-center gap-2 p-3">
                  <span
                    draggable
                    onDragStart={(e) => {
                      setDragIndex(index)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragEnd={() => {
                      setDragIndex(null)
                      setOverIndex(null)
                    }}
                    className="cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
                    title="Przeciągnij, aby zmienić kolejność"
                  >
                    <GripVertical className="h-5 w-5" />
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : block.id)}
                    aria-expanded={isOpen}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <BlockIcon type={block.type} className="h-4 w-4 text-primary" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {index + 1}. {def.label}
                        {isDataBlock(block.type) && (
                          <Badge variant="outline" className="gap-1 normal-case">
                            <Database className="h-3 w-3" />z danych
                          </Badge>
                        )}
                        {block.hidden && <Badge variant="secondary">Ukryta</Badge>}
                      </span>
                      <span className="block truncate font-medium">{blockSummary(block)}</span>
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center">
                    <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => change(move(blocks, index, index - 1))} aria-label="W górę">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === blocks.length - 1}
                      onClick={() => change(move(blocks, index, index + 1))}
                      aria-label="W dół"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => change(blocks.map((b) => (b.id === block.id ? { ...b, hidden: !b.hidden } : b)))}
                      aria-label={block.hidden ? 'Pokaż sekcję' : 'Ukryj sekcję'}
                      title={block.hidden ? 'Pokaż sekcję' : 'Ukryj sekcję'}
                    >
                      {block.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => duplicate(index)} aria-label="Duplikuj" title="Duplikuj">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)} aria-label="Usuń" title="Usuń">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setExpanded(isOpen ? null : block.id)} aria-label="Edytuj">
                      <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div className="grid gap-5 border-t p-5 md:grid-cols-2">
                    {def.fields.map((field) => (
                      <div
                        key={field.key}
                        className={cn((field.type === 'textarea' || field.type === 'image' || field.type === 'list' || field.type === 'strings') && 'md:col-span-2')}
                      >
                        <FieldEditor
                          id={`${block.id}-${field.key}`}
                          field={field}
                          value={block.data[field.key]}
                          onChange={(v) => updateBlock(block.id, field.key, v)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setInsertAt(blocks.length)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="h-5 w-5" />
        Dodaj sekcję
      </button>

      <AddBlockDialog open={insertAt !== null} onOpenChange={(o) => !o && setInsertAt(null)} onPick={insertBlock} types={types} />
    </>
  )
}
