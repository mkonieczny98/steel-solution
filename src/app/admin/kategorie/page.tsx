import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminHeader } from '@/components/admin/header'
import { Plus, Package, Edit, Eye, EyeOff } from 'lucide-react'

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { projects: true }
      }
    }
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  }

  return (
    <>
      <AdminHeader 
        title="Kategorie produktów" 
        description="Zarządzaj kategoriami produktów wyświetlanymi w ofercie"
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {categories.length} kategorii
            </span>
          </div>
          <Button asChild>
            <Link href="/admin/kategorie/nowa">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj kategorię
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Kolor</TableHead>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Realizacje</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kolejność</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Brak kategorii</p>
                        <Button asChild size="sm">
                          <Link href="/admin/kategorie/nowa">
                            Dodaj pierwszą kategorię
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className={`h-6 w-6 rounded ${colorMap[category.color] || 'bg-gray-500'}`} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-sm">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {category._count.projects} realizacji
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {category.published ? (
                          <Badge className="bg-green-100 text-green-700">
                            <Eye className="mr-1 h-3 w-3" />
                            Widoczna
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="mr-1 h-3 w-3" />
                            Ukryta
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{category.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/kategorie/${category.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
