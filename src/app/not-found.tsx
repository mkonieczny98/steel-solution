import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { buttonClass } from '@/components/public/blocks'

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="bg-blueprint relative flex min-h-[70vh] items-center bg-ink">
        <div className="container py-24">
          <p className="font-display text-[8rem] font-bold leading-none text-primary sm:text-[12rem]">404</p>
          <h1 className="heading-display mt-2 text-4xl text-white sm:text-5xl">Tej strony nie ma w garażu</h1>
          <p className="mt-4 max-w-lg text-lg text-zinc-400">
            Strona mogła zostać przeniesiona albo adres zawiera literówkę. Sprawdź ofertę albo wróć na stronę główną.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className={buttonClass('primary', 'lg')}>
              Strona główna
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/oferta" className={buttonClass('outline-light', 'lg')}>
              Zobacz ofertę
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
