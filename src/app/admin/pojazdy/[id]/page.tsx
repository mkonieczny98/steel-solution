import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { VehicleBrandFormNew } from '../vehicle-brand-form-new'

export const dynamic = 'force-dynamic'

export default async function EditVehicleBrandPage({
  params,
}: {
  params: { id: string }
}) {
  const vehicleBrand = await prisma.vehicleBrand.findUnique({
    where: { id: params.id },
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

  return <VehicleBrandFormNew initialData={initialData} />
}
