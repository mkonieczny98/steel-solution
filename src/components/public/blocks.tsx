import Link from 'next/link'
import { ArrowRight, ChevronRight, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { site } from '@/lib/site'
import { getSiteInfo } from '@/lib/content'
import { buttonClass } from '@/components/public/button-styles'
import { IMAGES, fallbackImage, isUnsplash } from '@/lib/images'
import { SmartImage } from '@/components/public/smart-image'

export { buttonClass } from '@/components/public/button-styles'

export type Crumb = { name: string; href?: string }

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all: Crumb[] = [{ name: 'Strona główna', href: '/' }, ...items]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${site.url}${item.href}` } : {}),
    })),
  }
  return (
    <nav aria-label="Ścieżka" className={cn('text-sm', className)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-1.5 text-zinc-400">
        {all.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />}
            {item.href && i < all.length - 1 ? (
              <Link href={item.href} className="transition-colors hover:text-white">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-zinc-200">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  breadcrumbs,
  children,
  aside,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  image?: string | null
  breadcrumbs?: Crumb[]
  children?: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {image && (
        <SmartImage src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
      <div className="bg-blueprint absolute inset-0 -z-10" />
      {image && isUnsplash(image) && <p className="absolute bottom-2 right-4 bg-ink/80 px-2 py-1 text-xs text-zinc-300">Zdjęcie poglądowe</p>}
      <div className="container py-10 lg:py-16">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-6" />}
        <div className={cn('grid gap-10', aside && 'lg:grid-cols-[1fr_380px] lg:items-end')}>
          <div className="max-w-3xl">
            {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
            <h1 className="heading-display text-5xl text-white sm:text-6xl lg:text-7xl">{title}</h1>
            {description && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">{description}</div>}
            {children && <div className="mt-9 flex flex-wrap gap-3">{children}</div>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  dark = false,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  align?: 'left' | 'center'
  dark?: boolean
}) {
  return (
    <div
      className={cn(
        'mb-12 flex flex-col gap-6',
        align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className={cn('heading-display text-4xl sm:text-5xl', dark ? 'text-white' : 'text-foreground')}>{title}</h2>
        {description && (
          <p className={cn('mt-4 text-lg leading-relaxed', dark ? 'text-zinc-400' : 'text-muted-foreground')}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function TextLink({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider',
        dark ? 'text-white' : 'text-foreground'
      )}
    >
      <span className="border-b-2 border-primary pb-0.5">{children}</span>
      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

type ProjectCardData = {
  slug: string
  title: string
  thumbnail: string | null
  description?: string | null
  vehicleBrand: string | null
  vehicleModel: string | null
  year?: string | null
  category?: { name: string; slug?: string } | null
}

export function ProjectCard({ project, priority = false }: { project: ProjectCardData; priority?: boolean }) {
  const vehicle = [project.vehicleBrand, project.vehicleModel].filter(Boolean).join(' ')
  return (
    <Link href={`/realizacje/${project.slug}`} className="group relative block overflow-hidden bg-ink">
      <div className="relative aspect-[4/3]">
        <SmartImage
          src={project.thumbnail || fallbackImage(project.category?.slug === 'zabudowy-pickup' ? 'pickup' : 'truck')}
          alt={project.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        {project.category && (
          <span className="absolute left-4 top-4 bg-primary px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wider text-white">
            {project.category.name}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5">
          {(vehicle || project.year) && (
            <p className="font-display text-sm font-semibold uppercase tracking-wider text-zinc-400">
              {[vehicle, project.year].filter(Boolean).join(' · ')}
            </p>
          )}
          <h3 className="mt-1 font-display text-2xl font-bold uppercase leading-tight text-white">{project.title}</h3>
          <span className="mt-3 inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-primary">
            Zobacz realizację
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}

type CategoryCardData = {
  slug: string
  name: string
  description: string | null
  image: string | null
  heroImage: string | null
}

export function CategoryCard({
  category,
  index,
  large = false,
  className,
}: {
  category: CategoryCardData
  index?: number
  large?: boolean
  className?: string
}) {
  return (
    <Link
      href={`/oferta/produkty/${category.slug}`}
      className={cn('group relative block overflow-hidden bg-ink', large ? 'min-h-[360px] lg:min-h-[420px]' : 'min-h-[240px] sm:min-h-[300px]', className)}
    >
      <SmartImage
        src={category.image || category.heroImage || fallbackImage('product')}
        alt={category.name}
        fill
        sizes={large ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'}
        className="object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col p-6">
        {index !== undefined && (
          <span className="font-display text-sm font-bold text-primary">{String(index + 1).padStart(2, '0')}</span>
        )}
        <h3 className={cn('heading-display mt-1 text-white', large ? 'text-4xl' : 'text-2xl')}>{category.name}</h3>
        {category.description && (
          <p className="mt-2 line-clamp-2 max-w-md text-sm text-zinc-300">{category.description}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-white">
          Zobacz ofertę
          <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

type BrandData = { id: string; slug: string; name: string; type: string; models?: string | null }

export function BrandGrid({ brands, dark = false }: { brands: BrandData[]; dark?: boolean }) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-4',
        dark ? 'bg-white/10' : 'bg-border'
      )}
    >
      {brands.map((brand) => {
        let models: string[] = []
        try {
          models = (JSON.parse(brand.models || '[]') as { name: string }[]).map((m) => m.name)
        } catch {}
        return (
          <li key={brand.id}>
            <Link
              href={`/oferta/pojazdy/${brand.slug}`}
              className={cn(
                'group flex h-full flex-col justify-between gap-4 p-5 transition-colors sm:p-6',
                dark ? 'bg-ink hover:bg-zinc-900' : 'bg-background hover:bg-white'
              )}
            >
              <span
                className={cn(
                  'font-display text-2xl font-bold uppercase leading-none tracking-wide transition-colors group-hover:text-primary sm:text-3xl',
                  dark ? 'text-white' : 'text-foreground'
                )}
              >
                {brand.name}
              </span>
              <span className="flex items-end justify-between gap-2">
                <span className={cn('line-clamp-1 text-xs', dark ? 'text-zinc-500' : 'text-muted-foreground')}>
                  {models.slice(0, 4).join(' · ')}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </span>
            </Link>
          </li>
        )
      })}
      <li className={cn(brands.length % 4 === 0 && 'col-span-2 sm:col-span-3 lg:col-span-4')}>
        <Link
          href="/kontakt#formularz"
          className="group flex h-full flex-col justify-between gap-4 bg-primary p-5 text-white transition-colors hover:bg-primary/90 sm:p-6"
        >
          <span className="font-display text-xl font-bold uppercase leading-tight sm:text-2xl">Inna marka?</span>
          <span className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wider text-white/80">
            Zapytaj – zrobimy na wymiar
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </li>
    </ul>
  )
}

export async function CtaBand({
  title,
  description,
  kategoria,
}: {
  title?: string
  description?: string
  kategoria?: string
}) {
  const info = await getSiteInfo()
  title = title || info.cta.title
  description = description || info.cta.description
  return (
    <section className="relative isolate overflow-hidden bg-primary">
      <SmartImage src={IMAGES.weldingSparks} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25 mix-blend-multiply" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/60" />
      <div className="container flex flex-col gap-10 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <h2 className="heading-display text-4xl text-white sm:text-5xl">{title}</h2>
          <p className="mt-4 text-lg text-white/85">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={kategoria ? `/kontakt?kategoria=${kategoria}#formularz` : '/kontakt#formularz'} className={buttonClass('dark', 'lg')}>
            Zamów wycenę
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a href={info.phoneHref} className={buttonClass('outline-light', 'lg')}>
            <Phone className="h-5 w-5" />
            {info.phone}
          </a>
        </div>
      </div>
    </section>
  )
}
