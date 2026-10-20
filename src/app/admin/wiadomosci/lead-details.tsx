'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LEAD_STATUSES, NOTIFICATION_STATUSES } from '@/lib/contact'

export function LeadDetails({ id, status: initialStatus, notes: initialNotes, followUpAt, notificationStatus }: {
  id: string; status: string; notes: string; followUpAt: string | null; notificationStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [notes, setNotes] = useState(initialNotes)
  const [date, setDate] = useState(followUpAt?.slice(0, 10) || '')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')
  async function action(retry = false) {
    setBusy(true); setResult('')
    try {
      const response = await fetch(`/api/admin/messages/${id}${retry ? '/retry' : ''}`, {
        method: retry ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' },
        ...(retry ? {} : { body: JSON.stringify({ status, notes, followUpAt: date ? new Date(`${date}T12:00:00Z`).toISOString() : null }) }),
      })
      if (!response.ok) throw new Error()
      const json = await response.json()
      setResult(retry ? NOTIFICATION_STATUSES[json.notificationStatus] || 'Sprawdź status' : 'Zapisano')
      router.refresh()
    } catch { setResult('Nie udało się zapisać. Spróbuj ponownie.') }
    finally { setBusy(false) }
  }
  return <details className="mt-4 rounded-md border p-3">
    <summary className="cursor-pointer text-sm font-medium">Obsługa zapytania · {LEAD_STATUSES[initialStatus as keyof typeof LEAD_STATUSES] || initialStatus} · E-mail: {NOTIFICATION_STATUSES[notificationStatus] || notificationStatus}</summary>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm">Status<select value={status} disabled={busy} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full rounded border bg-background p-2">{Object.entries(LEAD_STATUSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="text-sm">Kolejny kontakt<input type="date" value={date} disabled={busy} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded border bg-background p-2" /></label>
      <label className="text-sm sm:col-span-2">Notatka<textarea value={notes} disabled={busy} maxLength={5000} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full rounded border bg-background p-2" /></label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="button" disabled={busy} onClick={() => action()} className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50">Zapisz obsługę</button>
        {notificationStatus !== 'sent' && <button type="button" disabled={busy} onClick={() => action(true)} className="rounded border px-4 py-2 text-sm disabled:opacity-50">Ponów powiadomienie e-mail</button>}
        <span role="status" className="text-sm">{result}</span>
      </div>
    </div>
  </details>
}
