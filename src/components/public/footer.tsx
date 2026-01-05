import Link from 'next/link'
import { Flame, Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'

const navigation = {
  oferta: [
    { name: 'Zabudowy wozów strażackich', href: '/oferta/wozy-strazackie' },
    { name: 'Półki do kabin', href: '/oferta/polki-do-kabin' },
    { name: 'Podesty i boksy', href: '/oferta/podesty-i-boksy' },
    { name: 'Mocowania sprzętu', href: '/oferta/mocowania-sprzetu' },
    { name: 'Zabudowy pick-upów', href: '/oferta/zabudowy-pickup' },
  ],
  firma: [
    { name: 'O nas', href: '/o-nas' },
    { name: 'Realizacje', href: '/realizacje' },
    { name: 'Kontakt', href: '/kontakt' },
  ],
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-zinc-900 text-zinc-300">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Logo & description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Steel Solution
              </span>
            </Link>
            <p className="mt-4 text-sm">
              Profesjonalne zabudowy wozów strażackich i pojazdów specjalnych.
              Wszystko na wymiar, pod indywidualne wymagania klienta.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="#"
                className="rounded-lg bg-zinc-800 p-2 transition-colors hover:bg-zinc-700"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-lg bg-zinc-800 p-2 transition-colors hover:bg-zinc-700"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Oferta */}
          <div>
            <h3 className="font-semibold text-white">Oferta</h3>
            <ul className="mt-4 space-y-2">
              {navigation.oferta.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Firma */}
          <div>
            <h3 className="font-semibold text-white">Firma</h3>
            <ul className="mt-4 space-y-2">
              {navigation.firma.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="font-semibold text-white">Kontakt</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+48123456789" className="hover:text-white">
                  +48 690 418 119
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:kontakt@steelsolution.pl" className="hover:text-white">
                  kontakt@steelsolution.pl
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>Leśna 12, 64-020 Betkowo</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Steel Solution. Wszelkie prawa
            zastrzeżone.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/polityka-prywatnosci" className="hover:text-zinc-300">
              Polityka prywatności
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
