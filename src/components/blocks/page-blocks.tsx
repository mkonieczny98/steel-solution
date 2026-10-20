import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Check,
  Clock,
  Flame,
  Hammer,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Quote,
  Ruler,
  Shield,
  Truck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCategories, getFeaturedProjects, getProjects, getStats, getVehicleBrands } from '@/lib/data'
import { fillStats, getSiteInfo } from '@/lib/content'
import { fallbackImage, isUnsplash } from '@/lib/images'
import type { Block, BlockType } from '@/lib/blocks'
import { SmartImage } from '@/components/public/smart-image'
import { Gallery } from '@/components/public/gallery'
import { BrandGrid, Breadcrumbs, CategoryCard, ProjectCard, SectionHeader, TextLink, type Crumb } from '@/components/public/blocks'
import { buttonClass } from '@/components/public/button-styles'
import { VideoEmbed } from '@/components/blocks/video-embed'
import {
  BrandCategoriesBlock,
  CategoryFeaturesBlock,
  CategorySpecsBlock,
  CategoryVehiclesBlock,
  EntityDescriptionBlock,
  EntityGalleryBlock,
  EntityHeroBlock,
  EntityProjectsBlock,
  applyTokens,
  entityTokens,
  type EntityContext,
} from '@/components/blocks/entity-blocks'

type D = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
type Stat = { value: string; label: string }

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const list = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : [])
const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href)

function SmartLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (isExternal(href)) {
    return (
      <a href={href} className={className} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href || '/'} className={className}>
      {children}
    </Link>
  )
}

function Accent({ title, accent }: { title: string; accent?: string }) {
  return (
    <>
      {title}
      {accent && <span className="text-primary"> {accent}</span>}
    </>
  )
}

const sectionBg = (bg: unknown) =>
  bg === 'dark' ? 'bg-blueprint bg-ink' : bg === 'muted' ? 'bg-blueprint-light border-y bg-muted/40' : ''

function Section({ bg, className, children }: { bg?: unknown; className?: string; children: React.ReactNode }) {
  return <section className={cn('py-14 lg:py-20', sectionBg(bg), className)}>{children}</section>
}

