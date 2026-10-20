'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowRight, ChevronDown, Clock, Mail, Menu, Phone, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IMAGES } from '@/lib/images'
import { Modal } from '@/components/public/modal'
import { Logo } from '@/components/public/logo'
import { SmartImage } from '@/components/public/smart-image'

export type MegaMenuData = {
  categories: { name: string; slug: string; description: string | null; image: string }[]
  trucks: { name: string; slug: string }[]
  pickups: { name: string; slug: string }[]
}

type Contact = {
  phone: string
  phoneHref: string
  email: string
  hours: { days: string; time: string }[]
}

type NavLink = { name: string; href: string }

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)

function MegaMenu({ menu, contact, onNavigate }: { menu: MegaMenuData; contact: Contact; onNavigate: () => void }) {
  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-12">
      {/* Produkty */}
      <div className="lg:col-span-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Produkty</p>
          <Link
            href="/oferta/produkty"
            onClick={onNavigate}
            className="group flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wider text-white hover:text-primary"
          >
            Wszystkie
            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <ul className="grid gap-1 sm:grid-cols-2">
          {menu.categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/oferta/produkty/${category.slug}`}
                onClick={onNavigate}
                className="group flex items-center gap-4 p-2 transition-colors hover:bg-white/5"
              >
                <span className="relative h-14 w-20 shrink-0 overflow-hidden bg-zinc-800">
                  <SmartImage
                    src={category.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-semibold uppercase leading-tight text-white group-hover:text-primary">
                    {category.name}
                  </span>
                  {category.description && (
                    <span className="mt-0.5 block truncate text-xs text-zinc-500">{category.description}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Pojazdy */}
      <div className="grid grid-cols-2 gap-6 border-white/10 lg:col-span-3 lg:border-l lg:pl-8">
        {[
          { title: 'Ciężarowe', items: menu.trucks },
          { title: 'Pickupy i SUV', items: menu.pickups },
        ].map((group) => (
          <div key={group.title}>
            <p className="mb-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">{group.title}</p>
            <ul className="space-y-2">
              {group.items.map((brand) => (
                <li key={brand.slug}>
                  <Link
                    href={`/oferta/pojazdy/${brand.slug}`}
                    onClick={onNavigate}
                    className="block text-sm text-zinc-300 transition-colors hover:translate-x-0.5 hover:text-white"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link
          href="/oferta/pojazdy"
          onClick={onNavigate}
          className="group col-span-2 flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wider text-white hover:text-primary"
        >
          Wszystkie marki
          <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Karta wyceny */}
      <div className="lg:col-span-3">
        <Link href="/kontakt#formularz" onClick={onNavigate} className="group relative isolate flex h-full min-h-[260px] flex-col justify-end overflow-hidden p-6">
          <SmartImage
            src={IMAGES.fireTruckForest}
            alt=""
            fill
            sizes="320px"
            className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
          <p className="eyebrow mb-3">Na wymiar</p>
          <p className="heading-display text-3xl text-white">Bezpłatna wycena</p>
          <p className="mt-2 text-sm text-zinc-300">Opisz pojazd i sprzęt – przygotujemy projekt.</p>
          <span className="clip-corner mt-5 inline-flex h-11 w-fit items-center gap-2 bg-primary px-5 font-display text-sm font-bold uppercase tracking-wider text-white">
            Zapytaj
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        <a href={contact.phoneHref} className="mt-3 flex items-center gap-2 font-display text-lg font-semibold text-white hover:text-primary">
          <Phone className="h-4 w-4 text-primary" />
          {contact.phone}
        </a>
      </div>
    </div>
  )
}

export function HeaderClient({ menu, contact, pages = [] }: { menu: MegaMenuData; contact: Contact; pages?: NavLink[] }) {
  const pathname = usePathname()
  // Strony z kreatora oznaczone „Pokaż w menu” trafiają między „O nas” a „Kontakt”
  const links: NavLink[] = [
    { name: 'Realizacje', href: '/realizacje' },
    { name: 'O nas', href: '/o-nas' },
    ...pages,
    { name: 'Kontakt', href: '/kontakt' },
  ]
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<'produkty' | 'pojazdy' | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const headerRef = useRef<HTMLElement>(null)
  const offerActive = pathname.startsWith('/oferta')

  const closeAll = useCallback(() => {
    setMegaOpen(false)
    setMobileOpen(false)
  }, [])

  useEffect(() => {
    closeAll()
  }, [pathname, closeAll])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const resize = () => { if (desktop.matches) setMobileOpen(false) }
    desktop.addEventListener('change', resize)
    return () => desktop.removeEventListener('change', resize)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!megaOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMegaOpen(false)
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMegaOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [megaOpen])

  // Otwieranie na najechanie z krótkim opóźnieniem zamknięcia, żeby menu nie znikało przy przesuwaniu kursora
  const openMega = () => {
    clearTimeout(closeTimer.current)
    setMegaOpen(true)
  }
  const scheduleClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150)
  }

  return (
    <>
      <div className="hidden bg-black text-xs text-zinc-400 lg:block">
        <div className="container flex h-9 items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {contact.hours
              .slice(0, 2)
              .map((h) => `${h.days}: ${h.time}`)
              .join(' · ')}
          </div>
          <div className="flex items-center gap-6">
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 transition-colors hover:text-white">
              <Mail className="h-3.5 w-3.5 text-primary" />
              {contact.email}
            </a>
            <a href={contact.phoneHref} className="flex items-center gap-2 transition-colors hover:text-white">
              <Phone className="h-3.5 w-3.5 text-primary" />
              {contact.phone}
            </a>
          </div>
        </div>
      </div>

      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 w-full border-b border-white/10 bg-ink/95 backdrop-blur transition-shadow supports-[backdrop-filter]:bg-ink/85',
          (scrolled || megaOpen) && 'shadow-lg shadow-black/30'
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-6 lg:h-20">
          <Logo />

          <nav aria-label="Główna nawigacja" className="hidden h-full items-center gap-1 lg:flex">
            <div className="flex h-full items-center" onMouseEnter={openMega} onMouseLeave={scheduleClose}>
              <button
                type="button"
                aria-expanded={megaOpen}
                aria-controls="mega-menu"
                onClick={() => setMegaOpen((o) => !o)}
                className={cn(
                  'relative flex h-full items-center gap-1.5 px-3 font-display text-[15px] font-semibold uppercase tracking-wider transition-colors',
                  offerActive || megaOpen ? 'text-white' : 'text-zinc-400 hover:text-white'
                )}
              >
                Oferta
                <ChevronDown className={cn('h-4 w-4 transition-transform', megaOpen && 'rotate-180 text-primary')} />
                <span
                  className={cn(
                    'absolute inset-x-3 bottom-0 h-0.5 origin-left bg-primary transition-transform',
                    offerActive || megaOpen ? 'scale-x-100' : 'scale-x-0'
                  )}
                />
              </button>
            </div>
            {links.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-full items-center px-3 font-display text-[15px] font-semibold uppercase tracking-wider transition-colors',
                    active ? 'text-white' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {item.name}
                  <span
                    className={cn(
                      'absolute inset-x-3 bottom-0 h-0.5 origin-left bg-primary transition-transform',
                      active ? 'scale-x-100' : 'scale-x-0'
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={contact.phoneHref}
              className="flex items-center gap-2 font-display text-lg font-semibold tracking-wide text-white transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 text-primary" />
              {contact.phone}
            </a>
            <Link
              href="/kontakt#formularz"
              className="clip-corner inline-flex h-11 items-center gap-2 bg-primary px-5 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/90"
            >
              Bezpłatna wycena
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <a href={contact.phoneHref} aria-label={`Zadzwoń: ${contact.phone}`} className="flex h-10 w-10 items-center justify-center text-white">
              <Phone className="h-5 w-5" />
            </a>
            <button
              type="button"
              aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center text-white"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mega menu – desktop */}
        <div
          id="mega-menu"
          onMouseEnter={openMega}
          onMouseLeave={scheduleClose}
          className={cn(
            'absolute inset-x-0 top-full hidden origin-top border-b border-white/10 bg-ink shadow-2xl shadow-black/50 transition-all duration-200 lg:block',
            megaOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
          )}
        >
          <div className="hazard-stripe h-1 opacity-80" />
          <MegaMenu menu={menu} contact={contact} onNavigate={closeAll} />
        </div>

      </header>

      {/* Menu mobilne – poza <header>, bo backdrop-filter nagłówka zamyka w nim elementy fixed */}
      <Modal open={mobileOpen} onClose={closeAll} label="Menu mobilne" className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto border-0 bg-ink p-0 text-white">
          <div className="container flex h-16 items-center justify-between border-b border-white/10">
            <Logo />
            <button type="button" autoFocus onClick={closeAll} aria-label="Zamknij menu" className="flex h-11 w-11 items-center justify-center"><X className="h-6 w-6" /></button>
          </div>
          <nav id="mobile-menu" aria-label="Menu mobilne" className="container flex flex-col py-6" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) closeAll() }}>
            {[
              {
                key: 'produkty' as const,
                title: 'Produkty',
                all: '/oferta/produkty',
                items: menu.categories.map((c) => ({ name: c.name, href: `/oferta/produkty/${c.slug}` })),
              },
              {
                key: 'pojazdy' as const,
                title: 'Pojazdy',
                all: '/oferta/pojazdy',
                items: [...menu.trucks, ...menu.pickups].map((b) => ({ name: b.name, href: `/oferta/pojazdy/${b.slug}` })),
              },
            ].map((section) => {
              const open = mobileSection === section.key
              return (
                <div key={section.key} className="border-b border-white/10">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setMobileSection(open ? null : section.key)}
                    className={cn(
                      'flex w-full items-center justify-between py-4 font-display text-2xl font-semibold uppercase tracking-wide',
                      open ? 'text-primary' : 'text-white'
                    )}
                  >
                    {section.title}
                    <ChevronDown className={cn('h-5 w-5 opacity-60 transition-transform', open && 'rotate-180')} />
                  </button>
                  {open && (
                    <ul className="grid grid-cols-2 gap-2 pb-5">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} className="block border border-white/10 px-3 py-2.5 text-sm text-zinc-200 active:bg-white/10">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                      <li className="col-span-2">
                        <Link href={section.all} className="flex items-center gap-2 py-2 font-display text-sm font-bold uppercase tracking-wider text-primary">
                          Zobacz wszystkie
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              )
            })}
            {links.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between border-b border-white/10 py-4 font-display text-2xl font-semibold uppercase tracking-wide',
                    active ? 'text-primary' : 'text-white'
                  )}
                >
                  {item.name}
                  <ArrowRight className="h-5 w-5 opacity-50" />
                </Link>
              )
            })}
            <div className="mt-8 grid gap-3">
              <a
                href={contact.phoneHref}
                className="flex h-14 items-center justify-center gap-2 border border-white/20 font-display text-lg font-semibold uppercase tracking-wider text-white"
              >
                <Phone className="h-5 w-5 text-primary" />
                {contact.phone}
              </a>
              <Link
                href="/kontakt#formularz"
                className="flex h-14 items-center justify-center gap-2 bg-primary font-display text-lg font-bold uppercase tracking-wider text-white"
              >
                Bezpłatna wycena
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-8 text-sm text-zinc-500">
              {contact.hours.slice(0, 2).map((h) => (
                <span key={h.days} className="block">
                  {h.days}: {h.time}
                </span>
              ))}
            </p>
          </nav>
      </Modal>
    </>
  )
}
