import Link from 'next/link'
import { cn } from '@/lib/utils'
import { site } from '@/lib/site'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn('h-10 w-10', className)}>
      <path d="M0 0h30l10 10v30H0z" fill="hsl(var(--primary))" />
      <path d="M9 25.5 20 14l11 11.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="square" />
      <path d="M9 33 20 21.5 31 33" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="square" />
    </svg>
  )
}

export function Logo({ className, inverted = true }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn('group flex items-center gap-3', className)} aria-label={`${site.name} – strona główna`}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-xl font-bold uppercase tracking-wide',
            inverted ? 'text-white' : 'text-foreground'
          )}
        >
          Steel Solution
        </span>
        <span className={cn('mt-1 text-[11px] font-medium uppercase tracking-[0.2em]', inverted ? 'text-zinc-400' : 'text-muted-foreground')}>
          Zabudowy specjalne
        </span>
      </span>
    </Link>
  )
}
