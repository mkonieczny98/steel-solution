import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { site } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, brands, projects, pages] = await Promise.all([
    prisma.category.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.vehicleBrand.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.page.findMany({ where: { published: true, system: false }, select: { slug: true, updatedAt: true } }),
  ])

  const staticPages = ['', '/oferta', '/oferta/produkty', '/oferta/pojazdy', '/realizacje', '/o-nas', '/kontakt', '/polityka-prywatnosci']

  return [
    ...staticPages.map((path) => ({
      url: `${site.url}${path}`,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.7,
    })),
    ...categories.map((c) => ({ url: `${site.url}/oferta/produkty/${c.slug}`, lastModified: c.updatedAt, priority: 0.8 })),
    ...brands.map((b) => ({ url: `${site.url}/oferta/pojazdy/${b.slug}`, lastModified: b.updatedAt, priority: 0.7 })),
    ...projects.map((p) => ({ url: `${site.url}/realizacje/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...pages.map((p) => ({ url: `${site.url}/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
  ]
}
