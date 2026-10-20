import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { PageBlocks } from '@/components/blocks/page-blocks'
import { prisma } from '@/lib/prisma'
import { getPage } from '@/lib/content'
import { SYSTEM_PAGES } from '@/lib/blocks'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

const systemSlugs: string[] = Object.values(SYSTEM_PAGES).map((p) => p.slug)

// Strony utworzone w panelu (/admin/strony). Szkic widzi tylko zalogowany administrator.
async function loadPage(slug: string) {
  if (systemSlugs.includes(slug)) return { page: null, draft: false }
  const page = await getPage(slug)
  if (!page) {
    const redirect = await prisma.pageRedirect.findUnique({ where: { from: slug } })
    if (redirect) permanentRedirect(`/${redirect.to}`)
    return { page: null, draft: false }
  }
  if (page.published) return { page, draft: false }
  const session = await getServerSession(authOptions)
  return session ? { page, draft: true } : { page: null, draft: false }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { page, draft } = await loadPage(slug)
  if (!page) return {}
  return {
    title: page.title,
    description: page.description || undefined,
    alternates: { canonical: `/${page.slug}` },
    robots: draft ? { index: false, follow: false } : undefined,
  }
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params
  const { page, draft } = await loadPage(slug)
  if (!page) notFound()

  return (
    <>
      {draft && (
        <div className="bg-amber-400 py-2 text-center text-sm font-semibold text-ink">
          Szkic – strona nie jest opublikowana i widzisz ją tylko jako administrator.
        </div>
      )}
      <PublicHeader />
      <main id="main">
        <PageBlocks blocks={page.blocks} title={page.title} crumbs={[{ name: page.title }]} />
      </main>
      <PublicFooter />
    </>
  )
}
