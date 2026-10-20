import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { PageBlocks } from '@/components/blocks/page-blocks'
import { getBrandProjects, getVehicleBrand } from '@/lib/data'
import { entityBlocks } from '@/lib/blocks'
import { sized } from '@/lib/images'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getVehicleBrand(slug)
  if (!brand) return {}
  const image = brand.heroImage || brand.image
  return {
    title: brand.metaTitle || `Zabudowy ${brand.name}`,
    description: brand.metaDescription || brand.description || undefined,
    alternates: { canonical: `/oferta/pojazdy/${brand.slug}` },
    openGraph: image ? { images: [sized(image, 1200)] } : undefined,
  }
}

// Układ strony marki składa się z sekcji edytowanych w panelu: Marki pojazdów → Układ strony
export default async function VehicleBrandPage({ params }: Props) {
  const { slug } = await params
  const brand = await getVehicleBrand(slug)
  if (!brand) notFound()

  const projects = await getBrandProjects(brand.name)

  return (
    <>
      <PublicHeader />
      <main id="main">
        <PageBlocks
          blocks={entityBlocks(brand.blocks, 'brand')}
          title={`Zabudowy ${brand.name}`}
          context={{ kind: 'brand', brand, projects }}
          crumbs={[
            { name: 'Oferta', href: '/oferta' },
            { name: 'Pojazdy', href: '/oferta/pojazdy' },
            { name: brand.name },
          ]}
        />
      </main>
      <PublicFooter />
    </>
  )
}
