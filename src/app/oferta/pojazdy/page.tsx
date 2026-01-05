import Link from 'next/link'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Truck, 
  ChevronRight, 
  ArrowLeft,
  Flame,
  Car
} from 'lucide-react'

export const metadata = {
  title: 'Zabudowy według marki pojazdu | MAN, Scania, Volvo, Mercedes',
  description: 'Profesjonalne zabudowy do wozów strażackich. Wybierz markę pojazdu: MAN, Scania, Volvo, Mercedes-Benz, Renault, Iveco. Zabudowy pickup Toyota Hilux, Nissan Navara.',
}

const vehicleBrands = {
  trucks: [
    {
      name: 'MAN',
      slug: 'man',
      description: 'Zabudowy do pojazdów MAN TGM, TGL, TGS, TGX',
      models: ['TGM', 'TGL', 'TGS', 'TGX'],
      features: ['Półki do kabin', 'Podesty', 'Boksy narzędziowe', 'Mocowania sprzętu'],
    },
    {
      name: 'Scania',
      slug: 'scania',
      description: 'Wyposażenie do kabin Scania serii P, G, R, S',
      models: ['P-Series', 'G-Series', 'R-Series', 'S-Series'],
      features: ['Półki górne', 'Organizery', 'Schowki', 'Mocowania'],
    },
    {
      name: 'Volvo',
      slug: 'volvo',
      description: 'Półki i zabudowy do Volvo FH, FM, FMX, FE, FL',
      models: ['FH', 'FM', 'FMX', 'FE', 'FL'],
      features: ['Półki dedykowane', 'Podesty aluminiowe', 'Skrzynie'],
    },
    {
      name: 'Mercedes-Benz',
      slug: 'mercedes',
      description: 'Zabudowy do Mercedes Atego, Actros, Arocs, Econic',
      models: ['Atego', 'Actros', 'Arocs', 'Econic'],
      features: ['Półki do kabin', 'Boksy', 'Mocowania gaśnic'],
    },
    {
      name: 'Renault Trucks',
      slug: 'renault',
      description: 'Wyposażenie do Renault D, C, K, T',
      models: ['D-Series', 'C-Series', 'K-Series', 'T-Series'],
      features: ['Organizery', 'Półki', 'Schowki'],
    },
    {
      name: 'Iveco',
      slug: 'iveco',
      description: 'Zabudowy do Iveco Daily, Eurocargo, Stralis',
      models: ['Daily', 'Eurocargo', 'Stralis', 'S-Way'],
      features: ['Zabudowy Daily', 'Półki', 'Podesty'],
    },
    {
      name: 'DAF',
      slug: 'daf',
      description: 'Wyposażenie do DAF LF, CF, XF, XG',
      models: ['LF', 'CF', 'XF', 'XG', 'XG+'],
      features: ['Półki kabinowe', 'Organizery', 'Mocowania'],
    },
  ],
  pickups: [
    {
      name: 'Toyota Hilux',
      slug: 'toyota-hilux',
      description: 'Profesjonalne zabudowy skrzyni ładunkowej Toyota Hilux',
      models: ['Hilux AN120', 'Hilux AN130'],
      features: ['Hardtopy', 'Zabudowy aluminiowe', 'Skrzynie narzędziowe', 'Rolety'],
    },
    {
      name: 'Nissan Navara',
      slug: 'nissan-navara',
      description: 'Zabudowy i nadwozia dla Nissan Navara NP300',
      models: ['NP300', 'D23'],
      features: ['Zabudowy serwisowe', 'Hardtopy', 'Pokrywy'],
    },
    {
      name: 'SsangYong Musso',
      slug: 'ssangyong-musso',
      description: 'Kompleksowe zabudowy SsangYong Musso',
      models: ['Musso', 'Musso Grand'],
      features: ['Zabudowy aluminiowe', 'Rolety', 'Skrzynie'],
    },
    {
      name: 'Ford Ranger',
      slug: 'ford-ranger',
      description: 'Zabudowy do Ford Ranger wszystkich generacji',
      models: ['Ranger T6', 'Ranger T7', 'Ranger Raptor'],
      features: ['Hardtopy', 'Zabudowy serwisowe', 'Rolety'],
    },
    {
      name: 'Volkswagen Amarok',
      slug: 'vw-amarok',
      description: 'Zabudowy i wyposażenie VW Amarok',
      models: ['Amarok V6', 'Amarok 2023+'],
      features: ['Zabudowy premium', 'Hardtopy', 'Organizery'],
    },
    {
      name: 'Mitsubishi L200',
      slug: 'mitsubishi-l200',
      description: 'Zabudowy do Mitsubishi L200 Triton',
      models: ['L200 V', 'L200 VI'],
      features: ['Zabudowy aluminiowe', 'Pokrywy', 'Skrzynie'],
    },
  ]
}

export default function PojazdyPage() {
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
              <span className="text-foreground">Pojazdy</span>
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
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                  Wybierz markę pojazdu
                </h1>
                <p className="mt-1 text-lg text-slate-400">
                  Znajdź produkty dedykowane do Twojego pojazdu
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Wozy strażackie */}
        <section className="py-12 lg:py-16">
          <div className="container">
            <div className="mb-8 flex items-center gap-3">
              <Flame className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Wozy strażackie i pojazdy ciężarowe</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicleBrands.trucks.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/oferta/pojazdy/${brand.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold group-hover:text-primary">
                          {brand.name}
                        </h3>
                        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                      
                      <p className="mb-4 text-sm text-muted-foreground">
                        {brand.description}
                      </p>

                      <div className="mb-4">
                        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                          Modele
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {brand.models.map((model) => (
                            <Badge key={model} variant="secondary" className="text-xs">
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                          Produkty
                        </p>
                        <ul className="space-y-1">
                          {brand.features.slice(0, 3).map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Pickupy */}
        <section className="bg-muted/30 py-12 lg:py-16">
          <div className="container">
            <div className="mb-8 flex items-center gap-3">
              <Car className="h-6 w-6 text-amber-500" />
              <h2 className="text-2xl font-bold">Pickupy i pojazdy terenowe</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicleBrands.pickups.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/oferta/pojazdy/${brand.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-xl hover:-translate-y-1 hover:border-amber-500">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold group-hover:text-amber-600">
                          {brand.name}
                        </h3>
                        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-amber-500" />
                      </div>
                      
                      <p className="mb-4 text-sm text-muted-foreground">
                        {brand.description}
                      </p>

                      <div className="mb-4">
                        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                          Modele
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {brand.models.map((model) => (
                            <Badge key={model} variant="outline" className="text-xs border-amber-300">
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                          Produkty
                        </p>
                        <ul className="space-y-1">
                          {brand.features.slice(0, 3).map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="container">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center lg:p-12">
              <h2 className="text-2xl font-bold text-white">
                Nie widzisz swojego pojazdu?
              </h2>
              <p className="mt-2 text-slate-400">
                Wykonujemy zabudowy do innych marek i modeli. Skontaktuj się z nami!
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
