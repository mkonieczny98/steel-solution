import type { Metadata } from 'next'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { PageBlocks } from '@/components/blocks/page-blocks'
import { getPage } from '@/lib/content'
import { SYSTEM_PAGES } from '@/lib/blocks'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(SYSTEM_PAGES.home.slug)
  return { alternates: { canonical: '/' }, ...(page?.description ? { description: page.description } : {}) }
}

// Treść strony głównej składa się z bloków edytowanych w panelu: /admin/strony
export default async function HomePage() {
  const page = await getPage(SYSTEM_PAGES.home.slug)

  return (
    <>
      <PublicHeader />
      <main id="main">
        <PageBlocks blocks={page?.blocks ?? []} title={page?.title ?? 'Strona główna'} />
      </main>
      <PublicFooter />
    </>
  )
}
