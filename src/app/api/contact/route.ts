import { NextRequest, NextResponse, after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/contact'
import { prepareAttachments } from '@/lib/contact-files'
import { boundedBody, rateLimited, RequestError } from '@/lib/request-limits'
import { notifyContact } from '@/lib/contact-notifications'

export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  try {
    if (await rateLimited(request, 'contact', 5, 10 * 60_000)) {
      return NextResponse.json({ error: 'Zbyt wiele zapytań. Spróbuj ponownie za kilka minut.' }, { status: 429, headers: { 'Retry-After': '600' } })
    }
    const bytes = await boundedBody(request, 11 * 1024 * 1024)
    let body: Record<string, unknown>
    let files: File[] = []
    try {
      if (request.headers.get('content-type')?.startsWith('multipart/form-data')) {
        const form = await new Response(new Uint8Array(bytes), { headers: { 'Content-Type': request.headers.get('content-type')! } }).formData()
        body = JSON.parse(String(form.get('data')))
        files = form.getAll('attachments').filter((value): value is File => typeof value !== 'string')
      } else body = JSON.parse(bytes.toString())
    } catch { throw new RequestError('Nieprawidłowe dane formularza.') }
    if (body && typeof body.website === 'string' && body.website) return NextResponse.json({ success: true })
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Sprawdź poprawność formularza.', issues: parsed.error.flatten().fieldErrors }, { status: 400 })
    const { name, email, phone, organization, vehicle, category, message, projectSlug, requestId } = parsed.data
    if (requestId) {
      const existing = await prisma.contactMessage.findUnique({ where: { requestId }, select: { id: true } })
      if (existing) return NextResponse.json({ success: true })
    }
    const attachments = await prepareAttachments(files)
    const project = projectSlug ? await prisma.project.findFirst({ where: { slug: projectSlug, published: true }, select: { slug: true } }) : null
    let id: string
    try {
      const saved = await prisma.$transaction(async (tx) => {
        const saved = await tx.contactMessage.create({ data: {
          name, email, phone: phone || null, organization: organization || null,
          vehicle: vehicle || null, category: category || null, message,
          projectSlug: project?.slug, requestId: requestId || null,
          subject: [category, vehicle].filter(Boolean).join(' – ') || 'Zapytanie ze strony',
          attachments: { create: attachments },
        } })
        const day = new Date().toISOString().slice(0, 10)
        await tx.conversionCount.upsert({ where: { key: `${day}:quote_success:contact` }, create: { key: `${day}:quote_success:contact`, day, event: 'quote_success', page: 'contact' }, update: { count: { increment: 1 } } })
        return saved
      })
      id = saved.id
    } catch (error) {
      // Concurrent retransmission after a lost response must not create another lead.
      if (requestId && await prisma.contactMessage.findUnique({ where: { requestId }, select: { id: true } })) return NextResponse.json({ success: true })
      throw error
    }
    after(() => notifyContact(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof RequestError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error('Could not save contact message')
    return NextResponse.json({ error: 'Nie udało się zapisać wiadomości. Spróbuj ponownie.' }, { status: 500 })
  }
}
