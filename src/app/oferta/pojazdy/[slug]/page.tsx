import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public/header'

export const dynamic = 'force-dynamic'
import { PublicFooter } from '@/components/public/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronRight, 
  ArrowLeft,
  Truck,
  Package,
  Phone,
  FileText,
  LayoutGrid,
  Box,
  Shield,
  Images
} from 'lucide-react'

// Mapowanie ikon dla kategorii
const iconMap: Record<string, any> = {
  'wozy-strazackie': Truck,
  'polki-do-kabin': LayoutGrid,
  'podesty-i-stopnie': Box,
  'podesty-i-boksy': Box,
  'boksy-na-narzedzia': Package,
  'mocowania-sprzetu': Shield,
  'skrzynie-dachowe': Box,
  'zabudowy-pickup': Truck,
}

interface Props {
  params: { slug: string }
}

async function getVehicleBrand(slug: string) {
  return prisma.vehicleBrand.findUnique({
    where: { slug },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  })
}

async function getProjectsForBrand(brandName: string) {
  return prisma.project.findMany({
    where: {
      published: true,
      vehicleBrand: {
        contains: brandName,
      },
    },
    include: { category: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })
}

export async function generateMetadata({ params }: Props) {
  const brand = await getVehicleBrand(params.slug)
  
  if (!brand) return {}
  
  return {
    title: brand.metaTitle || `Zabudowy ${brand.name} | Steel Solution`,
    description: brand.metaDescription || brand.description,
  }
}

export default async function VehicleBrandPage({ params }: Props) {
  const brand = await getVehicleBrand(params.slug)

  if (!brand) {
    notFound()
  }

  const projects = await getProjectsForBrand(brand.name)
  const models = brand.models ? JSON.parse(brand.models) : []
  const linkedCategories = brand.categories.map(c => c.category)
  const gallery = brand.gallery ? JSON.parse(brand.gallery) : []

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen">
        {/* Breadcrumbs */}
        <div className="border-b bg-muted/30">
          <div className="container py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Strona główna</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/oferta" className="hover:text-foreground">Oferta</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/oferta/pojazdy" className="hover:text-foreground">Pojazdy</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{brand.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className={`relative py-16 ${brand.type === 'truck' ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-amber-900 to-amber-800'}`}>
          {/* Hero Image Background */}
          {brand.heroImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={brand.heroImage}
                alt={brand.name}
                fill
                className="object-cover opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          )}
          
          <div className="container relative z-10">
            <Button variant="ghost" size="sm" asChild className="mb-6 text-slate-300 hover:text-white">
              <Link href="/oferta/pojazdy">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wszystkie pojazdy
              </Link>
            </Button>
            
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <Badge className={`mb-4 ${brand.type === 'truck' ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Truck className="mr-1 h-3 w-3" />
                  {brand.type === 'truck' ? 'Pojazd ciężarowy' : 'Pickup'}
                </Badge>
                <h1 className="text-4xl font-bold text-white sm:text-5xl">
                  Zabudowy {brand.name}
                </h1>
                <p className="mt-4 text-lg text-slate-300">
                  {brand.longDescription || brand.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/kontakt">
                      <Phone className="mr-2 h-4 w-4" />
                      Zapytaj o wycenę
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Link href="#produkty">
                      <Package className="mr-2 h-4 w-4" />
                      Zobacz produkty
                    </Link>
                  </Button>
                </div>
              </div>

              {models.length > 0 && (
                <div className="flex items-center justify-center">
                  <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
                    <h3 className="mb-4 text-lg font-semibold text-white">Obsługiwane modele</h3>
                    <div className="space-y-2">
                      {models.map((model: { name: string; years?: string }, index: number) => (
                        <div key={index} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2">
                          <span className="font-medium text-white">{model.name}</span>
                          {model.years && (
                            <span className="text-sm text-slate-400">{model.years}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Produkty - powiązane kategorie */}
        {linkedCategories.length > 0 && (
          <section id="produkty" className="py-16">
            <div className="container">
              <h2 className="mb-2 text-2xl font-bold">
                Produkty dla {brand.name}
              </h2>
              <p className="mb-8 text-muted-foreground">
                Dostępne kategorie produktów dedykowanych do tego pojazdu
              </p>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {linkedCategories.map((category) => {
                  const Icon = iconMap[category.slug] || Package
                  return (
                    <Link
                      key={category.id}
                      href={`/oferta/produkty/${category.slug}`}
                      className="group"
                    >
                      <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div 
                            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="mb-2 font-semibold group-hover:text-primary">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                          <div className="mt-4 flex items-center text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            Zobacz produkty
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Opis dodatkowy - contentDescription */}
        {brand.contentDescription && (
          <section className="py-20">
            <div className="container">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <CardContent className="p-8 lg:p-12">
                  <div className="mx-auto max-w-4xl">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Truck className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold lg:text-3xl">
                        Dlaczego warto wybrać zabudowy do {brand.name}?
                      </h2>
                    </div>
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                        {brand.contentDescription}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Galeria */}
        {gallery.length > 0 && (
          <section className="py-16">
            <div className="container">
              <div className="mb-8">
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <Images className="h-6 w-6 text-primary" />
                  Galeria {brand.name}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Zobacz nasze realizacje dla tej marki pojazdu
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gallery.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="group relative aspect-video overflow-hidden rounded-lg bg-muted"
                  >
                    <Image
                      src={image}
                      alt={`${brand.name} - zdjęcie ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Realizacje */}
        {projects.length > 0 && (
          <section className="bg-muted/30 py-16">
            <div className="container">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Realizacje {brand.name}</h2>
                  <p className="mt-1 text-muted-foreground">
                    Zobacz nasze projekty dla tego pojazdu
                  </p>
                </div>
                <Button variant="ghost" asChild>
                  <Link href={`/realizacje?marka=${params.slug}`}>
                    Zobacz wszystkie
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/realizacje/${project.slug}`}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden transition-all hover:shadow-xl">
                      <div className="aspect-video overflow-hidden bg-muted">
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
                      <CardContent className="p-4">
                        <h3 className="font-semibold group-hover:text-primary">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16">
          <div className="container">
            <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary to-red-700">
              <CardContent className="p-8 lg:p-12">
                <div className="mx-auto max-w-2xl text-center text-white">
                  <FileText className="mx-auto mb-4 h-12 w-12 opacity-80" />
                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Potrzebujesz wyceny dla {brand.name}?
                  </h2>
                  <p className="mt-4 text-white/80">
                    Skontaktuj się z nami, a przygotujemy indywidualną ofertę 
                    dopasowaną do Twojego pojazdu i wymagań.
                  </p>
                  <Button asChild size="lg" variant="secondary" className="mt-8">
                    <Link href="/kontakt">
                      <Phone className="mr-2 h-4 w-4" />
                      Zamów wycenę
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  )
}
