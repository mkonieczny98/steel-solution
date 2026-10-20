import { slugify } from '@/lib/utils'
import { RESERVED_SLUGS } from '@/lib/blocks'

// Walidacja adresu nowej / edytowanej strony
export function normalizeSlug(input: unknown): { slug: string } | { error: string } {
  const slug = slugify(typeof input === 'string' ? input : '').slice(0, 80)
  if (!slug) return { error: 'Podaj adres strony (np. dofinansowania)' }
  if (RESERVED_SLUGS.includes(slug)) return { error: `Adres „/${slug}” jest zajęty przez stałą podstronę` }
  return { slug }
}
