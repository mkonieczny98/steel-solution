import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, MessageSquare, Phone, Building2, Truck, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LeadDetails } from './lead-details'
import { MessageActions } from './message-actions'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ filtr?: string }>
}

export default async function WiadomosciPage({ searchParams }: Props) {
  const onlyUnread = (await searchParams).filtr === 'nowe'
  const [messages, unreadCount, totalCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where: onlyUnread ? { read: false } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { attachments: { select: { id: true, name: true, size: true } } },
    }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.count(),
  ])

  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const metrics = await prisma.conversionCount.groupBy({ by: ['event'], where: { day: { gte: since } }, _sum: { count: true } })
  const labels: Record<string, string> = { quote_click: 'Kliknięcia wyceny', phone_click: 'Kliknięcia telefonu', quote_start: 'Rozpoczęte formularze', quote_error: 'Błędy formularza', quote_success: 'Zapisane zapytania' }
  const dateFormat = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <>
      <AdminHeader title="Wiadomości" description="Zapytania wysłane przez formularz kontaktowy" />

      <div className="space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Object.entries(labels).map(([event, label]) => <div key={event} className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">{label} · 30 dni</p><p className="mt-2 text-2xl font-semibold">{metrics.find(row => row.event === event)?._sum.count || 0}</p></div>)}</div>
        <p className="text-xs text-muted-foreground">Zliczane zdarzenia, nie unikalne osoby. Kliknięcie telefonu nie potwierdza rozmowy.</p>
        {!process.env.SMTP_HOST && <p role="status" className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">Poczta SMTP nie jest skonfigurowana. Zapytania zapisują się tutaj; po konfiguracji możesz ponowić powiadomienia.</p>}
        <div className="flex gap-2">
          <Link
            href="/admin/wiadomosci"
            className={cn('rounded-md border px-3 py-1.5 text-sm', !onlyUnread && 'border-primary bg-primary/10 text-primary')}
          >
            Wszystkie ({totalCount})
          </Link>
          <Link
            href="/admin/wiadomosci?filtr=nowe"
            className={cn('rounded-md border px-3 py-1.5 text-sm', onlyUnread && 'border-primary bg-primary/10 text-primary')}
          >
            Nowe ({unreadCount})
          </Link>
        </div>

        {messages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{onlyUnread ? 'Brak nowych wiadomości' : 'Brak wiadomości'}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Zapytania z formularza kontaktowego pojawią się tutaj.</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className={cn(!message.read && 'border-l-4 border-l-primary')}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{message.name}</h3>
                      {!message.read && <Badge>Nowa</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{dateFormat.format(message.createdAt)}</p>
                  </div>
                  <MessageActions id={message.id} read={message.read} name={message.name} />
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <a href={`mailto:${message.email}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="h-4 w-4" />
                    {message.email}
                  </a>
                  {message.phone && (
                    <a href={`tel:${message.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="h-4 w-4" />
                      {message.phone}
                    </a>
                  )}
                  {message.organization && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {message.organization}
                    </span>
                  )}
                  {message.vehicle && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      {message.vehicle}
                    </span>
                  )}
                  {message.category && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      {message.category}
                    </span>
                  )}
                </div>

                {message.projectSlug && <Link href={`/realizacje/${message.projectSlug}`} className="mt-3 inline-block text-sm text-primary underline">Realizacja wskazana przez klienta</Link>}
                {message.attachments.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{message.attachments.map(file => <li key={file.id}><a href={`/api/admin/attachments/${file.id}`} className="inline-flex rounded border px-3 py-2 text-sm hover:bg-muted">{file.name} · {(file.size / 1024).toFixed(0)} KB ↓</a></li>)}</ul>}
                <p className="mt-4 whitespace-pre-line rounded-md bg-muted/50 p-4 text-sm leading-relaxed">{message.message}</p>
                <LeadDetails id={message.id} status={message.status} notes={message.notes} followUpAt={message.followUpAt?.toISOString() || null} notificationStatus={message.notificationStatus} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  )
}
