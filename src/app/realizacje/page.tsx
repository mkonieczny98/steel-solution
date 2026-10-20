import Link from 'next/link'
import type { Metadata } from 'next'
import { Truck } from 'lucide-react'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { CtaBand, PageHero, ProjectCard } from '@/components/public/blocks'
import { getCategories, getProjects } from '@/lib/data'
import { IMAGES } from '@/lib/images'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ kategoria?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { kategoria } = await searchParams
  return {
    title: 'Realizacje',
    description: 'Zobacz nasze realizacje: zabudowy wozów strażackich, półki do kabin, zabudowy pickupów i inne projekty dla służb.',
    alternates: { canonical: '/realizacje' },
    // Widoki przefiltrowane nie powinny konkurować w wyszukiwarce z główną listą
    robots: kategoria ? { index: false, follow: true } : undefined,
  }
}

export default async function RealizacjePage({ searchParams }: Props) {
  const active = (await searchParams).kategoria
  const [projects, allProjects, categories] = await Promise.all([getProjects(active), getProjects(), getCategories()])

  // Pokazujemy tylko kategorie, w których są realizacje
  const withProjects = categories.filter((c) => allProjects.some((p) => p.categoryId === c.id))
  const activeCategory = categories.find((c) => c.slug === active)

  const filters = [
    { name: 'Wszystkie', href: '/realizacje', active: !active, count: allProjects.length },
    ...withProjects.map((c) => ({
      name: c.name,
      href: `/realizacje?kategoria=${c.slug}`,
      active: c.slug === active,
      count: allProjects.filter((p) => p.categoryId === c.id).length,
    })),
  ]

  return (
    <>
      <PublicHeader />

      <main id="main">
        <PageHero
          eyebrow="Portfolio"
          title="Realizacje"
          description="Pojazdy, które przeszły przez nasz warsztat. Każda zabudowa projektowana pod konkretną jednostkę i jej sprzęt."
          image={IMAGES.fireTruckForest}
          breadcrumbs={[{ name: 'Realizacje' }]}
        />

        <nav aria-label="Filtruj realizacje" className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur lg:top-20">
          <div className="container flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
            {filters.map((filter) => (
              <Link
                key={filter.href}
                href={filter.href}
                scroll={false}
                aria-current={filter.active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2 border px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide transition-colors',
                  filter.active ? 'border-ink bg-ink text-white' : 'text-muted-foreground hover:border-primary hover:text-primary'
                )}
              >
                {filter.name}
                <span className={cn('text-xs', filter.active ? 'text-primary' : 'text-muted-foreground/70')}>{filter.count}</span>
              </Link>
            ))}
          </div>
        </nav>

        <section className="py-12 lg:py-20">
          <div className="container">
            {activeCategory && (
              <p className="mb-8 text-muted-foreground">
                Realizacje w kategorii <strong className="text-foreground">{activeCategory.name}</strong> ·{' '}
                <Link href={`/oferta/produkty/${activeCategory.slug}`} className="text-primary hover:underline">
                  zobacz ofertę
                </Link>
              </p>
            )}
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed py-20 text-center">
                <Truck className="h-14 w-14 text-muted-foreground/40" />
                <h2 className="heading-display mt-4 text-3xl">Brak realizacji</h2>
                <p className="mt-2 text-muted-foreground">W tej kategorii wkrótce pojawią się nasze projekty.</p>
                <Link href="/realizacje" className="mt-6 text-sm font-semibold text-primary hover:underline">
                  Pokaż wszystkie realizacje
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} priority={i < 3} />
                ))}
              </div>
            )}
          </div>
        </section>

        <CtaBand title="Twój pojazd może być następny" />
      </main>

      <PublicFooter />
    </>
  )
}
