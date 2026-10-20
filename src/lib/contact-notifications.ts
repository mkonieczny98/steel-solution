import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'
import { site } from '@/lib/site'
import { getSiteInfo } from '@/lib/content'

// A lease prevents concurrent admin retries from sending the same notification.
export async function notifyContact(id: string) {
  const now = new Date()
  const stale = new Date(now.getTime() - 2 * 60_000)
  const claimed = await prisma.contactMessage.updateMany({
    where: { id, notificationStatus: { not: 'sent' }, OR: [{ notificationStatus: { not: 'sending' } }, { notificationUpdatedAt: { lt: stale } }] },
    data: { notificationStatus: 'sending', notificationUpdatedAt: now, notificationAttempts: { increment: 1 } },
  })
  if (!claimed.count) return
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM } = process.env
  if (!SMTP_HOST) {
    await prisma.contactMessage.update({ where: { id }, data: { notificationStatus: 'not_configured', notificationUpdatedAt: new Date() } })
    return
  }
  try {
    const data = await prisma.contactMessage.findUniqueOrThrow({ where: { id }, include: { attachments: { select: { name: true } } } })
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST, port: Number(SMTP_PORT || 587), secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    })
    const rows = [['Imię i nazwisko', data.name], ['E-mail', data.email], ['Telefon', data.phone], ['Jednostka', data.organization], ['Pojazd', data.vehicle], ['Produkt', data.category], ['Realizacja', data.projectSlug]]
    await transporter.sendMail({
      from: CONTACT_FROM || SMTP_USER,
      to: CONTACT_TO || (await getSiteInfo()).email,
      replyTo: data.email,
      subject: `Nowe zapytanie: ${data.subject}`,
      text: rows.filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join('\n') + `\n\n${data.message}\n\nZałączniki: ${data.attachments.length} (dostępne po zalogowaniu).\n${site.url}/admin/wiadomosci`,
    })
    await prisma.contactMessage.update({ where: { id }, data: { notificationStatus: 'sent', notificationUpdatedAt: new Date() } })
  } catch {
    await prisma.contactMessage.update({ where: { id }, data: { notificationStatus: 'failed', notificationUpdatedAt: new Date() } })
    console.error('Contact notification failed:', id)
  }
}
