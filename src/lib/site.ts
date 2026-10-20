// Dane firmy w jednym miejscu – nagłówek, stopka, kontakt, SEO i dane strukturalne czytają stąd.
export const site = {
  name: 'Steel Solution',
  tagline: 'Zabudowy wozów strażackich i pojazdów służb',
  description:
    'Projektujemy i wykonujemy zabudowy wozów strażackich, półki do kabin, boksy na narzędzia, mocowania sprzętu i zabudowy pickupów. Wszystko na wymiar.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  phone: '+48 690 418 119',
  phoneHref: 'tel:+48690418119',
  email: 'kontakt@steelsolution.pl',
  address: {
    street: 'Leśna 12',
    postalCode: '64-020',
    city: 'Betkowo',
    country: 'PL',
  },
  hours: [
    { days: 'Poniedziałek – Piątek', time: '8:00 – 17:00' },
    { days: 'Sobota', time: '9:00 – 14:00' },
    { days: 'Niedziela', time: 'Zamknięte' },
  ],
  // Uzupełnij adresy profili – puste linki nie są wyświetlane.
  social: {
    facebook: '',
    instagram: '',
  },
}

// Wersja testowa / podgląd: SITE_NOINDEX=true blokuje indeksowanie całego serwisu (meta, nagłówek, robots.txt)
export const noindex = process.env.SITE_NOINDEX === 'true'

export const fullAddress = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
