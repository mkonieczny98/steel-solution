import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Phone } from 'lucide-react'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { Gallery } from '@/components/public/gallery'
import { CtaBand, PageHero, ProjectCard, SectionHeader, TextLink, buttonClass } from '@/components/public/blocks'
import { getProject, getRelatedProjects, parseJson } from '@/lib/data'
import { fallbackImage, sized } from '@/lib/images'
import { getSiteInfo } from '@/lib/content'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return {}
  return {
    title: project.metaTitle || project.title,
    description: project.metaDescription || project.description || undefined,
    alternates: { canonical: `/realizacje/${project.slug}` },
    openGraph: project.thumbnail ? { images: [sized(project.thumbnail, 1200)] } : undefined,
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const site = await getSiteInfo()
  const related = project.categoryId ? await getRelatedProjects(project.categoryId, project.id) : []
  const images = parseJson<string[]>(project.images, [])
  const gallery = images.length > 0 ? images : project.thumbnail ? [project.thumbnail] : []
  const sections = (project.content || '').split(/^## /m).filter(Boolean).map(part => {
    const lines = part.trim().split('\n')
    return lines.length > 1 && part !== (project.content || '') ? { title: lines[0], text: lines.slice(1).join('\n').trim() } : { title: 'Zakres prac', text: part.trim() }
  })
  const vehicle = [project.vehicleBrand, project.vehicleModel].filter(Boolean).join(' ')
  const hero = project.thumbnail || images[0] || fallbackImage(project.category?.slug === 'zabudowy-pickup' ? 'pickup' : 'truck')

  const facts = [
    { label: 'Pojazd', value: vehicle },
    { label: 'Kategoria', value: project.category?.name },
    { label: 'Rok realizacji', value: project.year },
  ].filter((f) => f.value)

  return (
    <>
      <PublicHeader />

      <main id="main">
        <PageHero
          eyebrow={project.category?.name || 'Realizacja'}
          title={project.title}
          description={project.description}
          image={hero}
          breadcrumbs={[{ name: 'Realizacje', href: '/realizacje' }, { name: project.title }]}
          aside={
            facts.length > 0 ? (
              <dl className="clip-corner-lg border border-white/10 bg-ink/80 p-6 backdrop-blur">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex justify-between gap-4 border-b border-white/10 py-3 last:border-0">
                    <dt className="text-sm text-zinc-400">{fact.label}</dt>
                    <dd className="text-right font-display font-semibold uppercase tracking-wide text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : undefined
          }
        />

        <section className="py-16 lg:py-24">
          <div className="container grid gap-12 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0">
              {gallery.length > 0 && <Gallery images={gallery} alt={project.title} className="lg:grid-cols-3" />}
              {project.content && (
                <div className="mt-12 max-w-3xl">
                  {sections.map((section, index) => <section key={index} className="mb-8 border-t pt-6"><h2 className="heading-display mb-4 text-3xl">{section.title}</h2><p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{section.text}</p></section>)}
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="clip-corner-lg bg-ink p-8 text-white">
                <p className="eyebrow mb-4">Podobna zabudowa?</p>
                <h2 className="heading-display text-3xl">Zrobimy to dla Twojej jednostki</h2>
                <p className="mt-4 text-sm text-zinc-400">Opisz pojazd i sprzęt – przygotujemy bezpłatną wycenę.</p>
                <div className="mt-8 grid gap-3">
                  <Link
                    href={`/kontakt?${new URLSearchParams({
                      realizacja: project.slug,
                      ...(project.category?.slug ? { kategoria: project.category.slug } : {}),
                      ...(project.vehicleBrand ? { pojazd: vehicle } : {}),
                    })}#formularz`}
                    className={buttonClass('primary')}
                  >
                    Zapytaj o wycenę
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href={site.phoneHref} className={buttonClass('outline-light')}>
                    <Phone className="h-4 w-4" />
                    {site.phone}
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t bg-muted/40 py-16 lg:py-24">
            <div className="container">
              <SectionHeader eyebrow="Zobacz też" title="Podobne realizacje" action={<TextLink href="/realizacje">Wszystkie realizacje</TextLink>} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        <CtaBand kategoria={project.category?.slug} />
      </main>

      <PublicFooter />
    </>
  )
}
