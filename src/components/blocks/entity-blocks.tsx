import Link from 'next/link'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseJson, type getCategory, type getVehicleBrand, type ProjectWithCategory } from '@/lib/data'
import { fallbackImage } from '@/lib/images'
import { SmartImage } from '@/components/public/smart-image'
import { Gallery } from '@/components/public/gallery'
import { BrandGrid, CategoryCard, PageHero, ProjectCard, SectionHeader, TextLink, type Crumb } from '@/components/public/blocks'
import { buttonClass } from '@/components/public/button-styles'

type CategoryData = NonNullable<Awaited<ReturnType<typeof getCategory>>>
type BrandData = NonNullable<Awaited<ReturnType<typeof getVehicleBrand>>>

// Dane strony kategorii / marki, z których korzystają sekcje „z danych”
export type EntityContext =
  | { kind: 'category'; category: CategoryData; projects: ProjectWithCategory[] }
  | { kind: 'brand'; brand: BrandData; projects: ProjectWithCategory[] }

type D = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
type Props = { d: D; ctx: EntityContext; first: boolean; crumbs?: Crumb[] }

const str = (v: unknown) => (typeof v === 'string' ? v : '')

// {nazwa}, {nazwa_male}, {slug} w tekstach sekcji; w linkach wartości są kodowane do adresu URL
export function entityTokens(ctx: EntityContext) {
  const name = ctx.kind === 'category' ? ctx.category.name : ctx.brand.name
  const slug = ctx.kind === 'category' ? ctx.category.slug : ctx.brand.slug
  return { nazwa: name, nazwa_male: name.toLocaleLowerCase('pl-PL'), slug }
}

export function applyTokens<T>(value: T, tokens: Record<string, string>, key = ''): T {
  if (typeof value === 'string') {
    const encode = key.endsWith('Href')
    return value.replace(/\{(nazwa_male|nazwa|slug)\}/g, (_, t: string) => (encode ? encodeURIComponent(tokens[t]) : tokens[t])) as T
  }
  if (Array.isArray(value)) return value.map((v) => applyTokens(v, tokens)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, applyTokens(v, tokens, k)])) as T
  }
  return value
}

function entityImages(ctx: EntityContext) {
  const e = ctx.kind === 'category' ? ctx.category : ctx.brand
  const gallery = parseJson<string[]>(e.gallery, [])
  const fallback = fallbackImage(ctx.kind === 'brand' ? (ctx.brand.type === 'pickup' ? 'pickup' : 'truck') : 'product')
  return { gallery, hero: e.heroImage || e.image || fallback, main: e.image || e.heroImage || fallback }
}

