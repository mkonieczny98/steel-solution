import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/header'
import { ProjectForm } from '../project-form'

export const dynamic = 'force-dynamic'

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function NewProjectPage() {
  const categories = await getCategories()

  return (
    <>
      <AdminHeader
        title="Nowa realizacja"
        description="Dodaj nową realizację do portfolio"
      />
      <div className="p-6">
        <ProjectForm categories={categories} />
      </div>
    </>
  )
}
