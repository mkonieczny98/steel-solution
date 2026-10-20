import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/header'
import { Button } from '@/components/ui/button'
import { PageBuilder } from '@/components/admin/page-builder'
import { readDraft } from '@/lib/page-snapshots'
import { SYSTEM_PAGES, parseBlocks } from '@/lib/blocks'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPagePage({ params }: Props) {
  const { id } = await params
  const page = await prisma.page.findUnique({ where: { id }, include: { revisions: { orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, createdAt: true } } } })
  if (!page) notFound()

  const draft = readDraft(page.draft, page)
  const publicPath = Object.values(SYSTEM_PAGES).find((p) => p.slug === page.slug)?.path ?? `/${page.slug}`

  return (
    <>
      <AdminHeader
        title={page.title}
        description="Dodawaj, przestawiaj i edytuj sekcje strony"
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/strony">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Wszystkie strony
            </Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-5xl p-6">
        <PageBuilder
          page={{
            id: page.id,
            title: draft.title,
            slug: draft.slug,
            description: draft.description,
            published: draft.published,
            showInMenu: draft.showInMenu,
            sortOrder: draft.sortOrder,
            system: page.system,
            publicPath,
            version: page.updatedAt.toISOString(),
          }}
          initialBlocks={parseBlocks(draft.content)}
          revisions={page.revisions.map(r => ({ id: r.id, createdAt: r.createdAt.toISOString() }))}
        />
      </div>
    </>
  )
}
