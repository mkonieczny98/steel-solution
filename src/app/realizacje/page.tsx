import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { Badge } from '@/components/ui/badge'
import { Truck } from 'lucide-react'

async function getProjects() {
  return prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export const metadata = {
  title: 'Realizacje',
  description: 'Zobacz nasze realizacje zabudów wozów strażackich, półek do kabin i innych projektów.',
}

export default async function RealizacjePage() {
  const [projects, categories] = await Promise.all([getProjects(), getCategories()])

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen">
        {/* Header */}
        <section className="border-b bg-muted/30 py-12">
          <div className="container">
            <h1 className="text-3xl font-bold md:text-4xl">Realizacje</h1>
            <p className="mt-2 text-muted-foreground">
              Zobacz nasze najnowsze projekty i realizacje
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b">
          <div className="container flex gap-2 overflow-x-auto py-4">
            <Badge
              variant="default"
              className="cursor-pointer whitespace-nowrap"
            >
              Wszystkie
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="cursor-pointer whitespace-nowrap hover:bg-muted"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </section>

        {/* Projects grid */}
        <section className="py-12">
          <div className="container">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Truck className="h-16 w-16 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">Brak realizacji</h2>
                <p className="mt-2 text-muted-foreground">
                  Wkrótce pojawią się tutaj nasze projekty
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/realizacje/${project.slug}`}
                    className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Truck className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <Badge variant="outline" className="mb-2">
                        {project.category?.name || 'Realizacja'}
                      </Badge>
                      <h2 className="text-lg font-semibold group-hover:text-primary">
                        {project.title}
                      </h2>
                      {project.vehicleBrand && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {project.vehicleBrand}
                          {project.vehicleModel && ` ${project.vehicleModel}`}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  )
}
