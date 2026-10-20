import type { Metadata } from 'next'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { PageHero } from '@/components/public/blocks'
import { site } from '@/lib/site'
import { getSiteInfo, type SiteInfo } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  description: `Zasady przetwarzania danych osobowych w serwisie ${site.name}.`,
  alternates: { canonical: '/polityka-prywatnosci' },
}

// Szablon – przed publikacją uzupełnij pełne dane administratora (nazwa firmy, NIP) i zweryfikuj treść.
const getSections = (info: SiteInfo) => [
  {
    title: 'Administrator danych',
    body: [
      `Administratorem danych osobowych jest ${info.name}, ${info.fullAddress}. W sprawach dotyczących danych osobowych możesz kontaktować się pod adresem ${info.email} lub telefonicznie: ${info.phone}.`,
    ],
  },
  {
    title: 'Jakie dane zbieramy i po co',
    body: [
      'Przez formularz kontaktowy zbieramy dane, które sam podajesz: imię i nazwisko, adres e-mail, numer telefonu, nazwę jednostki lub firmy, informacje o pojeździe, treść wiadomości oraz opcjonalnie załączone zdjęcia i dokumenty. Załączniki są dostępne wyłącznie po zalogowaniu do panelu firmy.',
      'Dane przetwarzamy wyłącznie w celu odpowiedzi na zapytanie, przygotowania oferty i dalszej korespondencji z nim związanej.',
    ],
  },
  {
    title: 'Podstawa prawna',
    body: [
      'Dane przetwarzamy na podstawie Twojej zgody (art. 6 ust. 1 lit. a RODO) oraz w celu podjęcia działań na Twoje żądanie przed zawarciem umowy (art. 6 ust. 1 lit. b RODO).',
    ],
  },
  {
    title: 'Jak długo przechowujemy dane',
    body: [
      'Dane z zapytań przechowujemy przez czas potrzebny do obsługi zapytania, a jeśli dojdzie do współpracy – przez okres wymagany przepisami prawa (np. podatkowymi). Zgodę możesz wycofać w każdej chwili.',
    ],
  },
  {
    title: 'Komu przekazujemy dane',
    body: [
      'Dane mogą być przekazywane wyłącznie podmiotom, które świadczą dla nas usługi techniczne (hosting, poczta e-mail), na podstawie umów powierzenia przetwarzania. Nie sprzedajemy danych i nie przekazujemy ich do celów marketingowych.',
    ],
  },
  {
    title: 'Twoje prawa',
    body: [
      'Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, wniesienia sprzeciwu oraz cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania przed jej cofnięciem).',
      'Przysługuje Ci także prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.',
    ],
  },
  {
    title: 'Pliki cookies i pomiar działania strony',
    body: [
      'Serwis nie stosuje cookies marketingowych ani analitycznych. Wykorzystywane są wyłącznie pliki niezbędne do działania strony i panelu administracyjnego.',
      'Zliczamy dzienne sumy kliknięć kontaktu, rozpoczęć formularza, błędów i zapisanych zapytań według rodzaju podstrony. Te liczniki nie zawierają treści formularza ani identyfikatora odwiedzającego. Do ograniczenia spamu czasowo wykorzystujemy skrót kryptograficzny adresu IP.',
    ],
  },
]

export default async function PolitykaPrywatnosciPage() {
  const sections = getSections(await getSiteInfo())
  return (
    <>
      <PublicHeader />

      <main id="main">
        <PageHero eyebrow="Informacje prawne" title="Polityka prywatności" breadcrumbs={[{ name: 'Polityka prywatności' }]} />

        <section className="py-16 lg:py-24">
          <div className="container max-w-3xl">
            <ol className="space-y-12">
              {sections.map((section, i) => (
                <li key={section.title}>
                  <h2 className="heading-display flex items-baseline gap-4 text-3xl">
                    <span className="text-primary">{String(i + 1).padStart(2, '0')}</span>
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-3 leading-relaxed text-muted-foreground">
                    {section.body.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  )
}
