import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, ArrowUpRight, FileText } from 'lucide-react'
import { getCategories } from '@/lib/data'
import { getMenuPages, getSiteInfo } from '@/lib/content'
import { Logo } from '@/components/public/logo'

const company = [
  { name: 'O nas', href: '/o-nas' },
  { name: 'Realizacje', href: '/realizacje' },
  { name: 'Marki pojazdów', href: '/oferta/pojazdy' },
  { name: 'Kontakt', href: '/kontakt' },
]

export async function PublicFooter() {
  // Stopka trafia też do statycznej strony 404 – bez bazy (np. podczas buildu) renderuje się bez listy produktów
  const [categories, site, pages] = await Promise.all([getCategories().catch(() => []), getSiteInfo(), getMenuPages()])
  const companyLinks = [...company.slice(0, 1), ...pages.map((p) => ({ name: p.title, href: `/${p.slug}` })), ...company.slice(1)]
  const socials = [
    { name: 'Facebook', href: site.social.facebook, icon: Facebook },
    { name: 'Instagram', href: site.social.instagram, icon: Instagram },
  ].filter((s) => s.href)

  return (
    <>
      <footer className="relative bg-ink pb-20 text-zinc-400 lg:pb-0">
        <div className="hazard-stripe h-1.5 opacity-80" />
        <div className="container py-14 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Logo />
              <p className="mt-6 max-w-sm whitespace-pre-line text-sm leading-relaxed">{site.footerText}</p>
              {socials.length > 0 && (
                <div className="mt-6 flex gap-3">
                  {socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="flex h-10 w-10 items-center justify-center border border-white/10 transition-colors hover:border-primary hover:text-white"
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Produkty</h3>
              <ul className="mt-5 space-y-3">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/oferta/produkty/${category.slug}`} className="text-sm transition-colors hover:text-white">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Firma</h3>
              <ul className="mt-5 space-y-3">
                {companyLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm transition-colors hover:text-white">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Kontakt</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  <a href={site.phoneHref} className="flex items-center gap-3 font-display text-xl font-semibold text-white transition-colors hover:text-primary">
                    <Phone className="h-4 w-4 text-primary" />
                    {site.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="flex items-center gap-3 transition-colors hover:text-white">
                    <Mail className="h-4 w-4 text-primary" />
                    {site.email}
                  </a>
                </li>
                <li>
                  <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 transition-colors hover:text-white">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      {site.fullAddress}
                      <span className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        Pokaż na mapie <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container flex flex-col items-center justify-between gap-4 py-6 text-xs text-zinc-500 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {site.name}. Wszelkie prawa zastrzeżone.
            </p>
            <Link href="/polityka-prywatnosci" className="transition-colors hover:text-zinc-300">
              Polityka prywatności
            </Link>
          </div>
        </div>
      </footer>

      {/* Przyklejony pasek akcji na telefonach */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-white/10 bg-ink/95 p-2 backdrop-blur lg:hidden">
        <a
          href={site.phoneHref}
          className="flex h-12 items-center justify-center gap-2 font-display text-base font-bold uppercase tracking-wider text-white"
        >
          <Phone className="h-5 w-5 text-primary" />
          Zadzwoń
        </a>
        <Link
          href="/kontakt#formularz"
          className="flex h-12 items-center justify-center gap-2 bg-primary font-display text-base font-bold uppercase tracking-wider text-white"
        >
          <FileText className="h-5 w-5" />
          Wycena
        </Link>
      </div>
    </>
  )
}
