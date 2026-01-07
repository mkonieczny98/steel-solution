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
  Package,
  Phone,
  FileText,
  Check,
  Truck,
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

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      vehicleBrands: {
        include: {
          vehicleBrand: true
        }
      }
    }
  })
}

async function getProjectsForCategory(categoryId: string) {
  return prisma.project.findMany({
    where: {
      published: true,
      categoryId: categoryId,
    },
    include: { category: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })
}

export async function generateMetadata({ params }: Props) {
  const category = await getCategory(params.slug)
  
  if (!category) return {}
  
  return {
    title: category.metaTitle || `${category.name} | Steel Solution`,
    description: category.metaDescription || category.description,
  }
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  const projects = await getProjectsForCategory(category.id)
  const features = category.features ? JSON.parse(category.features) : []
  const benefits = category.benefits ? JSON.parse(category.benefits) : []
  const specifications = category.specifications ? JSON.parse(category.specifications) : []
  const linkedVehicles = category.vehicleBrands.map(vb => vb.vehicleBrand)
  const gallery = category.gallery ? JSON.parse(category.gallery) : []
  
  const Icon = iconMap[category.slug] || Package

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
              <Link href="/oferta/produkty" className="hover:text-foreground">Produkty</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{category.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 py-16">
          {/* Hero Image Background */}
          {category.heroImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={category.heroImage}
                alt={category.name}
                fill
                className="object-cover opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          )}
          
          <div className="container relative z-10">
            <Button variant="ghost" size="sm" asChild className="mb-6 text-slate-300 hover:text-white">
              <Link href="/oferta/produkty">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wszystkie produkty
              </Link>
            </Button>

            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <Badge 
                  className="mb-4"
                  style={{ 
                    backgroundColor: `${category.color}20` || '#3b82f620',
                    color: category.color || '#3b82f6'
                  }}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  Kategoria produktów
                </Badge>
                <h1 className="text-4xl font-bold text-white sm:text-5xl">
                  {category.name}
                </h1>
                <p className="mt-4 text-lg text-slate-300">
                  {category.longDescription || category.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/kontakt">
                      <Phone className="mr-2 h-4 w-4" />
                      Zapytaj o wycenę
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Link href="#pojazdy">
                      <Truck className="mr-2 h-4 w-4" />
                      Kompatybilne pojazdy
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div 
                  className="flex h-48 w-48 items-center justify-center rounded-3xl"
                  style={{ backgroundColor: `${category.color}20` || '#3b82f620' }}
                >
                  <Icon 
                    className="h-24 w-24" 
                    style={{ color: category.color || '#3b82f6' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cechy i korzyści */}
        {(features.length > 0 || benefits.length > 0) && (
          <section className="py-16">
            <div className="container">
              <div className="grid gap-8 lg:grid-cols-2">
                {features.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-6 text-xl font-bold">Cechy produktu</h2>
                      <ul className="space-y-3">
                        {features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {benefits.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-6 text-xl font-bold">Korzyści</h2>
                      <ul className="space-y-3">
                        {benefits.map((benefit: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Specyfikacje */}
        {specifications.length > 0 && (
          <section className="bg-muted/30 py-16">
            <div className="container">
              <h2 className="mb-8 text-2xl font-bold">Specyfikacja techniczna</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {specifications.map((spec: { label: string; value: string }, index: number) => (
                      <div key={index} className="flex items-center justify-between px-6 py-4">
                        <span className="font-medium text-muted-foreground">{spec.label}</span>
                        <span className="font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Kompatybilne pojazdy */}
        {linkedVehicles.length > 0 && (
          <section id="pojazdy" className="py-16">
            <div className="container">
              <h2 className="mb-2 text-2xl font-bold">
                Kompatybilne pojazdy
              </h2>
              <p className="mb-8 text-muted-foreground">
                Ten produkt jest dostępny dla następujących marek pojazdów
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {linkedVehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/oferta/pojazdy/${vehicle.slug}`}
                    className="group"
                  >
                    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                      <CardContent className="p-4">
                        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${vehicle.type === 'truck' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-600'}`}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold group-hover:text-primary">
                          {vehicle.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {vehicle.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Opis dodatkowy - contentDescription */}
        {category.contentDescription && (
          <section className="py-20">
            <div className="container">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <CardContent className="p-8 lg:p-12">
                  <div className="mx-auto max-w-4xl">
                    <div className="mb-6 flex items-center gap-3">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Package className="h-6 w-6" style={{ color: category.color }} />
                      </div>
                      <h2 className="text-2xl font-bold lg:text-3xl">
                        Więcej o {category.name}
                      </h2>
                    </div>
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                        {category.contentDescription}
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
                  Galeria produktów
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Zdjęcia prezentujące produkty z kategorii {category.name}
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
                      alt={`${category.name} - zdjęcie ${index + 1}`}
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
                  <h2 className="text-2xl font-bold">Realizacje</h2>
                  <p className="mt-1 text-muted-foreground">
                    Zobacz nasze projekty w tej kategorii
                  </p>
                </div>
                <Button variant="ghost" asChild>
                  <Link href={`/realizacje?kategoria=${params.slug}`}>
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
                            <Package className="h-12 w-12 text-muted-foreground/50" />
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
                    Potrzebujesz wyceny?
                  </h2>
                  <p className="mt-4 text-white/80">
                    Skontaktuj się z nami, a przygotujemy indywidualną ofertę 
                    na {category.name.toLowerCase()} dopasowane do Twoich potrzeb.
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
