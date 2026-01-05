import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  ChevronRight, 
  ArrowLeft,
  LayoutGrid,
  Box,
  Shield,
  Wrench,
  Truck
} from 'lucide-react'

export const metadata = {
  title: 'Produkty dla służb | Półki, Boksy, Podesty, Mocowania',
  description: 'Pełna oferta produktów dla straży pożarnej i służb ratowniczych. Półki do kabin, boksy narzędziowe, podesty, mocowania sprzętu, skrzynie dachowe, zabudowy pickup.',
}

const productCategories = [
  {
    name: 'Półki do kabin',
    slug: 'polki-do-kabin',
    icon: LayoutGrid,
    color: 'bg-blue-500',
    description: 'Półki górne, boczne i pod siedzenia do kabin pojazdów ciężarowych',
    longDescription: 'Oferujemy szeroki wybór półek dedykowanych do kabin pojazdów MAN, Scania, Volvo, Mercedes i innych marek. Nasze półki są wykonane z wysokiej jakości materiałów i zapewniają optymalne wykorzystanie przestrzeni kabiny.',
    features: [
      'Półki górne na całą szerokość kabiny',
      'Półki boczne na dokumenty i drobny sprzęt',
      'Półki pod siedzenia pasażera',
      'Organizery i przegródki',
      'Montaż bez ingerencji w strukturę kabiny',
    ],
    brands: ['MAN', 'Scania', 'Volvo', 'Mercedes', 'Renault', 'Iveco', 'DAF'],
  },
  {
    name: 'Podesty i stopnie',
    slug: 'podesty-i-stopnie',
    icon: Box,
    color: 'bg-green-500',
    description: 'Podesty robocze, stopnie wejściowe, platformy',
    longDescription: 'Projektujemy i wykonujemy podesty robocze oraz stopnie wejściowe ułatwiające pracę przy pojazdach. Nasze produkty są wykonane z aluminium, co zapewnia lekkość i trwałość.',
    features: [
      'Podesty robocze składane i stałe',
      'Stopnie wejściowe antypoślizgowe',
      'Platformy do pracy na wysokości',
      'Drabinki boczne i tylne',
      'Konstrukcje ze stopu aluminium',
    ],
    brands: ['MAN', 'Scania', 'Volvo', 'Mercedes', 'Renault'],
  },
  {
    name: 'Boksy na narzędzia',
    slug: 'boksy-na-narzedzia',
    icon: Package,
    color: 'bg-orange-500',
    description: 'Skrzynki narzędziowe, boksy aluminiowe, schowki',
    longDescription: 'Produkujemy boksy i skrzynie narzędziowe o różnych wymiarach i konfiguracjach. Nasze produkty są wykonane z aluminium lub stali nierdzewnej, z zamkami i uszczelnieniami.',
    features: [
      'Boksy aluminiowe różnych rozmiarów',
      'Skrzynie stalowe malowane proszkowo',
      'Zamki kluczowe i na kłódkę',
      'Uszczelnienia gumowe',
      'Mocowanie na podłogę lub ścianę',
    ],
    brands: ['Uniwersalne', 'Na wymiar'],
  },
  {
    name: 'Mocowania sprzętu',
    slug: 'mocowania-sprzetu',
    icon: Shield,
    color: 'bg-red-500',
    description: 'Uchwyty, mocowania na gaśnice, narzędzia ratownicze',
    longDescription: 'Oferujemy profesjonalne mocowania na sprzęt ratowniczy i gaśniczy. Nasze uchwyty są certyfikowane i spełniają normy bezpieczeństwa dla pojazdów służb ratunkowych.',
    features: [
      'Uchwyty na gaśnice (różne rozmiary)',
      'Mocowania narzędzi hydraulicznych',
      'Uchwyty na latarki i kagańce',
      'Mocowania na toporki i łomy',
      'Systemy mocowań modułowych',
    ],
    brands: ['Uniwersalne', 'Dedykowane'],
  },
  {
    name: 'Skrzynie dachowe',
    slug: 'skrzynie-dachowe',
    icon: Box,
    color: 'bg-purple-500',
    description: 'Bagażniki dachowe, skrzynie na sprzęt, belki sygnalizacyjne',
    longDescription: 'Projektujemy skrzynie dachowe i bagażniki na dachy pojazdów. Nasze produkty są aerodynamiczne, wodoszczelne i przystosowane do montażu belek sygnalizacyjnych.',
    features: [
      'Skrzynie dachowe aluminiowe',
      'Bagażniki na drabiny',
      'Platformy pod belki świetlne',
      'Mocowania na sprzęt ratowniczy',
      'Konstrukcje aerodynamiczne',
    ],
    brands: ['MAN', 'Scania', 'Volvo', 'Mercedes'],
  },
  {
    name: 'Zabudowy pickup',
    slug: 'zabudowy-pickup',
    icon: Truck,
    color: 'bg-amber-500',
    description: 'Kompleksowe zabudowy skrzyni ładunkowej pickupów',
    longDescription: 'Specjalizujemy się w zabudowach pickupów dla służb ratowniczych, leśnictwa i innych formacji. Oferujemy hardtopy, zabudowy serwisowe, rolety i kompleksowe wyposażenie.',
    features: [
      'Hardtopy aluminiowe i kompozytowe',
      'Zabudowy serwisowe ze szufladami',
      'Rolety aluminiowe',
      'Pokrywy trójdzielne',
      'Systemy organizacji ładunku',
    ],
    brands: ['Toyota Hilux', 'Nissan Navara', 'Ford Ranger', 'VW Amarok', 'Mitsubishi L200'],
  },
]

