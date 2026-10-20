import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { SmartImage } from '@/components/public/smart-image'
import { CtaBand, PageHero, SectionHeader } from '@/components/public/blocks'
import { getVehicleBrands, parseJson } from '@/lib/data'
import { IMAGES, fallbackImage } from '@/lib/images'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Zabudowy według marki pojazdu – MAN, Scania, Volvo, Mercedes',
  description:
    'Zabudowy do wozów strażackich i pickupów. Wybierz markę pojazdu: MAN, Scania, Volvo, Mercedes-Benz, Renault, Iveco, DAF, Toyota Hilux, Ford Ranger, Nissan Navara.',
  alternates: { canonical: '/oferta/pojazdy' },
}

type Brand = Awaited<ReturnType<typeof getVehicleBrands>>[number]

function BrandCard({ brand }: { brand: Brand }) {
  const models = parseJson<{ name: string }[]>(brand.models, []).map((m) => m.name)
  const categories = brand.categories.map((c) => c.category).filter((c) => c.published)
  return (
    <Link href={`/oferta/pojazdy/${brand.slug}`} className="group flex flex-col overflow-hidden border bg-card transition-colors hover:border-ink">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink">
        <SmartImage
          src={brand.image || brand.heroImage || fallbackImage(brand.type === 'pickup' ? 'pickup' : 'truck')}
          alt={`Zabudowa ${brand.name}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
        <h3 className="heading-display absolute bottom-4 left-5 text-4xl text-white">{brand.name}</h3>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {brand.description && <p className="text-sm leading-relaxed text-muted-foreground">{brand.description}</p>}
        {models.length > 0 && (
          <p className="mt-4 font-display text-sm font-semibold uppercase tracking-wide">{models.join(' · ')}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-5 text-sm">
          <span className="text-muted-foreground">
            {categories.length} {categories.length === 1 ? 'kategoria' : categories.length < 5 ? 'kategorie' : 'kategorii'} produktów
          </span>
          <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

export default async function PojazdyPage() {
  const brands = await getVehicleBrands()
  const trucks = brands.filter((b) => b.type === 'truck')
  const pickups = brands.filter((b) => b.type === 'pickup')

  return (
    <>
      <PublicHeader />

      <main id="main">
        <PageHero
          eyebrow="Pojazdy"
          title="Wybierz swój pojazd"
          description="Zabudowy dopasowane do konkretnej kabiny i nadwozia. Znamy wymiary, punkty mocowań i ograniczenia każdego z tych podwozi."
          image={IMAGES.ladderTruck}
          breadcrumbs={[{ name: 'Oferta', href: '/oferta' }, { name: 'Pojazdy' }]}
        />

        <section id="ciezarowe" className="scroll-mt-24 py-16 lg:py-24">
          <div className="container">
            <SectionHeader eyebrow="Pojazdy ciężarowe" title="Wozy strażackie" description="Zabudowy i wyposażenie kabin do podwozi ciężarowych." />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trucks.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          </div>
        </section>

        <section id="pickupy" className="scroll-mt-24 border-t bg-muted/40 py-16 lg:py-24">
          <div className="container">
            <SectionHeader eyebrow="Pickupy i SUV" title="Zabudowy pickupów" description="Hardtopy, zabudowy serwisowe i systemy organizacji ładunku." />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pickups.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          </div>
        </section>

        <CtaBand title="Nie ma Twojej marki?" description="Wykonujemy zabudowy także do innych pojazdów. Podaj markę i model – sprawdzimy możliwości." />
      </main>

      <PublicFooter />
    </>
  )
}
