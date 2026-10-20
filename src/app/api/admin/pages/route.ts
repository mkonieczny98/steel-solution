import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CONTENT_TAG } from '@/lib/data'
import { PAGE_TEMPLATES } from '@/lib/blocks'
import { normalizeSlug } from '@/lib/pages-admin'

// POST /api/admin/pages – nowa strona z szablonu ({ title, slug, template })
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { title?: unknown; slug?: unknown; template?: unknown }
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 200) : ''
    if (!title) return NextResponse.json({ error: 'Podaj tytuł strony' }, { status: 400 })

    const normalized = normalizeSlug(body.slug || title)
    if ('error' in normalized) return NextResponse.json({ error: normalized.error }, { status: 400 })
    if (await prisma.page.findUnique({ where: { slug: normalized.slug } })) {
      return NextResponse.json({ error: `Strona o adresie „/${normalized.slug}” już istnieje` }, { status: 409 })
    }

    const template = PAGE_TEMPLATES.find((t) => t.key === body.template) ?? PAGE_TEMPLATES[0]
    const blocks = template.blocks()
    // Pierwszy blok (hero) dostaje tytuł strony, żeby nowa strona od razu miała sensowny nagłówek
    if (blocks[0]?.type === 'hero') blocks[0].data = { ...blocks[0].data, eyebrow: '', title, lead: '' }

    const page = await prisma.page.create({
      data: { title, slug: normalized.slug, published: false, content: JSON.stringify(blocks) },
    })
    revalidateTag(CONTENT_TAG)
    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json({ error: 'Nie udało się utworzyć strony' }, { status: 500 })
  }
}
