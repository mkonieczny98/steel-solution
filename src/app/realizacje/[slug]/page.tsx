import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ChevronRight, Phone, Mail, Truck } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  params: { slug: string }
}

async function getProject(slug: string) {
  return prisma.project.findUnique({
    where: { slug, published: true },
    include: { category: true },
  })
}

async function getRelatedProjects(categoryId: string, currentId: string) {
  return prisma.project.findMany({
    where: {
      categoryId,
      published: true,
      NOT: { id: currentId },
    },
    take: 3,
    include: { category: true },
  })
}

export async function generateMetadata({ params }: Props) {
  const project = await getProject(params.slug)
  
  if (!project) return {}
  
  return {
    title: project.metaTitle || project.title,
    description: project.metaDescription || project.description,
  }
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject(params.slug)

  if (!project) {
    notFound()
  }

  const relatedProjects = await getRelatedProjects(project.categoryId || '', project.id)
  
  // Parse images from JSON string
  const images: string[] = project.images ? JSON.parse(project.images) : []

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen">
        {/* Breadcrumbs */}
        <div className="border-b bg-muted/30">
          <div className="container flex items-center gap-2 py-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Strona główna
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link
              href="/realizacje"
              className="text-muted-foreground hover:text-foreground"
            >
              Realizacje
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{project.title}</span>
          </div>
        </div>

        {/* Content */}
        <article className="py-12">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Main content */}
              <div className="lg:col-span-2">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                  <Link href="/realizacje">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Wróć do realizacji
                  </Link>
                </Button>

                <Badge variant="outline" className="mb-4">
                  {project.category?.name || 'Realizacja'}
                </Badge>

                <h1 className="text-3xl font-bold md:text-4xl">{project.title}</h1>

                {project.vehicleBrand && (
                  <p className="mt-2 text-lg text-muted-foreground">
                    {project.vehicleBrand}
                    {project.vehicleModel && ` ${project.vehicleModel}`}
                  </p>
                )}

                <p className="mt-2 text-sm text-muted-foreground">
                  Dodano: {formatDate(project.createdAt)}
                </p>

                <Separator className="my-8" />

                {/* Images */}
                {images.length > 0 ? (
                  <div className="grid gap-4">
                    {project.thumbnail && (
                      <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    {images.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-video overflow-hidden rounded-xl bg-muted"
                          >
                            <img
                              src={image}
                              alt={`${project.title} - zdjęcie ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : project.thumbnail ? (
                  <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
                    <Truck className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}

                <Separator className="my-8" />

                {/* Description */}
                <div className="prose prose-zinc max-w-none dark:prose-invert">
                  <p className="text-lg leading-relaxed">{project.description}</p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* CTA */}
                  <div className="rounded-xl border bg-card p-6">
                    <h3 className="font-semibold">
                      Zainteresowany podobną realizacją?
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Skontaktuj się z nami, przygotujemy indywidualną wycenę
                    </p>
                    <div className="mt-4 space-y-2">
                      <Button className="w-full" asChild>
                        <Link href="/kontakt">Zapytaj o wycenę</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="tel:+48123456789">
                          <Phone className="mr-2 h-4 w-4" />
                          Zadzwoń
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Related projects */}
                  {relatedProjects.length > 0 && (
                    <div className="rounded-xl border bg-card p-6">
                      <h3 className="font-semibold">Podobne realizacje</h3>
                      <div className="mt-4 space-y-4">
                        {relatedProjects.map((related) => (
                          <Link
                            key={related.id}
                            href={`/realizacje/${related.slug}`}
                            className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                          >
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {related.thumbnail ? (
                                <img
                                  src={related.thumbnail}
                                  alt={related.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Truck className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium line-clamp-2">
                                {related.title}
                              </p>
                              {related.vehicleBrand && (
                                <p className="text-xs text-muted-foreground">
                                  {related.vehicleBrand}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <PublicFooter />
    </>
  )
}
