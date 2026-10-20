import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

// Treści publiczne są cache'owane; panel admina czyści cache tagiem CONTENT_TAG po każdej zmianie.
export const CONTENT_TAG = 'content'
const REVALIDATE = 300

const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) =>
  unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: REVALIDATE })

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const getCategories = cached(
  () =>
    prisma.category.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { projects: { where: { published: true } } } },
        vehicleBrands: { include: { vehicleBrand: { select: { name: true, slug: true, published: true } } } },
      },
    }),
  'categories'
)

export const getVehicleBrands = cached(
  () =>
    prisma.vehicleBrand.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      include: { categories: { include: { category: { select: { name: true, slug: true, published: true } } } } },
    }),
  'vehicle-brands'
)

export const getFeaturedProjects = cached(
  (take: number) =>
    prisma.project.findMany({
      where: { published: true, featured: true },
      take,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
  'featured-projects'
)

export const getProjects = cached(
  (categorySlug?: string) =>
    prisma.project.findMany({
      where: { published: true, ...(categorySlug ? { category: { slug: categorySlug } } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
  'projects'
)

export const getStats = cached(async () => {
  const [projects, brands, categories] = await Promise.all([
    prisma.project.count({ where: { published: true } }),
    prisma.vehicleBrand.count({ where: { published: true } }),
    prisma.category.count({ where: { published: true } }),
  ])
  return { projects, brands, categories }
}, 'stats')

export const getCategory = cached(
  (slug: string) =>
    prisma.category.findFirst({
      where: { slug, published: true },
      include: { vehicleBrands: { include: { vehicleBrand: true } } },
    }),
  'category'
)

export const getCategoryProjects = cached(
  (categoryId: string) =>
    prisma.project.findMany({
      where: { published: true, categoryId },
      include: { category: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
  'category-projects'
)

export const getVehicleBrand = cached(
  (slug: string) =>
    prisma.vehicleBrand.findFirst({
      where: { slug, published: true },
      include: { categories: { include: { category: true } } },
    }),
  'vehicle-brand'
)

// Realizacje mają markę zapisaną tekstem („Toyota”), a marka w bazie może mieć pełną nazwę („Toyota Hilux”).
export const getBrandProjects = cached(
  (brandName: string) =>
    prisma.project.findMany({
      where: {
        published: true,
        OR: [
          { vehicleBrand: { contains: brandName, mode: 'insensitive' } },
          { vehicleBrand: { contains: brandName.split(/[\s-]/)[0], mode: 'insensitive' } },
        ],
      },
      include: { category: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
  'brand-projects'
)

export const getProject = cached(
  (slug: string) =>
    prisma.project.findFirst({
      where: { slug, published: true },
      include: { category: true },
    }),
  'project'
)

export const getRelatedProjects = cached(
  (categoryId: string, excludeId: string) =>
    prisma.project.findMany({
      where: { categoryId, published: true, NOT: { id: excludeId } },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
  'related-projects'
)

export type CategoryWithRelations = Awaited<ReturnType<typeof getCategories>>[number]
export type ProjectWithCategory = Awaited<ReturnType<typeof getProjects>>[number]
