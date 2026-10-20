import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readDraft } from '@/lib/page-snapshots'
import { parseBlocks } from '@/lib/blocks'
import { PageBlocks } from '@/components/blocks/page-blocks'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Podgląd szkicu', robots: { index: false, follow: false } }
export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  if (!await getServerSession(authOptions)) notFound()
  const page = await prisma.page.findUnique({ where: { id: (await params).id } })
  if (!page) notFound()
  const draft = readDraft(page.draft, page)
  return <><div className="bg-amber-100 p-3 text-center text-sm text-amber-950">Podgląd zapisanej wersji · widoczny tylko po zalogowaniu. <Link className="underline" href={`/admin/strony/${page.id}`}>Wróć do edytora</Link></div><PublicHeader /><main id="main"><PageBlocks blocks={parseBlocks(draft.content)} title={draft.title} /></main><PublicFooter /></>
}
