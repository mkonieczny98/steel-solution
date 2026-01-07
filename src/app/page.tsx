import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Flame,
  Truck,
  Shield,
  Wrench,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Car,
} from 'lucide-react'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'

async function getFeaturedProjects() {
  return prisma.project.findMany({
    where: { published: true, featured: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
    take: 6,
  })
}

async function getVehicleBrands() {
  return prisma.vehicleBrand.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
  })
}

const features = [
  {
    icon: Wrench,
    title: 'Na wymiar',
    description: 'Każda zabudowa projektowana indywidualnie pod wymagania klienta',
  },
  {
    icon: Shield,
    title: 'Wysoka jakość',
    description: 'Materiały najwyższej jakości i precyzyjne wykonanie',
  },
  {
    icon: Truck,
    title: 'Doświadczenie',
    description: 'Lata doświadczenia w zabudowach wozów strażackich',
  },
]

export default async function HomePage() {
  const [featuredProjects, categories, vehicleBrands] = await Promise.all([
    getFeaturedProjects(),
    getCategories(),
    getVehicleBrands(),
  ])

  const trucks = vehicleBrands.filter(v => v.type === 'truck')
  const pickups = vehicleBrands.filter(v => v.type === 'pickup')

  return (
    <>
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80" />
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
              <Flame className="mr-1 h-3 w-3" />
              Profesjonalne zabudowy
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Zabudowy wozów strażackich
              <span className="text-primary"> na wymiar</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-300">
              Projektujemy i wykonujemy profesjonalne zabudowy do wozów strażackich,
              półki do kabin, boksy na narzędzia, mocowania sprzętu oraz zabudowy pick-upów.
              Wszystko dopasowane do Twoich potrzeb.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/kontakt">
                  Zapytaj o wycenę
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" asChild>
                <Link href="/realizacje">Zobacz realizacje</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Nasza oferta</h2>
            <p className="mt-2 text-muted-foreground">
              Kompleksowe rozwiązania dla służb ratowniczych i nie tylko
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/oferta/produkty/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {(category.image || category.heroImage) ? (
                    <img
                      src={category.image || category.heroImage || ''}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div 
                      className="flex h-full items-center justify-center"
                      style={{ backgroundColor: category.color ? `${category.color}15` : undefined }}
                    >
                      <Truck className="h-16 w-16" style={{ color: category.color || '#888' }} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold group-hover:text-primary">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-sm font-medium text-primary">
                    Zobacz więcej
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/oferta/produkty">
                Zobacz wszystkie produkty
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="bg-muted/50 py-20">
          <div className="container">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold">Ostatnie realizacje</h2>
                <p className="mt-2 text-muted-foreground">
                  Zobacz nasze najnowsze projekty
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/realizacje">
                  Wszystkie realizacje
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/realizacje/${project.slug}`}
                  className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Truck className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <Badge variant="outline" className="mb-2">
                      {project.category?.name || 'Realizacja'}
                    </Badge>
                    <h3 className="font-semibold group-hover:text-primary">
                      {project.title}
                    </h3>
                    {project.vehicleBrand && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {project.vehicleBrand}
                        {project.vehicleModel && ` ${project.vehicleModel}`}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <Button variant="outline" asChild className="mt-8 w-full sm:hidden">
              <Link href="/realizacje">
                Wszystkie realizacje
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Vehicles - Trucks */}
      <section className="py-16">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Pojazdy ciężarowe</h2>
            <p className="mt-2 text-muted-foreground">
              Wykonujemy zabudowy do wszystkich popularnych marek
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {trucks.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/oferta/pojazdy/${vehicle.slug}`}
                className="rounded-lg border bg-card px-6 py-3 text-lg font-semibold text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {vehicle.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles - Pickups */}
      {pickups.length > 0 && (
        <section className="border-t py-16">
          <div className="container">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Pickupy i SUV</h2>
              <p className="mt-2 text-muted-foreground">
                Zabudowy do pojazdów terenowych dla służb ratunkowych
              </p>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {pickups.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/oferta/pojazdy/${vehicle.slug}`}
                  className="rounded-lg border bg-card px-6 py-3 text-lg font-semibold text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {vehicle.name}
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href="/oferta/pojazdy">
                  Zobacz wszystkie pojazdy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold">Potrzebujesz zabudowy na wymiar?</h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Skontaktuj się z nami, przygotujemy indywidualną wycenę
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/kontakt">
                <Mail className="mr-2 h-4 w-4" />
                Napisz do nas
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/10 hover:bg-white/20"
              asChild
            >
              <Link href="tel:+48690418119">
                <Phone className="mr-2 h-4 w-4" />
                +48 690 418 119
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  )
}