export function EntityHeroBlock({ d, ctx, crumbs }: Props) {
  const { hero } = entityImages(ctx)
  if (ctx.kind === 'category') {
    const c = ctx.category
    const specs = parseJson<{ label: string; value: string }[]>(c.specifications, [])
    const hasVehicles = c.vehicleBrands.some((vb) => vb.vehicleBrand.published)
    return (
      <PageHero
        eyebrow={str(d.eyebrow) || 'Kategoria produktów'}
        title={c.name}
        description={c.longDescription || c.description}
        image={hero}
        breadcrumbs={crumbs}
        aside={
          d.showAside && specs.length > 0 ? (
            <dl className="clip-corner-lg border border-white/10 bg-ink/80 p-6 backdrop-blur">
              {specs.slice(0, 4).map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4 border-b border-white/10 py-3 last:border-0">
                  <dt className="text-sm text-zinc-400">{spec.label}</dt>
                  <dd className="text-right font-display font-semibold uppercase tracking-wide text-white">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : undefined
        }
      >
        {str(d.primaryLabel) && (
          <Link href={`/kontakt?kategoria=${c.slug}#formularz`} className={buttonClass('primary', 'lg')}>
            {d.primaryLabel}
            <ArrowRight className="h-5 w-5" />
          </Link>
        )}
        {str(d.secondaryLabel) && hasVehicles && (
          <a href="#pojazdy" className={buttonClass('outline-light', 'lg')}>
            {d.secondaryLabel}
          </a>
        )}
      </PageHero>
    )
  }

  const brand = ctx.brand
  const models = parseJson<{ name: string; years?: string }[]>(brand.models, [])
  const hasCategories = brand.categories.some((c) => c.category.published)
  return (
    <PageHero
      eyebrow={str(d.eyebrow) || (brand.type === 'pickup' ? 'Pickup / SUV' : 'Pojazd ciężarowy')}
      title={
        <>
          Zabudowy <span className="text-primary">{brand.name}</span>
        </>
      }
      description={brand.longDescription || brand.description}
      image={hero}
      breadcrumbs={crumbs}
      aside={
        d.showAside && models.length > 0 ? (
          <div className="clip-corner-lg border border-white/10 bg-ink/80 p-6 backdrop-blur">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Obsługiwane modele</p>
            <ul className="mt-3">
              {models.map((model) => (
                <li key={model.name} className="flex justify-between gap-4 border-b border-white/10 py-3 last:border-0">
                  <span className="font-display text-lg font-semibold uppercase text-white">{model.name}</span>
                  {model.years && <span className="text-sm text-zinc-400">{model.years}</span>}
                </li>
              ))}
            </ul>
          </div>
        ) : undefined
      }
    >
      {str(d.primaryLabel) && (
        <Link href={`/kontakt?pojazd=${encodeURIComponent(brand.name)}#formularz`} className={buttonClass('primary', 'lg')}>
          {d.primaryLabel}
          <ArrowRight className="h-5 w-5" />
        </Link>
      )}
      {str(d.secondaryLabel) && hasCategories && (
        <a href="#produkty" className={buttonClass('outline-light', 'lg')}>
          {d.secondaryLabel}
        </a>
      )}
    </PageHero>
  )
}

export function CategoryFeaturesBlock({ d, ctx }: Props) {
  if (ctx.kind !== 'category') return null
  const features = parseJson<string[]>(ctx.category.features, [])
  const benefits = parseJson<string[]>(ctx.category.benefits, [])
  if (features.length === 0 && benefits.length === 0) return null
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="grid gap-px border bg-border lg:grid-cols-2">
          {features.length > 0 && (
            <div className="bg-background p-8 lg:p-12">
              {str(d.featuresEyebrow) && <p className="eyebrow mb-4">{d.featuresEyebrow}</p>}
              <h2 className="heading-display text-3xl">{d.featuresTitle}</h2>
              <ul className="mt-8 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {benefits.length > 0 && (
            <div className="bg-ink p-8 text-white lg:p-12">
              {str(d.benefitsEyebrow) && <p className="eyebrow mb-4">{d.benefitsEyebrow}</p>}
              <h2 className="heading-display text-3xl">{d.benefitsTitle}</h2>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-zinc-200">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function EntityDescriptionBlock({ d, ctx }: Props) {
  const text = ctx.kind === 'category' ? ctx.category.contentDescription : ctx.brand.contentDescription
  if (!text) return null
  const { gallery, main, hero } = entityImages(ctx)
  const image = str(d.image) || (ctx.kind === 'category' ? gallery[1] || gallery[0] || main : gallery[1] || hero)
  const name = ctx.kind === 'category' ? ctx.category.name : ctx.brand.name
  const eyebrow = str(d.eyebrow) || (ctx.kind === 'brand' ? ctx.brand.fullName || ctx.brand.name : '')
  return (
    <section className="border-y bg-muted/40 py-16 lg:py-24">
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className={cn(d.imagePosition === 'left' && 'lg:order-2')}>
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h2 className="heading-display text-4xl sm:text-5xl">{d.title}</h2>
          <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{text}</p>
        </div>
        <div className="clip-corner-lg relative aspect-[4/3] overflow-hidden bg-muted">
          <SmartImage src={image} alt={name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  )
}

export function CategorySpecsBlock({ d, ctx }: Props) {
  if (ctx.kind !== 'category') return null
  const specs = parseJson<{ label: string; value: string }[]>(ctx.category.specifications, [])
  if (specs.length === 0) return null
  return (
    <section className="py-16 lg:py-24">
      <div className="container max-w-4xl">
        <SectionHeader eyebrow={str(d.eyebrow) || undefined} title={str(d.title)} />
        <dl className="divide-y border-y">
          {specs.map((spec) => (
            <div key={spec.label} className="grid gap-1 py-4 sm:grid-cols-3">
              <dt className="text-muted-foreground">{spec.label}</dt>
              <dd className="font-semibold sm:col-span-2">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export function EntityGalleryBlock({ d, ctx }: Props) {
  const { gallery } = entityImages(ctx)
  if (gallery.length === 0) return null
  const name = ctx.kind === 'category' ? ctx.category.name : `Zabudowa ${ctx.brand.name}`
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <SectionHeader eyebrow={str(d.eyebrow) || undefined} title={str(d.title)} />
        <Gallery images={gallery} alt={name} />
      </div>
    </section>
  )
}

export function CategoryVehiclesBlock({ d, ctx }: Props) {
  if (ctx.kind !== 'category') return null
  const vehicles = ctx.category.vehicleBrands.map((vb) => vb.vehicleBrand).filter((v) => v.published)
  if (vehicles.length === 0) return null
  return (
    <section id="pojazdy" className="scroll-mt-24 border-t bg-muted/40 py-16 lg:py-24">
      <div className="container">
        <SectionHeader eyebrow={str(d.eyebrow) || undefined} title={str(d.title)} description={str(d.description) || undefined} />
        <BrandGrid brands={vehicles} />
      </div>
    </section>
  )
}

export function BrandCategoriesBlock({ d, ctx }: Props) {
  if (ctx.kind !== 'brand') return null
  const categories = ctx.brand.categories.map((c) => c.category).filter((c) => c.published)
  if (categories.length === 0) return null
  return (
    <section id="produkty" className="scroll-mt-24 py-16 lg:py-24">
      <div className="container">
        <SectionHeader eyebrow={str(d.eyebrow) || undefined} title={str(d.title)} description={str(d.description) || undefined} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => (
            <CategoryCard key={category.id} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function EntityProjectsBlock({ d, ctx }: Props) {
  if (ctx.projects.length === 0) return null
  const href = ctx.kind === 'category' ? `/realizacje?kategoria=${ctx.category.slug}` : '/realizacje'
  return (
    <section className="border-t py-16 lg:py-24">
      <div className="container">
        <SectionHeader
          eyebrow={str(d.eyebrow) || undefined}
          title={str(d.title)}
          action={str(d.linkLabel) ? <TextLink href={href}>{d.linkLabel}</TextLink> : undefined}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ctx.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
