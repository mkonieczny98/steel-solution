import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, Truck, Car, Edit, Eye, EyeOff } from 'lucide-react'

async function getVehicleBrands() {
  return prisma.vehicleBrand.findMany({
    orderBy: [
      { type: 'asc' },
      { sortOrder: 'asc' },
    ],
  })
}

export default async function VehicleBrandsPage() {
  const brands = await getVehicleBrands()
  const trucks = brands.filter(b => b.type === 'truck')
  const pickups = brands.filter(b => b.type === 'pickup')

  return (
    <>
      <AdminHeader 
        title="Marki pojazdów" 
        description="Zarządzaj markami pojazdów wyświetlanymi w ofercie"
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {trucks.length} ciężarowych
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {pickups.length} pickupów
              </span>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/pojazdy/nowy">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj markę
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marka</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Modele</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kolejność</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Truck className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Brak marek pojazdów</p>
                        <Button asChild size="sm">
                          <Link href="/admin/pojazdy/nowy">
                            Dodaj pierwszą markę
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((brand) => {
                    const models = brand.models ? JSON.parse(brand.models) : []
                    return (
                      <TableRow key={brand.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{brand.name}</p>
                            {brand.fullName && brand.fullName !== brand.name && (
                              <p className="text-sm text-muted-foreground">
                                {brand.fullName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {brand.type === 'truck' ? (
                            <Badge variant="secondary">
                              <Truck className="mr-1 h-3 w-3" />
                              Ciężarowy
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700">
                              <Car className="mr-1 h-3 w-3" />
                              Pickup
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-1 text-sm">
                            {brand.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {models.length} modeli
                          </span>
                        </TableCell>
                        <TableCell>
                          {brand.published ? (
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
                        <TableCell>{brand.sortOrder}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/pojazdy/${brand.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
