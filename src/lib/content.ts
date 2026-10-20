import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { CONTENT_TAG } from '@/lib/data'
import { site } from '@/lib/site'
import { contentDefaults, mergeContent, type CompanyContent, type ContentKey } from '@/lib/content-schema'
import { DEFAULT_PAGE_BLOCKS, SYSTEM_PAGES, parseBlocks, type Block } from '@/lib/blocks'

export const settingKey = (key: ContentKey) => `content:${key}`

// ---------- Dane firmy (tabela Setting) ----------

const getStored = unstable_cache(
  async (key: ContentKey) => {
    const row = await prisma.setting.findUnique({ where: { key: settingKey(key) } })
    if (!row) return null
    try {
      return JSON.parse(row.value) as unknown
    } catch {
      return null
    }
  },
  ['content'],
  { tags: [CONTENT_TAG], revalidate: 300 }
)

export async function getCompanyContent(): Promise<CompanyContent> {
  const stored = await getStored('company').catch(() => null)
  return mergeContent(contentDefaults.company, stored)
}

export type SiteInfo = {
  name: string
  url: string
  phone: string
  phoneHref: string
  email: string
  address: { street: string; postalCode: string; city: string; country: string }
  fullAddress: string
  mapsUrl: string
  hours: { days: string; time: string }[]
  social: { facebook: string; instagram: string }
  footerText: string
  cta: { title: string; description: string }
}

// Dane firmy do nagłówka, stopki i kontaktu – łączą stałe z site.ts z wartościami z panelu.
export async function getSiteInfo(): Promise<SiteInfo> {
  const company = await getCompanyContent()
  const { phone, email, street, postalCode, city } = company.contact
  const fullAddress = `${street}, ${postalCode} ${city}`
  return {
    name: site.name,
    url: site.url,
    phone,
    phoneHref: `tel:${phone.replace(/[^\d+]/g, '')}`,
    email,
    address: { street, postalCode, city, country: site.address.country },
    fullAddress,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
    hours: company.hours.items,
    social: company.social,
    footerText: company.footer.text,
    cta: company.cta,
  }
}

// Podstawia {marki}, {kategorie}, {realizacje} w tekstach liczb
export function fillStats(text: string, stats: { brands: number; categories: number; projects: number }) {
  return text
    .replace(/\{marki\}/g, String(stats.brands))
    .replace(/\{kategorie\}/g, String(stats.categories))
    .replace(/\{realizacje\}/g, String(stats.projects))
}

// ---------- Strony z kreatora (tabela Page) ----------

export type PublicPage = {
  id: string | null
  title: string
  slug: string
  description: string | null
  published: boolean
  system: boolean
  blocks: Block[]
}

const getPageRow = unstable_cache(
  (slug: string) => prisma.page.findUnique({ where: { slug } }),
  ['page'],
  { tags: [CONTENT_TAG], revalidate: 300 }
)

// Strona systemowa bez zapisu w bazie (albo bez bazy) renderuje się z domyślnych bloków.
export async function getPage(slug: string): Promise<PublicPage | null> {
  const row = await getPageRow(slug).catch(() => null)
  const system = Object.values(SYSTEM_PAGES).find((p) => p.slug === slug)
  if (!row) {
    if (!system) return null
    return { id: null, title: system.title, slug, description: null, published: true, system: true, blocks: DEFAULT_PAGE_BLOCKS[slug] }
  }
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    published: row.system || row.published,
    system: row.system,
    blocks: parseBlocks(row.content),
  }
}

export const getMenuPages = unstable_cache(
  () =>
    prisma.page
      .findMany({
        where: { published: true, showInMenu: true, system: false },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        select: { title: true, slug: true },
      })
      .catch(() => [] as { title: string; slug: string }[]),
  ['menu-pages'],
  { tags: [CONTENT_TAG], revalidate: 300 }
)

// Panel zakłada wiersze stron systemowych przy pierwszym wejściu, żeby dało się je edytować jak każdą inną.
export async function ensureSystemPages() {
  for (const page of Object.values(SYSTEM_PAGES)) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { system: true },
      create: {
        slug: page.slug,
        title: page.title,
        system: true,
        published: true,
        content: JSON.stringify(DEFAULT_PAGE_BLOCKS[page.slug]),
      },
    })
  }
}
