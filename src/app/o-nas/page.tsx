import type { Metadata } from 'next'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { PageBlocks } from '@/components/blocks/page-blocks'
import { getPage } from '@/lib/content'
import { SYSTEM_PAGES } from '@/lib/blocks'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(SYSTEM_PAGES.about.slug)
  return {
    title: 'O nas',
    description:
      page?.description ||
      'Steel Solution projektuje i wykonuje zabudowy wozów strażackich, półki do kabin, boksy i mocowania sprzętu. Poznaj nasz sposób pracy.',
    alternates: { canonical: '/o-nas' },
  }
}

// Treść strony „O nas” składa się z bloków edytowanych w panelu: /admin/strony
export default async function ONasPage() {
  const page = await getPage(SYSTEM_PAGES.about.slug)

  return (
    <>
      <PublicHeader />
      <main id="main">
        <PageBlocks blocks={page?.blocks ?? []} title="O nas" crumbs={[{ name: 'O nas' }]} />
      </main>
      <PublicFooter />
    </>
  )
}
