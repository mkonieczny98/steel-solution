import Link from 'next/link'
import { LayoutTemplate } from 'lucide-react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CategoryFormNew } from '../category-form-new'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

async function getCategory(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      vehicleBrands: {
        include: { vehicleBrand: true }
      }
    }
  })
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params
  const category = await getCategory(id)

  if (!category) {
    notFound()
  }

  // Przekształć dane z relacji na selectedVehicleIds
  const initialData = {
    ...category,
    selectedVehicleIds: category.vehicleBrands.map(vb => vb.vehicleBrand.id)
  }

  return (
    <>
      <div className="mx-6 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-primary/5 p-4 text-sm">
        <span>
          <strong>Sekcje strony tej kategorii</strong> – dodaj tekst, FAQ, galerię, wideo i inne sekcje albo zmień ich kolejność.
        </span>
        <Link
          href={`/admin/kategorie/${id}/uklad`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary/90"
        >
          <LayoutTemplate className="h-4 w-4" />
          Edytuj układ strony
        </Link>
      </div>
      <CategoryFormNew initialData={initialData} />
    </>
  )
}
