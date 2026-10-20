import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { SmartImage } from '@/components/public/smart-image'
import { BrandGrid, CategoryCard, CtaBand, PageHero, SectionHeader, TextLink, buttonClass } from '@/components/public/blocks'
import { getCategories, getStats, getVehicleBrands } from '@/lib/data'
import { IMAGES } from '@/lib/images'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Oferta – półki, skrytki, boksy, mocowania sprzętu',
  description:
    'Pełna oferta zabudów do wozów strażackich i pojazdów służb. Półki do kabin MAN, Scania, Volvo, Mercedes. Zabudowy pickupów Toyota Hilux, Ford Ranger, Nissan Navara.',
  alternates: { canonical: '/oferta' },
}

export default async function OfertaPage() {
  const [vehicleBrands, categories, stats] = await Promise.all([getVehicleBrands(), getCategories(), getStats()])
  const trucks = vehicleBrands.filter((b) => b.type === 'truck')
  const pickups = vehicleBrands.filter((b) => b.type === 'pickup')

  const paths = [
    {
      title: 'Wybierz pojazd',
      text: 'Masz konkretne podwozie? Zobacz produkty dopasowane do kabiny i nadwozia Twojej marki.',
      href: '/oferta/pojazdy',
      cta: `Przeglądaj ${stats.brands} marek`,
      image: IMAGES.fireTruckForest,
    },
    {
      title: 'Wybierz produkt',
      text: 'Szukasz konkretnego rozwiązania? Półki, boksy, podesty, mocowania i kompletne zabudowy.',
      href: '/oferta/produkty',
      cta: `Przeglądaj ${stats.categories} kategorii`,
      image: IMAGES.hoseCompartment,
    },
  ]

  return (
    <>
      <PublicHeader />

      <main id="main">
        <PageHero
          eyebrow="Oferta"
          title={
            <>
              Wyposażenie <span className="text-primary">dla służb</span>
            </>
          }
          description="Projektujemy i wykonujemy wyposażenie do wozów strażackich, pojazdów ratowniczych i pickupów. Szukaj według marki pojazdu albo rodzaju produktu."
          image={IMAGES.fireTruckGarage}
          breadcrumbs={[{ name: 'Oferta' }]}
        >
          <Link href="/kontakt" className={buttonClass('primary', 'lg')}>
            Bezpłatna wycena
            <ArrowRight className="h-5 w-5" />
          </Link>
        </PageHero>

        <section className="py-16 lg:py-24">
          <div className="container grid gap-3 lg:grid-cols-2">
            {paths.map((path) => (
              <Link key={path.href} href={path.href} className="group relative isolate flex min-h-[360px] flex-col justify-end overflow-hidden bg-ink p-8 lg:min-h-[440px] lg:p-10">
                <SmartImage
                  src={path.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="-z-20 object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                <h2 className="heading-display text-5xl text-white">{path.title}</h2>
                <p className="mt-3 max-w-md text-zinc-300">{path.text}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-white">
                  <span className="border-b-2 border-primary pb-0.5">{path.cta}</span>
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-blueprint-light border-y bg-muted/40 py-16 lg:py-24">
          <div className="container">
            <SectionHeader
              eyebrow="Produkty"
              title="Co produkujemy"
              action={<TextLink href="/oferta/produkty">Wszystkie produkty</TextLink>}
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, i) => (
                <CategoryCard key={category.id} category={category} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container space-y-14">
            <div>
              <SectionHeader
                eyebrow="Pojazdy ciężarowe"
                title="Wozy strażackie"
                description="Zabudowy i wyposażenie kabin do podwozi ciężarowych."
                action={<TextLink href="/oferta/pojazdy">Wszystkie pojazdy</TextLink>}
              />
              <BrandGrid brands={trucks} />
            </div>
            <div>
              <SectionHeader eyebrow="Pickupy i SUV" title="Zabudowy pickupów" description="Zabudowy skrzyni ładunkowej, hardtopy i systemy organizacji sprzętu." />
              <BrandGrid brands={pickups} />
            </div>
          </div>
        </section>

        <CtaBand title="Nie znalazłeś tego, czego szukasz?" description="Wykonujemy też produkty na indywidualne zamówienie. Opisz, czego potrzebujesz – przygotujemy ofertę." />
      </main>

      <PublicFooter />
    </>
  )
}
