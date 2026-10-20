import { getCategories, getVehicleBrands } from '@/lib/data'
import { getMenuPages, getSiteInfo } from '@/lib/content'
import { fallbackImage } from '@/lib/images'
import { HeaderClient, type MegaMenuData } from '@/components/public/header-client'

// Serwerowa część nagłówka: pobiera dane do mega menu i dane kontaktowe, resztę robi HeaderClient.
export async function PublicHeader() {
  const [categories, brands, info, pages] = await Promise.all([
    getCategories().catch(() => []),
    getVehicleBrands().catch(() => []),
    getSiteInfo(),
    getMenuPages(),
  ])

  const menu: MegaMenuData = {
    categories: categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image || c.heroImage || fallbackImage('product'),
    })),
    trucks: brands.filter((b) => b.type === 'truck').map((b) => ({ name: b.name, slug: b.slug })),
    pickups: brands.filter((b) => b.type === 'pickup').map((b) => ({ name: b.name, slug: b.slug })),
  }

  return (
    <HeaderClient
      menu={menu}
      contact={{ phone: info.phone, phoneHref: info.phoneHref, email: info.email, hours: info.hours }}
      pages={pages.map((p) => ({ name: p.title, href: `/${p.slug}` }))}
    />
  )
}
