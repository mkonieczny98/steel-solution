import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CONTENT_TAG } from '@/lib/data'
import { sanitizeBlocks } from '@/lib/blocks'
import { snapshotOf } from '@/lib/page-snapshots'
import { normalizeSlug } from '@/lib/pages-admin'

interface Props {
  params: Promise<{ id: string }>
}

// Saving a draft never changes the published page.
export async function PUT(request: NextRequest, { params }: Props) {
  const { id } = await params
  if (!await getServerSession(authOptions)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json() as Record<string, unknown>
    const action = body.action || 'draft'
    if (!['draft', 'publish', 'restore'].includes(String(action))) return NextResponse.json({ error: 'Nieprawidłowa operacja.' }, { status: 400 })
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Page" WHERE id = ${id} FOR UPDATE`
      const page = await tx.page.findUnique({ where: { id } })
      if (!page) return { error: 'Nie znaleziono strony.', status: 404 }
      if (body.version !== page.updatedAt.toISOString()) return { error: 'Strona zmieniła się w innej sesji. Odśwież edytor przed zapisem.', status: 409 }
      if (action === 'restore') {
        const revision = typeof body.revisionId === 'string' ? await tx.pageRevision.findFirst({ where: { id: body.revisionId, pageId: id } }) : null
        if (!revision) return { error: 'Nie znaleziono wersji.', status: 404 }
        return { page: await tx.page.update({ where: { id }, data: { draft: revision.snapshot } }) }
      }
      const title = typeof body.title === 'string' ? body.title.trim().slice(0, 200) : page.title
      if (!title) return { error: 'Podaj tytuł strony.', status: 400 }
      let slug = page.slug
      if (!page.system && body.slug !== undefined && body.slug !== page.slug) {
        const normalized = normalizeSlug(body.slug)
        if ('error' in normalized) return { error: normalized.error, status: 400 }
        const taken = await tx.page.findFirst({ where: { slug: normalized.slug, NOT: { id } } })
        const reserved = await tx.pageRedirect.findUnique({ where: { from: normalized.slug } })
        if (taken || (reserved && reserved.to !== page.slug)) return { error: 'Ten adres jest już zajęty.', status: 409 }
        slug = normalized.slug
      }
      const next = {
        title, slug,
        description: typeof body.description === 'string' ? body.description.slice(0, 300) || null : page.description,
        published: page.system ? true : typeof body.published === 'boolean' ? body.published : page.published,
        showInMenu: page.system ? false : typeof body.showInMenu === 'boolean' ? body.showInMenu : page.showInMenu,
        sortOrder: typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder) ? Math.round(body.sortOrder) : page.sortOrder,
        content: body.blocks !== undefined ? JSON.stringify(sanitizeBlocks(body.blocks)) : page.content,
      }
      if (action === 'draft') return { page: await tx.page.update({ where: { id }, data: { draft: JSON.stringify(next) } }) }
      await tx.pageRevision.create({ data: { pageId: id, snapshot: JSON.stringify(snapshotOf(page)) } })
      if (slug !== page.slug) {
        await tx.pageRedirect.deleteMany({ where: { from: slug } })
        await tx.pageRedirect.updateMany({ where: { to: page.slug }, data: { to: slug } })
        await tx.pageRedirect.upsert({ where: { from: page.slug }, create: { from: page.slug, to: slug }, update: { to: slug } })
      }
      return { page: await tx.page.update({ where: { id }, data: { ...next, draft: null } }) }
    })
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
    if (action === 'publish') revalidateTag(CONTENT_TAG)
    return NextResponse.json({ ...result.page, action })
  } catch {
    return NextResponse.json({ error: 'Nie udało się zapisać strony.' }, { status: 500 })
  }
}

// DELETE /api/admin/pages/[id]
export async function DELETE(request: NextRequest, { params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) return NextResponse.json({ error: 'Nie znaleziono strony' }, { status: 404 })
  if (page.system) return NextResponse.json({ error: 'Tej strony nie można usunąć' }, { status: 400 })

  await prisma.page.delete({ where: { id } })
  revalidateTag(CONTENT_TAG)
  return NextResponse.json({ success: true })
}
