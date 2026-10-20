import type { Metadata } from 'next'
import { Clock, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { getCategories, getVehicleBrands, getProject } from '@/lib/data'
import { getSiteInfo } from '@/lib/content'
import { QuoteForm } from './quote-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kontakt i bezpłatna wycena',
  description: 'Zapytaj o wycenę zabudowy wozu strażackiego, półek do kabin lub zabudowy pickupa. Zadzwoń lub wypełnij formularz.',
  alternates: { canonical: '/kontakt' },
}

interface Props {
  searchParams: Promise<{ kategoria?: string; pojazd?: string; realizacja?: string }>
}

export default async function KontaktPage({ searchParams }: Props) {
  const { kategoria, pojazd, realizacja } = await searchParams
  const [categories, brands, site] = await Promise.all([getCategories(), getVehicleBrands(), getSiteInfo()])
  const defaultCategory = categories.find((c) => c.slug === kategoria)?.name
  const project = realizacja ? await getProject(realizacja) : null
  const defaultVehicle = pojazd?.slice(0, 100)

  const contact = [
    { icon: Phone, label: 'Telefon', value: site.phone, href: site.phoneHref },
    { icon: Mail, label: 'E-mail', value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: 'Adres', value: site.fullAddress, href: site.mapsUrl, external: true },
  ]

  return (
    <>
      <PublicHeader />

      <main id="main">
        <section className="border-b bg-ink py-8 text-white sm:py-12">
          <div className="container">
            <p className="eyebrow mb-3">Porozmawiajmy o Twoim pojeździe</p>
            <h1 className="heading-display text-4xl sm:text-6xl">Bezpłatna wycena</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">Napisz, czego potrzebujesz. Zdjęcia i wymiary pomogą nam dobrać rozwiązanie — szczegóły ustalimy razem.</p>
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="container grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">


            <div id="formularz" className="min-w-0 scroll-mt-24 border bg-card p-5 sm:p-8">
              <h2 className="heading-display text-3xl">Opowiedz o swoim projekcie</h2>
              <p className="mb-8 mt-2 text-muted-foreground">Na początek wystarczą dane kontaktowe i krótki opis.</p>
              <QuoteForm
                categories={categories.map((c) => c.name)}
                brands={brands.map((b) => b.name)}
                defaultCategory={defaultCategory}
                defaultVehicle={defaultVehicle}
                project={project ? { slug: project.slug, title: project.title } : undefined}
                contact={{ name: site.name, phone: site.phone, phoneHref: site.phoneHref }}
              />
            </div>
            <aside className="space-y-3 lg:order-none">
              {contact.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center gap-4 border bg-card p-5 transition-colors hover:border-ink"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-ink">
                    <item.icon className="h-5 w-5 text-primary" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</span>
                    <span className="mt-0.5 block truncate font-display text-xl font-semibold">{item.value}</span>
                  </span>
                  {item.external && <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />}
                </a>
              ))}

              <div className="clip-corner-lg bg-ink p-6 text-white">
                <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.2em]">
                  <Clock className="h-4 w-4 text-primary" />
                  Godziny pracy
                </p>
                <dl className="mt-4 text-sm">
                  {site.hours.map((h) => (
                    <div key={h.days} className="flex justify-between border-b border-white/10 py-2.5 last:border-0">
                      <dt className="text-zinc-400">{h.days}</dt>
                      <dd className="font-medium">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="border bg-card p-6">
                <h2 className="font-display text-xl font-semibold">Co dalej?</h2>
                <ol className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <li><strong className="text-foreground">01 · Rozmowa.</strong> Sprawdzimy zakres i dopytamy o potrzebne szczegóły.</li>
                  <li><strong className="text-foreground">02 · Propozycja.</strong> Ustalimy rozwiązanie, cenę i możliwy termin.</li>
                  <li><strong className="text-foreground">03 · Twoja decyzja.</strong> Wysłanie zapytania nie jest zamówieniem.</li>
                </ol>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  )
}
