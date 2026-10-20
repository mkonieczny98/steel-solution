import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { PageBlocks } from '@/components/blocks/page-blocks'
import { getCategory, getCategoryProjects } from '@/lib/data'
import { entityBlocks } from '@/lib/blocks'
import { sized } from '@/lib/images'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return {}
  const image = category.heroImage || category.image
  return {
    title: category.metaTitle || category.name,
    description: category.metaDescription || category.description || undefined,
    alternates: { canonical: `/oferta/produkty/${category.slug}` },
    openGraph: image ? { images: [sized(image, 1200)] } : undefined,
  }
}

// Układ strony kategorii składa się z sekcji edytowanych w panelu: Kategorie → Układ strony
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()

  const projects = await getCategoryProjects(category.id)

  return (
    <>
      <PublicHeader />
      <main id="main">
        <PageBlocks
          blocks={entityBlocks(category.blocks, 'category')}
          title={category.name}
          context={{ kind: 'category', category, projects }}
          crumbs={[
            { name: 'Oferta', href: '/oferta' },
            { name: 'Produkty', href: '/oferta/produkty' },
            { name: category.name },
          ]}
        />
      </main>
      <PublicFooter />
    </>
  )
}