async function StatsBar({ items, className }: { items: Stat[]; className?: string }) {
  if (items.length === 0) return null
  const stats = await getStats().catch(() => ({ brands: 0, categories: 0, projects: 0 }))
  return (
    <dl className={cn('container grid grid-cols-2', items.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3', className)}>
      {items.map((stat, i) => (
        <div
          key={i}
          className={cn('flex items-baseline gap-3 py-5 lg:py-7', i % 2 === 1 && 'pl-4 lg:pl-0', i > 0 && 'lg:border-l lg:border-white/10 lg:pl-8')}
        >
          <dt className="sr-only">{fillStats(stat.label, stats)}</dt>
          <dd className="font-display text-3xl font-bold text-white lg:text-4xl">{fillStats(stat.value, stats)}</dd>
          <dd className="text-xs uppercase tracking-wider text-zinc-400 lg:text-sm">{fillStats(stat.label, stats)}</dd>
        </div>
      ))}
    </dl>
  )
}

// ---------------- Bloki ----------------

async function HeroBlock({ d, first, crumbs }: { d: D; first: boolean; crumbs?: Crumb[] }) {
  const full = d.size === 'full'
  const stats = list<Stat>(d.stats)
  const Heading = first ? 'h1' : 'h2'
  return (
    <section
      className={cn(
        'relative isolate flex flex-col overflow-hidden bg-ink',
        full && 'min-h-[560px] lg:min-h-[620px]'
      )}
    >
      <SmartImage
        src={str(d.image) || fallbackImage('truck')}
        alt=""
        fill
        priority={first}
        sizes="100vw"
        className={cn('-z-20 object-cover [object-position:var(--mobile-position)] sm:[object-position:var(--desktop-position)]', !full && 'opacity-40')}
        style={{ '--mobile-position': d.mobileImagePosition || 'right', '--desktop-position': d.imagePosition || 'center' } as React.CSSProperties}
      />
      <div className={cn('absolute inset-0 -z-10 bg-gradient-to-r', full ? 'from-ink via-ink/80 to-ink/10' : 'from-ink via-ink/85 to-ink/30')} />
      {full ? (
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-transparent to-transparent" />
      ) : (
        <div className="bg-blueprint absolute inset-0 -z-10" />
      )}
      <div className={cn('container flex flex-1 flex-col justify-center', full ? 'py-16 lg:py-24' : 'py-10 lg:py-16')}>
        {crumbs && <Breadcrumbs items={crumbs} className="mb-10" />}
        <div className="max-w-3xl">
          {str(d.eyebrow) && <p className={cn('eyebrow', full ? 'mb-6' : 'mb-5')}>{d.eyebrow}</p>}
          <Heading
            className={cn(
              'heading-display text-white',
              full ? 'text-[3.25rem] sm:text-7xl lg:text-8xl' : 'text-5xl sm:text-6xl lg:text-7xl'
            )}
          >
            <Accent title={str(d.title)} accent={str(d.titleAccent)} />
          </Heading>
          {str(d.lead) && (
            <p className={cn('mt-6 max-w-xl whitespace-pre-line leading-relaxed text-zinc-300', full ? 'text-lg sm:text-xl' : 'text-lg')}>
              {d.lead}
            </p>
          )}
          {(str(d.primaryLabel) || str(d.secondaryLabel)) && (
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {str(d.primaryLabel) && (
                <SmartLink href={str(d.primaryHref) || '/kontakt#formularz'} className={buttonClass('primary', 'lg')}>
                  {d.primaryLabel}
                  <ArrowRight className="h-5 w-5" />
                </SmartLink>
              )}
              {str(d.secondaryLabel) && (
                <SmartLink href={str(d.secondaryHref) || '/'} className={buttonClass('outline-light', 'lg')}>
                  {d.secondaryLabel}
                </SmartLink>
              )}
            </div>
          )}
        </div>
      </div>
      {isUnsplash(str(d.image)) && <p className="absolute bottom-3 right-4 bg-ink/80 px-2 py-1 text-xs text-zinc-300">Zdjęcie poglądowe</p>}
      {stats.length > 0 && (
        <div className="border-t border-white/10 bg-ink/60 backdrop-blur-sm">
          <StatsBar items={stats} />
        </div>
      )}
    </section>
  )
}

function TextImageBlock({ d }: { d: D }) {
  const dark = d.background === 'dark'
  const imageLeft = d.imagePosition === 'left'
  const paragraphs = str(d.text).split(/\n\s*\n/).filter(Boolean)
  const points = list<string>(d.points).filter(Boolean)
  return (
    <Section bg={d.background}>
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className={cn(imageLeft && 'lg:order-2')}>
          {str(d.eyebrow) && <p className="eyebrow mb-4">{d.eyebrow}</p>}
          <h2 className={cn('heading-display text-4xl sm:text-5xl', dark && 'text-white')}>
            <Accent title={str(d.title)} accent={str(d.titleAccent)} />
          </h2>
          <div className={cn('mt-6 space-y-4 text-lg leading-relaxed', dark ? 'text-zinc-400' : 'text-muted-foreground')}>
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
          {points.length > 0 && (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {points.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </span>
                  <span className={cn('font-medium', dark && 'text-white')}>{item}</span>
                </li>
              ))}
            </ul>
          )}
          {str(d.linkLabel) && (
            <div className="mt-10">
              <TextLink href={str(d.linkHref) || '/'} dark={dark}>
                {d.linkLabel}
              </TextLink>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="clip-corner-lg relative aspect-[4/5] overflow-hidden bg-muted sm:aspect-[4/3] lg:aspect-[4/3]">
            <SmartImage
              src={str(d.image) || fallbackImage('product')}
              alt={str(d.title)}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          {str(d.secondaryImage) && (
            <div
              className={cn(
                'absolute -bottom-8 hidden w-56 overflow-hidden border-8 sm:block lg:w-64',
                dark ? 'border-ink' : d.background === 'muted' ? 'border-muted' : 'border-background',
                imageLeft ? '-right-4 lg:-right-10' : '-left-4 lg:-left-10'
              )}
            >
              <div className="relative aspect-square">
                <SmartImage src={str(d.secondaryImage)} alt="" fill sizes="256px" className="object-cover" />
              </div>
            </div>
          )}
          {str(d.badgeValue) && (
            <div className={cn('absolute top-8 bg-ink px-5 py-4 text-white shadow-xl', imageLeft ? '-left-3 sm:-left-6' : '-right-3 sm:-right-6')}>
              <p className="font-display text-4xl font-bold leading-none text-primary">{d.badgeValue}</p>
              {str(d.badgeLabel) && <p className="mt-1 text-xs uppercase tracking-wider text-zinc-400">{d.badgeLabel}</p>}
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

const ICONS = { ruler: Ruler, wrench: Wrench, shield: Shield, users: Users, truck: Truck, clock: Clock, award: Award, check: Check, flame: Flame, package: Package, hammer: Hammer, zap: Zap, map: MapPin, phone: Phone }

function FeaturesBlock({ d }: { d: D }) {
  const dark = d.background === 'dark'
  const items = list<D>(d.items)
  return (
    <Section bg={d.background}>
      <div className="container">
        <SectionHeader dark={dark} eyebrow={str(d.eyebrow) || undefined} title={str(d.title)} description={str(d.description) || undefined} />
        <div
          className={cn(
            'grid gap-px sm:grid-cols-2',
            items.length % 3 === 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
            dark ? 'bg-white/10' : 'border bg-border'
          )}
        >
          {items.map((item, i) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS] || Check
            return (
              <div key={i} className={cn('p-8', dark ? 'bg-ink' : 'bg-background')}>
                <Icon className="h-9 w-9 text-primary" />
                <h3 className={cn('mt-6 font-display text-2xl font-bold uppercase leading-tight', dark && 'text-white')}>{item.title}</h3>
                <p className={cn('mt-3 whitespace-pre-line text-sm leading-relaxed', dark ? 'text-zinc-400' : 'text-muted-foreground')}>
                  {item.text}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

function StepsBlock({ d }: { d: D }) {
  const items = list<D>(d.items)
  return (
    <Section bg="dark">
      <div className="container">
        <SectionHeader
          dark
          eyebrow={str(d.eyebrow) || undefined}
          title={<Accent title={str(d.title)} accent={str(d.titleAccent)} />}
          description={str(d.description) || undefined}
        />
        <ol className={cn('grid gap-px bg-white/10 sm:grid-cols-2', items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4')}>
          {items.map((step, i) => (
            <li key={i} className="group relative flex flex-col bg-ink">
              {str(step.image) && (
                <div className="relative hidden aspect-[16/10] overflow-hidden sm:block">
                  <SmartImage
                    src={step.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover opacity-60 grayscale transition-all duration-500 group-hover:opacity-90 group-hover:grayscale-0"
                  />
                  <span className="absolute left-5 top-4 font-display text-6xl font-bold text-white/90">{String(i + 1).padStart(2, '0')}</span>
                </div>
              )}
              <div className="flex-1 border-t-2 border-primary p-6">
                <h3 className="flex items-baseline gap-3 font-display text-2xl font-bold uppercase text-white">
                  <span className={cn('text-primary', str(step.image) && 'sm:hidden')}>{String(i + 1).padStart(2, '0')}</span>
                  {step.title}
                </h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

function StatsBlock({ d }: { d: D }) {
  const bg = d.background
  return (
    <section className={cn(bg === 'red' ? 'bg-primary' : bg === 'light' ? 'border-y bg-muted/40' : 'bg-blueprint bg-ink', 'py-12 lg:py-16')}>
      {(str(d.eyebrow) || str(d.title)) && (
        <div className="container mb-6">
          {str(d.eyebrow) && <p className={cn('eyebrow mb-3', bg === 'red' && 'text-white before:bg-white')}>{d.eyebrow}</p>}
          {str(d.title) && <h2 className={cn('heading-display text-4xl', bg !== 'light' && 'text-white')}>{d.title}</h2>}
        </div>
      )}
      <div className={cn(bg === 'light' && '[&_dd]:!text-foreground [&_dd:last-child]:!text-muted-foreground', bg === 'red' && '[&_dd:last-child]:!text-white/80')}>
        <StatsBar items={list<Stat>(d.items)} />
      </div>
    </section>
  )
}

async function CategoriesBlock({ d }: { d: D }) {
  const all = await getCategories().catch(() => [])
  const categories = d.limit === 'all' ? all : all.slice(0, Number(d.limit) || 6)
  if (categories.length === 0) return null
  const bento = d.layout === 'bento' && categories.length >= 3
  const dark = d.background === 'dark'
  return (
    <Section bg={d.background}>
      <div className="container">
        <SectionHeader
          dark={dark}
          eyebrow={str(d.eyebrow) || undefined}
          title={str(d.title)}
          description={str(d.description) || undefined}
          action={<TextLink href="/oferta/produkty" dark={dark}>Wszystkie produkty</TextLink>}
        />
        <div className={cn('grid gap-3 sm:grid-cols-2', bento ? 'lg:grid-cols-3' : 'lg:grid-cols-4')}>
          {categories.map((category, i) => (
            <div key={category.id} className={cn(bento && i === 0 && 'sm:col-span-2 lg:row-span-2')}>
              <CategoryCard category={category} index={i} large={bento && i === 0} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

async function ProjectsBlock({ d }: { d: D }) {
  const limit = Number(d.limit) || 3
  const projects =
    d.source === 'latest'
      ? (await getProjects().catch(() => [])).slice(0, limit)
      : await getFeaturedProjects(limit).catch(() => [])
  if (projects.length === 0) return null
  const dark = d.background === 'dark'
  return (
    <Section bg={d.background}>
      <div className="container">
        <SectionHeader
          dark={dark}
          eyebrow={str(d.eyebrow) || undefined}
          title={str(d.title)}
          description={str(d.description) || undefined}
          action={<TextLink href="/realizacje" dark={dark}>Wszystkie realizacje</TextLink>}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </Section>
  )
}

async function BrandsBlock({ d }: { d: D }) {
  const brands = await getVehicleBrands().catch(() => [])
  const groups = [
    { type: 'truck', title: 'Pojazdy ciężarowe' },
    { type: 'pickup', title: 'Pickupy i SUV' },
  ]
    .filter((g) => d.show === 'all' || d.show === g.type || !d.show)
    .map((g) => ({ ...g, brands: brands.filter((b) => b.type === g.type) }))
    .filter((g) => g.brands.length > 0)
  if (groups.length === 0) return null
  const dark = d.background === 'dark'
  return (
    <Section bg={d.background}>
      <div className="container">
        <SectionHeader
          dark={dark}
          eyebrow={str(d.eyebrow) || undefined}
          title={str(d.title)}
          description={str(d.description) || undefined}
          action={<TextLink href="/oferta/pojazdy" dark={dark}>Wszystkie pojazdy</TextLink>}
        />
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.type}>
              {groups.length > 1 && (
                <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">{group.title}</h3>
              )}
              {d.compact ? <ul className="flex flex-wrap gap-2">{group.brands.map(brand => <li key={brand.slug}><Link href={`/oferta/pojazdy/${brand.slug}`} className={cn('inline-flex min-h-11 items-center border px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary', dark ? 'border-white/20 text-white' : 'bg-card')}>{brand.name}</Link></li>)}</ul> : <BrandGrid brands={group.brands} dark={dark} />}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

async function FaqBlock({ d }: { d: D }) {
  const items = list<{ q: string; a: string }>(d.items).filter((i) => i.q)
  const site = d.showContact ? await getSiteInfo() : null
  const dark = d.background === 'dark'
  return (
    <Section bg={d.background}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
          }),
        }}
      />
      <div className={cn('container grid gap-14 lg:gap-20', site && 'lg:grid-cols-[1fr_400px]')}>
        <div>
          <SectionHeader dark={dark} eyebrow={str(d.eyebrow) || undefined} title={str(d.title)} />
          <div className={cn('divide-y border-y', dark && 'divide-white/10 border-white/10')}>
            {items.map((item, i) => (
              <details key={i} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary
                  className={cn(
                    'flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl font-semibold uppercase tracking-wide',
                    dark && 'text-white'
                  )}
                >
                  {item.q}
                  <Plus className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-45" />
                </summary>
                <p className={cn('mt-4 max-w-2xl whitespace-pre-line leading-relaxed', dark ? 'text-zinc-400' : 'text-muted-foreground')}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
        {site && (
          <aside className={cn('clip-corner-lg h-fit p-8 text-white lg:sticky lg:top-28', dark ? 'bg-zinc-900' : 'bg-ink')}>
            <p className="eyebrow mb-4">Porozmawiajmy</p>
            <h3 className="heading-display text-3xl">{d.asideTitle}</h3>
            {str(d.asideText) && <p className="mt-4 text-zinc-400">{d.asideText}</p>}
            <a href={site.phoneHref} className="mt-8 flex items-center gap-3 font-display text-3xl font-bold hover:text-primary">
              <Phone className="h-6 w-6 text-primary" />
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="mt-4 flex items-center gap-3 text-zinc-300 hover:text-white">
              <Mail className="h-5 w-5 text-primary" />
              {site.email}
            </a>
            <div className="mt-8 border-t border-white/10 pt-6 text-sm text-zinc-400">
              {site.hours.slice(0, 2).map((h) => (
                <p key={h.days} className="flex justify-between py-1">
                  <span>{h.days}</span>
                  <span className="text-white">{h.time}</span>
                </p>
              ))}
            </div>
          </aside>
        )}
      </div>
    </Section>
  )
}

// Prosty format: pusta linia = akapit, „## ” = śródtytuł, „- ” = punkt listy
function RichText({ text, dark }: { text: string; dark: boolean }) {
  const chunks = text.split(/\n\s*\n/).filter((c) => c.trim())
  return (
    <div className={cn('space-y-5 text-lg leading-relaxed', dark ? 'text-zinc-300' : 'text-muted-foreground')}>
      {chunks.map((chunk, i) => {
        const lines = chunk.split('\n')
        if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) {
          return (
            <ul key={i} className="space-y-2">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 bg-primary" />
                  <span>{l.replace(/^\s*[-•*]\s+/, '')}</span>
                </li>
              ))}
            </ul>
          )
        }
        if (lines.length === 1 && lines[0].startsWith('## ')) {
          return (
            <h3 key={i} className={cn('heading-display pt-4 text-3xl', dark ? 'text-white' : 'text-foreground')}>
              {lines[0].slice(3)}
            </h3>
          )
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {chunk}
          </p>
        )
      })}
    </div>
  )
}

function TextBlock({ d }: { d: D }) {
  const dark = d.background === 'dark'
  const center = d.align === 'center'
  return (
    <Section bg={d.background}>
      <div className={cn('container max-w-3xl', center && 'text-center')}>
        {str(d.eyebrow) && <p className="eyebrow mb-4">{d.eyebrow}</p>}
        {str(d.title) && <h2 className={cn('heading-display mb-8 text-4xl sm:text-5xl', dark && 'text-white')}>{d.title}</h2>}
        <RichText text={str(d.text)} dark={dark} />
      </div>
    </Section>
  )
}

function GalleryBlock({ d }: { d: D }) {
  const images = list<{ image: string }>(d.images).map((i) => i.image).filter(Boolean)
  if (images.length === 0) return null
  return (
    <Section bg={d.background}>
      <div className="container">
        <SectionHeader dark={d.background === 'dark'} eyebrow={str(d.eyebrow) || undefined} title={str(d.title)} description={str(d.description) || undefined} />
        <Gallery images={images} alt={str(d.title) || 'Galeria'} />
      </div>
    </Section>
  )
}

function QuoteBlock({ d }: { d: D }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 lg:py-28">
      {str(d.image) && <SmartImage src={str(d.image)} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25" />}
      <div className="bg-blueprint absolute inset-0 -z-10" />
      <figure className="container max-w-4xl">
        <Quote className="h-14 w-14 fill-primary text-primary" />
        <blockquote className="mt-6 font-display text-3xl font-semibold uppercase leading-tight text-white sm:text-4xl lg:text-5xl">
          {d.quote}
        </blockquote>
        {(str(d.author) || str(d.role)) && (
          <figcaption className="mt-8 flex items-center gap-4">
            <span className="h-0.5 w-10 bg-primary" />
            <span>
              <span className="block font-display text-lg font-bold uppercase tracking-wide text-white">{d.author}</span>
              {str(d.role) && <span className="text-sm text-zinc-400">{d.role}</span>}
            </span>
          </figcaption>
        )}
      </figure>
    </section>
  )
}

function youtubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  return match?.[1] ?? null
}

function VideoBlock({ d }: { d: D }) {
  const id = youtubeId(str(d.url))
  if (!id) return null
  return (
    <Section bg={d.background}>
      <div className="container max-w-5xl">
        <SectionHeader dark={d.background === 'dark'} eyebrow={str(d.eyebrow) || undefined} title={str(d.title)} description={str(d.description) || undefined} />
        <div className="clip-corner-lg relative aspect-video overflow-hidden bg-ink">
          <VideoEmbed id={id} title={str(d.title) || 'Wideo'} />
        </div>
      </div>
    </Section>
  )
}

async function ContactBlock({ d }: { d: D }) {
  const site = await getSiteInfo()
  const dark = d.background === 'dark'
  const items = [
    { icon: Phone, label: 'Telefon', value: site.phone, href: site.phoneHref },
    { icon: Mail, label: 'E-mail', value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: 'Adres', value: site.fullAddress, href: site.mapsUrl },
  ]
  return (
    <Section bg={d.background}>
      <div className="container grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          {str(d.eyebrow) && <p className="eyebrow mb-4">{d.eyebrow}</p>}
          <h2 className={cn('heading-display text-4xl sm:text-5xl', dark && 'text-white')}>{d.title}</h2>
          {str(d.description) && <p className={cn('mt-4 text-lg', dark ? 'text-zinc-400' : 'text-muted-foreground')}>{d.description}</p>}
          {str(d.buttonLabel) && (
            <Link href="/kontakt#formularz" className={cn(buttonClass('primary', 'lg'), 'mt-8')}>
              {d.buttonLabel}
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={cn('flex items-center gap-4 border p-5 transition-colors', dark ? 'border-white/10 bg-zinc-900 hover:border-white/40' : 'bg-card hover:border-ink')}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-ink">
                <item.icon className="h-5 w-5 text-primary" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</span>
                <span className={cn('mt-0.5 block truncate font-display text-lg font-semibold', dark && 'text-white')}>{item.value}</span>
              </span>
            </a>
          ))}
          <div className={cn('flex items-center gap-4 border p-5', dark ? 'border-white/10 bg-zinc-900' : 'bg-card')}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-ink">
              <Clock className="h-5 w-5 text-primary" />
            </span>
            <span className={cn('text-sm', dark ? 'text-zinc-300' : 'text-foreground')}>
              {site.hours.map((h) => (
                <span key={h.days} className="block">
                  {h.days}: <strong>{h.time}</strong>
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </Section>
  )
}

async function CtaBlock({ d }: { d: D }) {
  const site = d.showPhone ? await getSiteInfo() : null
  const variant = d.variant || 'red'
  const light = variant === 'light'
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden',
        variant === 'red' && 'bg-primary',
        variant === 'dark' && 'bg-blueprint bg-ink',
        light && 'border-t'
      )}
    >
      {variant === 'red' && (
        <>
          <SmartImage src={fallbackImage('product')} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25 mix-blend-multiply" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/60" />
        </>
      )}
      <div className="container flex flex-col gap-10 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <h2 className={cn('heading-display text-4xl sm:text-5xl', !light && 'text-white')}>{d.title}</h2>
          {str(d.description) && <p className={cn('mt-4 text-lg', light ? 'text-muted-foreground' : 'text-white/85')}>{d.description}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {str(d.primaryLabel) && (
            <SmartLink
              href={str(d.primaryHref) || '/kontakt#formularz'}
              className={buttonClass(variant === 'red' ? 'dark' : 'primary', 'lg')}
            >
              {d.primaryLabel}
              <ArrowRight className="h-5 w-5" />
            </SmartLink>
          )}
          {site && (
            <a href={site.phoneHref} className={buttonClass(light ? 'outline-dark' : 'outline-light', 'lg')}>
              <Phone className="h-5 w-5" />
              {site.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

type RenderProps = { d: D; first: boolean; crumbs?: Crumb[] }
type EntityRender = (props: RenderProps & { ctx: EntityContext }) => React.ReactNode

// Sekcje „z danych” renderują się tylko z kontekstem kategorii / marki
const withEntity = (Render: EntityRender) => {
  const Wrapped = (props: RenderProps & { ctx?: EntityContext }) => (props.ctx ? <Render {...props} ctx={props.ctx} /> : null)
  return Wrapped
}

const RENDERERS: Record<BlockType, (props: RenderProps & { ctx?: EntityContext }) => React.ReactNode> = {
  hero: HeroBlock,
  textImage: TextImageBlock,
  features: FeaturesBlock,
  steps: StepsBlock,
  stats: StatsBlock,
  categories: CategoriesBlock,
  projects: ProjectsBlock,
  brands: BrandsBlock,
  faq: FaqBlock,
  text: TextBlock,
  gallery: GalleryBlock,
  quote: QuoteBlock,
  video: VideoBlock,
  contact: ContactBlock,
  cta: CtaBlock,
  entityHero: withEntity(EntityHeroBlock),
  categoryFeatures: withEntity(CategoryFeaturesBlock),
  entityDescription: withEntity(EntityDescriptionBlock),
  categorySpecs: withEntity(CategorySpecsBlock),
  entityGallery: withEntity(EntityGalleryBlock),
  categoryVehicles: withEntity(CategoryVehiclesBlock),
  brandCategories: withEntity(BrandCategoriesBlock),
  entityProjects: withEntity(EntityProjectsBlock),
}

const HERO_TYPES: BlockType[] = ['hero', 'entityHero']

export function PageBlocks({
  blocks,
  crumbs,
  title,
  context,
}: {
  blocks: Block[]
  crumbs?: Crumb[]
  title: string
  context?: EntityContext
}) {
  const visible = blocks.filter((b) => !b.hidden)
  const tokens = context ? entityTokens(context) : null
  return (
    <>
      {/* Strona bez hero na początku i tak potrzebuje nagłówka h1 */}
      {!HERO_TYPES.includes(visible[0]?.type) && <h1 className="sr-only">{title}</h1>}
      {visible.map((block, i) => {
        const Render = RENDERERS[block.type]
        const d = tokens ? applyTokens(block.data, tokens) : block.data
        return (
          <Render
            key={block.id}
            d={d}
            first={i === 0}
            crumbs={i === 0 && HERO_TYPES.includes(block.type) ? crumbs : undefined}
            ctx={context}
          />
        )
      })}
    </>
  )
}
