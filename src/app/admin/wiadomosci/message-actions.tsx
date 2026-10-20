'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MailOpen, Mail, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export function MessageActions({ id, read, name }: { id: string; read: boolean; name: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)

  const toggleRead = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !read }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      toast({ variant: 'destructive', title: 'Błąd', description: 'Nie udało się zmienić statusu wiadomości' })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Usunięto', description: 'Wiadomość została usunięta' })
      setOpen(false)
      router.refresh()
    } catch {
      toast({ variant: 'destructive', title: 'Błąd', description: 'Nie udało się usunąć wiadomości' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={toggleRead} disabled={busy}>
        {read ? <Mail className="mr-2 h-4 w-4" /> : <MailOpen className="mr-2 h-4 w-4" />}
        {read ? 'Oznacz jako nową' : 'Oznacz jako przeczytaną'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive" aria-label="Usuń wiadomość">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń wiadomość</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć wiadomość od „{name}”? Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={remove} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
