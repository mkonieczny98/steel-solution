import { cn } from '@/lib/utils'

// Style przycisków-linków strony publicznej (bez zależności od bazy – można importować w komponentach klienckich)
type ButtonVariant = 'primary' | 'light' | 'dark' | 'outline-light' | 'outline-dark'

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  light: 'bg-white text-ink hover:bg-zinc-200',
  dark: 'bg-ink text-white hover:bg-zinc-800',
  'outline-light': 'border border-white/30 text-white hover:border-white hover:bg-white/10',
  'outline-dark': 'border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-white',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: 'md' | 'lg' = 'md') {
  return cn(
    'inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    size === 'lg' ? 'h-14 px-7 text-base' : 'h-12 px-6 text-sm',
    variant === 'primary' && 'clip-corner',
    buttonStyles[variant]
  )
}
