import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/header'

export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Eye, Star, Truck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DeleteProjectButton } from './delete-button'

async function getProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
}

export default async function RealizacjePage() {
  const projects = await getProjects()

  return (
    <>
      <AdminHeader
        title="Realizacje"
        description="Zarządzaj projektami i realizacjami"
        action={
          <Button asChild>
            <Link href="/admin/realizacje/nowa">
              <Plus className="mr-2 h-4 w-4" />
              Nowa realizacja
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Lista realizacji
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Brak realizacji</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dodaj pierwszą realizację, aby wyświetlić ją na stronie
                </p>
                <Button asChild className="mt-4">
                  <Link href="/admin/realizacje/nowa">
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj realizację
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Tytuł</TableHead>
                    <TableHead>Kategoria</TableHead>
                    <TableHead>Pojazd</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {project.thumbnail ? (
                            <img
                              src={project.thumbnail}
                              alt=""
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <Truck className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{project.title}</span>
                          {project.featured && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          /{project.slug}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.category?.name || 'Brak kategorii'}</Badge>
                      </TableCell>
                      <TableCell>
                        {project.vehicleBrand && (
                          <span>
                            {project.vehicleBrand}
                            {project.vehicleModel && ` ${project.vehicleModel}`}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={project.published ? 'success' : 'secondary'}
                        >
                          {project.published ? 'Opublikowane' : 'Szkic'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(project.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={`/realizacje/${project.slug}`}
                              target="_blank"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/realizacje/${project.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteProjectButton
                            id={project.id}
                            title={project.title}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
