import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { SmartImage } from '@/components/public/smart-image'
import { CtaBand, PageHero, buttonClass } from '@/components/public/blocks'
import { getCategories, parseJson } from '@/lib/data'
import { IMAGES, fallbackImage } from '@/lib/images'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Produkty dla służb – półki, boksy, podesty, mocowania',
  description:
    'Produkty dla straży pożarnej i służb ratowniczych: półki do kabin, boksy narzędziowe, podesty, mocowania sprzętu, skrzynie dachowe i zabudowy pickupów.',
  alternates: { canonical: '/oferta/produkty' },
}

export default async function ProduktyPage() {
  const categories = await getCategories()

  return (
    <>
      <PublicHeader />

      <main id="main">
        <PageHero
          eyebrow="Produkty"
          title="Nasze produkty"
          description="Wybierz kategorię, aby zobaczyć szczegóły, specyfikację i kompatybilne pojazdy. Każdy produkt wykonujemy na wymiar."
          image={IMAGES.weldingSparks}
          breadcrumbs={[{ name: 'Oferta', href: '/oferta' }, { name: 'Produkty' }]}
        />

        {/* Szybka nawigacja po kategoriach */}
        <nav aria-label="Kategorie produktów" className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur lg:top-20">
          <div className="container flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.slug}`}
                className="shrink-0 border px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {category.name}
              </a>
            ))}
          </div>
        </nav>

        <section className="py-12 lg:py-20">
          <div className="container space-y-6 lg:space-y-10">
            {categories.map((category, i) => {
              const features = parseJson<string[]>(category.features, [])
              const brands = category.vehicleBrands.map((vb) => vb.vehicleBrand).filter((b) => b.published)
              const projectCount = category._count.projects
              return (
                <article
                  key={category.id}
                  id={category.slug}
                  className="grid scroll-mt-40 overflow-hidden border bg-card lg:grid-cols-2"
                >
                  <Link
                    href={`/oferta/produkty/${category.slug}`}
                    className={cn('group relative block min-h-[260px] bg-ink lg:min-h-[420px]', i % 2 === 1 && 'lg:order-2')}
                  >
                    <SmartImage
                      src={category.image || category.heroImage || fallbackImage('product')}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-5 top-5 bg-ink px-3 py-1.5 font-display text-lg font-bold text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </Link>
                  <div className="flex flex-col p-6 sm:p-8 lg:p-12">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="heading-display text-4xl">{category.name}</h2>
                      {projectCount > 0 && (
                        <span className="bg-muted px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {projectCount} {projectCount === 1 ? 'realizacja' : projectCount < 5 ? 'realizacje' : 'realizacji'}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {category.longDescription || category.description}
                    </p>
                    {features.length > 0 && (
                      <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                        {features.slice(0, 6).map((feature) => (
                          <li key={feature} className="flex gap-2.5 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    {brands.length > 0 && (
                      <div className="mt-6">
                        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Dla pojazdów</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {brands.map((brand) => (
                            <Link
                              key={brand.slug}
                              href={`/oferta/pojazdy/${brand.slug}`}
                              className="border px-2 py-1 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
                            >
                              {brand.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-8 flex flex-wrap gap-3 lg:mt-auto lg:pt-8">
                      <Link href={`/oferta/produkty/${category.slug}`} className={buttonClass('dark')}>
                        Szczegóły
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link href={`/kontakt?kategoria=${category.slug}`} className={buttonClass('outline-dark')}>
                        Zapytaj o wycenę
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <CtaBand title="Potrzebujesz czegoś nietypowego?" description="Wykonujemy też produkty według indywidualnej specyfikacji jednostki." />
      </main>

      <PublicFooter />
    </>
  )
}
