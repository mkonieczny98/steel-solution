import Link from 'next/link'
import { LayoutTemplate } from 'lucide-react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { VehicleBrandFormNew } from '../vehicle-brand-form-new'

export const dynamic = 'force-dynamic'

export default async function EditVehicleBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const vehicleBrand = await prisma.vehicleBrand.findUnique({
    where: { id },
    include: {
      categories: {
        include: { category: true }
      }
    }
  })

  if (!vehicleBrand) {
    notFound()
  }

  // Przekształć dane z relacji na selectedCategoryIds
  const initialData = {
    ...vehicleBrand,
    selectedCategoryIds: vehicleBrand.categories.map(c => c.category.id)
  }

  return (
    <>
      <div className="mx-6 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-primary/5 p-4 text-sm">
        <span>
          <strong>Sekcje strony tej marki</strong> – dodaj tekst, FAQ, galerię, wideo i inne sekcje albo zmień ich kolejność.
        </span>
        <Link
          href={`/admin/pojazdy/${id}/uklad`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary/90"
        >
          <LayoutTemplate className="h-4 w-4" />
          Edytuj układ strony
        </Link>
      </div>
      <VehicleBrandFormNew initialData={initialData} />
    </>
  )
}
