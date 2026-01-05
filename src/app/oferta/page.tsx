import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Truck, 
  Package, 
  ChevronRight, 
  Wrench,
  Box,
  LayoutGrid,
  Shield,
  ArrowRight
} from 'lucide-react'

export const metadata = {
  title: 'Oferta - Steel Solution | Półki, Boksy, Podesty, Mocowania',
  description: 'Pełna oferta zabudów do wozów strażackich i pojazdów służb. Półki do kabin MAN, Scania, Volvo, Mercedes. Zabudowy pickup Toyota Hilux, Nissan Navara.',
}

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

async function getData() {
  const [vehicleBrands, categories, projectCount] = await Promise.all([
    prisma.vehicleBrand.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.category.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.project.count({ where: { published: true } }),
  ])
  
  return { vehicleBrands, categories, projectCount }
}

export default async function OfertaPage() {
  const { vehicleBrands, categories, projectCount } = await getData()
  
  const trucks = vehicleBrands.filter(b => b.type === 'truck')
  const pickups = vehicleBrands.filter(b => b.type === 'pickup')

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 lg:py-28">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
                <Wrench className="mr-1 h-3 w-3" />
                Kompleksowa oferta
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Profesjonalne zabudowy
                <span className="mt-2 block text-primary">dla pojazdów służb</span>
              </h1>
              <p className="mt-6 text-lg text-slate-300">
                Projektujemy i wykonujemy wyposażenie do wozów strażackich, 
                pojazdów ratowniczych i pickupów. Wybierz według marki pojazdu 
                lub kategorii produktu.
              </p>
              
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{vehicleBrands.length}</span>
                  <span className="text-slate-300">marek pojazdów</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{categories.length}</span>
                  <span className="text-slate-300">kategorii produktów</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white">
                  <Wrench className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{projectCount}+</span>
                  <span className="text-slate-300">realizacji</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="py-16 lg:py-20">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Wybierz pojazd */}
              <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-xl">
                <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-primary/10 transition-transform group-hover:scale-150" />
                <CardContent className="relative p-8">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
                    <Truck className="h-7 w-7" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold">Wybierz pojazd</h2>
                  <p className="mb-6 text-muted-foreground">
                    Znajdź produkty dedykowane do Twojej marki pojazdu. 
                    Dopasowane wymiary i mocowania.
                  </p>
                  <Button asChild size="lg" className="group/btn">
                    <Link href="/oferta/pojazdy">
                      Przeglądaj marki
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Wybierz produkt */}
              <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-xl">
                <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-primary/10 transition-transform group-hover:scale-150" />
                <CardContent className="relative p-8">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 text-white shadow-lg">
                    <Package className="h-7 w-7" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold">Wybierz produkt</h2>
                  <p className="mb-6 text-muted-foreground">
                    Przeglądaj nasze produkty według kategorii. 
                    Półki, boksy, mocowania i więcej.
                  </p>
                  <Button asChild size="lg" variant="outline" className="group/btn">
                    <Link href="/oferta/produkty">
                      Przeglądaj produkty
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pojazdy ciężarowe */}
        <section className="bg-muted/30 py-16 lg:py-20">
          <div className="container">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <Badge variant="outline" className="mb-2">
                  <Truck className="mr-1 h-3 w-3" />
                  Pojazdy ciężarowe
                </Badge>
                <h2 className="text-3xl font-bold">Wozy strażackie</h2>
                <p className="mt-2 text-muted-foreground">
                  Zabudowy i wyposażenie do pojazdów ciężarowych
                </p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/oferta/pojazdy?typ=ciezarowe">
                  Zobacz wszystkie
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trucks.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/oferta/pojazdy/${brand.slug}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl font-bold text-slate-400 transition-colors group-hover:text-primary">
                          {brand.name}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold group-hover:text-primary">
                        {brand.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {brand.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Pickupy */}
        <section className="py-16 lg:py-20">
          <div className="container">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <Badge variant="outline" className="mb-2">
                  <Truck className="mr-1 h-3 w-3" />
                  Pickupy
                </Badge>
                <h2 className="text-3xl font-bold">Zabudowy pickupów</h2>
                <p className="mt-2 text-muted-foreground">
                  Profesjonalne zabudowy skrzyni ładunkowej
                </p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/oferta/pojazdy?typ=pickup">
                  Zobacz wszystkie
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pickups.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/oferta/pojazdy/${brand.slug}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100">
                      <div className="flex h-full items-center justify-center">
                        <span className="text-3xl font-bold text-amber-400 transition-colors group-hover:text-primary">
                          {brand.name}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold group-hover:text-primary">
                        {brand.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {brand.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Kategorie produktów */}
        <section className="bg-slate-900 py-16 lg:py-20">
          <div className="container">
            <div className="mb-10 text-center">
              <Badge className="mb-2 bg-primary/20 text-primary">
                <Package className="mr-1 h-3 w-3" />
                Kategorie produktów
              </Badge>
              <h2 className="text-3xl font-bold text-white">
                Co produkujemy?
              </h2>
              <p className="mt-2 text-slate-400">
                Wybierz kategorię produktu, aby zobaczyć pełną ofertę
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon = iconMap[category.slug] || Package
                return (
                  <Link
                    key={category.slug}
                    href={`/oferta/produkty/${category.slug}`}
                    className="group"
                  >
                    <Card className="h-full border-slate-800 bg-slate-800/50 transition-all hover:border-primary hover:bg-slate-800">
                      <CardContent className="p-6">
                        <div 
                          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 font-semibold text-white group-hover:text-primary">
                          {category.name}
                        </h3>
                        <p className="text-sm text-slate-400">
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

        {/* CTA */}
        <section className="py-16 lg:py-20">
          <div className="container">
            <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary to-red-700">
              <CardContent className="p-8 lg:p-12">
                <div className="mx-auto max-w-2xl text-center text-white">
                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Nie znalazłeś tego, czego szukasz?
                  </h2>
                  <p className="mt-4 text-white/80">
                    Wykonujemy również produkty na indywidualne zamówienie. 
                    Skontaktuj się z nami, a przygotujemy ofertę dopasowaną do Twoich potrzeb.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" variant="secondary">
                      <Link href="/kontakt">
                        Zapytaj o wycenę
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <Link href="/realizacje">
                        Zobacz realizacje
                      </Link>
                    </Button>
                  </div>
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
