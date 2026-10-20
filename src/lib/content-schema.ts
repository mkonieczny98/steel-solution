// Dane firmy edytowane w panelu (/admin/dane-firmy) i ich wartości domyślne.
// Plik nie korzysta z bazy, więc importuje go zarówno serwer, jak i edytor w przeglądarce.
import { site } from '@/lib/site'
import { sanitizeValues, mergeValues, type Field, type Values } from '@/lib/fields'

export type { Field }

export type Section = { key: string; title: string; description?: string; fields: Field[] }

export type ContentDoc = {
  key: string
  title: string
  description: string
  adminPath: string
  publicPath: string
  sections: Section[]
}

export const companyDoc: ContentDoc = {
  key: 'company',
  title: 'Dane firmy',
  description: 'Telefon, e-mail, adres, godziny pracy i social media – w nagłówku, stopce i na stronie kontaktu.',
  adminPath: '/admin/dane-firmy',
  publicPath: '/kontakt',
  sections: [
    {
      key: 'contact',
      title: 'Kontakt',
      fields: [
        { key: 'phone', label: 'Telefon', type: 'text', hint: 'Format: +48 690 418 119' },
        { key: 'email', label: 'E-mail', type: 'text' },
        { key: 'street', label: 'Ulica i numer', type: 'text' },
        { key: 'postalCode', label: 'Kod pocztowy', type: 'text' },
        { key: 'city', label: 'Miejscowość', type: 'text' },
      ],
    },
    {
      key: 'hours',
      title: 'Godziny pracy',
      fields: [
        {
          key: 'items',
          label: 'Godziny',
          type: 'list',
          itemLabel: 'Dzień',
          fields: [
            { key: 'days', label: 'Dni', type: 'text' },
            { key: 'time', label: 'Godziny', type: 'text' },
          ],
        },
      ],
    },
    {
      key: 'social',
      title: 'Social media',
      description: 'Puste pole = ikona nie wyświetla się w stopce.',
      fields: [
        { key: 'facebook', label: 'Facebook (pełny adres)', type: 'text' },
        { key: 'instagram', label: 'Instagram (pełny adres)', type: 'text' },
      ],
    },
    {
      key: 'footer',
      title: 'Stopka',
      fields: [{ key: 'text', label: 'Opis firmy w stopce', type: 'textarea' }],
    },
    {
      key: 'cta',
      title: 'Czerwony pasek na podstronach',
      description: 'Pasek „Zamów wycenę” na dole stron oferty, produktów, pojazdów i realizacji (na stronach z kreatora ustawiasz go w sekcji).',
      fields: [
        { key: 'title', label: 'Nagłówek', type: 'text' },
        { key: 'description', label: 'Opis', type: 'textarea' },
      ],
    },
  ],
}

export const companyDefaults = {
  contact: {
    phone: site.phone,
    email: site.email,
    street: site.address.street,
    postalCode: site.address.postalCode,
    city: site.address.city,
  },
  hours: { items: site.hours },
  social: { facebook: site.social.facebook, instagram: site.social.instagram },
  footer: {
    text: 'Projektujemy, produkujemy i montujemy zabudowy do wozów strażackich i pojazdów służb. Każdy element na wymiar, pod konkretny pojazd i sprzęt jednostki.',
  },
  cta: {
    title: 'Masz pojazd do zabudowy?',
    description: 'Opisz pojazd i sprzęt, który ma się w nim znaleźć. Przygotujemy projekt i bezpłatną wycenę.',
  },
}

export const contentDocs = { company: companyDoc }
export const contentDefaults = { company: companyDefaults }
export type ContentKey = keyof typeof contentDocs
export type CompanyContent = typeof companyDefaults

export const isContentKey = (key: unknown): key is ContentKey => typeof key === 'string' && key in contentDocs

export function sanitizeContent(doc: ContentDoc, input: unknown): Record<string, Values> {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  return Object.fromEntries(doc.sections.map((section) => [section.key, sanitizeValues(section.fields, source[section.key])]))
}

export function mergeContent<T extends Record<string, Values>>(defaults: T, stored: unknown): T {
  const result = structuredClone(defaults) as Record<string, Values>
  if (!stored || typeof stored !== 'object') return result as T
  for (const key of Object.keys(result)) {
    result[key] = mergeValues(result[key], (stored as Record<string, unknown>)[key])
  }
  return result as T
}
