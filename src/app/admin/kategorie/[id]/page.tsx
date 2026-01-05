import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CategoryFormNew } from '../category-form-new'

interface Props {
  params: { id: string }
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
  const category = await getCategory(params.id)

  if (!category) {
    notFound()
  }

  // Przekształć dane z relacji na selectedVehicleIds
  const initialData = {
    ...category,
    selectedVehicleIds: category.vehicleBrands.map(vb => vb.vehicleBrand.id)
  }

  return <CategoryFormNew initialData={initialData} />
}