async function getCategoryStats() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { projects: { where: { published: true } } }
      }
    }
  })
  return categories
}

export default async function ProduktyPage() {
  const dbCategories = await getCategoryStats()

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
              <span className="text-foreground">Produkty</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
          <div className="container">
            <Button variant="ghost" size="sm" asChild className="mb-6 text-slate-400 hover:text-white">
              <Link href="/oferta">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Powrót do oferty
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                  Nasze produkty
                </h1>
                <p className="mt-1 text-lg text-slate-400">
                  Wybierz kategorię produktu, aby zobaczyć pełną ofertę
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Kategorie */}
        <section className="py-12 lg:py-16">
          <div className="container">
            <div className="grid gap-8">
              {productCategories.map((category) => {
                const Icon = category.icon
                const dbCat = dbCategories.find(c => c.slug === category.slug)
                const projectCount = dbCat?._count?.projects || 0
                
                return (
                  <Card key={category.slug} className="overflow-hidden transition-all hover:shadow-xl">
                    <div className="grid lg:grid-cols-3">
                      {/* Lewa strona - informacje */}
                      <div className="p-6 lg:col-span-2 lg:p-8">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${category.color} text-white`}>
                            <Icon className="h-7 w-7" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-bold">{category.name}</h2>
                              {projectCount > 0 && (
                                <Badge variant="secondary">
                                  {projectCount} realizacji
                                </Badge>
                              )}
                            </div>
                            <p className="mt-2 text-muted-foreground">
                              {category.longDescription}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <div>
                            <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
                              Co oferujemy
                            </h3>
                            <ul className="space-y-1">
                              {category.features.slice(0, 4).map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm">
                                  <div className={`h-1.5 w-1.5 rounded-full ${category.color}`} />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
                              Dla pojazdów
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {category.brands.map((brand) => (
                                <Badge key={brand} variant="outline" className="text-xs">
                                  {brand}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Prawa strona - CTA */}
                      <div className="flex flex-col justify-center border-t bg-muted/30 p-6 lg:border-l lg:border-t-0">
                        <Link
                          href={`/oferta/produkty/${category.slug}`}
                          className="group"
                        >
                          <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                            <div className="flex h-full items-center justify-center">
                              <Icon className={`h-16 w-16 transition-transform group-hover:scale-110 ${category.color.replace('bg-', 'text-').replace('-500', '-400')}`} />
                            </div>
                          </div>
                          <Button className="w-full group-hover:bg-primary/90">
                            Zobacz produkty
                            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-muted/30 py-12">
          <div className="container">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center lg:p-12">
              <Wrench className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="text-2xl font-bold text-white">
                Potrzebujesz produktu na wymiar?
              </h2>
              <p className="mt-2 text-slate-400">
                Wykonujemy również produkty według indywidualnych specyfikacji klienta.
              </p>
              <Button asChild size="lg" className="mt-6">
                <Link href="/kontakt">
                  Zapytaj o wycenę
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  )
}
