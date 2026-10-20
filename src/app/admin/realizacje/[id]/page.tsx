import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/header'
import { ProjectForm } from '../project-form'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const [project, categories] = await Promise.all([
    getProject(id),
    getCategories(),
  ])

  if (!project) {
    notFound()
  }

  // Transform data for the form
  const formData = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    content: project.content,
    year: project.year,
    categoryId: project.categoryId,
    vehicleBrand: project.vehicleBrand,
    vehicleModel: project.vehicleModel,
    images: project.images ? JSON.parse(project.images) : [],
    thumbnail: project.thumbnail,
    metaTitle: project.metaTitle,
    metaDescription: project.metaDescription,
    featured: project.featured,
    published: project.published,
  }

  return (
    <>
      <AdminHeader
        title="Edytuj realizację"
        description={project.title}
      />
      <div className="p-6">
        <ProjectForm categories={categories} initialData={formData} />
      </div>
    </>
  )
}
