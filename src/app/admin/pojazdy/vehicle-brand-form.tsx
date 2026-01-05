'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  X, 
  Truck,
  Car,
  Search,
  Package
} from 'lucide-react'
import { slugify } from '@/lib/utils'

const vehicleBrandSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  slug: z.string().min(1, 'Slug jest wymagany'),
  fullName: z.string().optional(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  type: z.string().default('truck'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  sortOrder: z.number().default(0),
  published: z.boolean().default(true),
})

type VehicleBrandForm = z.infer<typeof vehicleBrandSchema>

interface VehicleBrandFormProps {
  initialData?: {
    id: string
    name: string
    slug: string
    fullName: string | null
    description: string | null
    longDescription: string | null
    image: string | null
    logo: string | null
    type: string
    models: string
    products: string
    metaTitle: string | null
    metaDescription: string | null
    sortOrder: number
    published: boolean
  }
}

export function VehicleBrandFormComponent({ initialData }: VehicleBrandFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Parse JSON fields
  const [models, setModels] = useState<{name: string; years?: string}[]>(
    initialData?.models ? JSON.parse(initialData.models) : []
  )
  const [products, setProducts] = useState<{name: string; description: string}[]>(
    initialData?.products ? JSON.parse(initialData.products) : []
  )
  
  const [newModelName, setNewModelName] = useState('')
  const [newModelYears, setNewModelYears] = useState('')
  const [newProductName, setNewProductName] = useState('')
  const [newProductDesc, setNewProductDesc] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleBrandForm>({
    resolver: zodResolver(vehicleBrandSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      fullName: initialData?.fullName || '',
      description: initialData?.description || '',
      longDescription: initialData?.longDescription || '',
      type: initialData?.type || 'truck',
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
      sortOrder: initialData?.sortOrder || 0,
      published: initialData?.published ?? true,
    },
  })

  const watchName = watch('name')
  const watchType = watch('type')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    if (!initialData) {
      setValue('slug', slugify(name))
    }
  }

  const addModel = () => {
    if (newModelName.trim()) {
      setModels([...models, { name: newModelName.trim(), years: newModelYears.trim() || undefined }])
      setNewModelName('')
      setNewModelYears('')
    }
  }

  const removeModel = (index: number) => {
    setModels(models.filter((_, i) => i !== index))
  }

  const addProduct = () => {
    if (newProductName.trim()) {
      setProducts([...products, { name: newProductName.trim(), description: newProductDesc.trim() }])
      setNewProductName('')
      setNewProductDesc('')
    }
  }

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: VehicleBrandForm) => {
    setIsLoading(true)

    try {
      const payload = {
        ...data,
        models: JSON.stringify(models),
        products: JSON.stringify(products),
      }

      const url = initialData 
        ? `/api/admin/vehicle-brands/${initialData.id}`
        : '/api/admin/vehicle-brands'
      
      const response = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Wystąpił błąd')
      }

      toast({
        title: initialData ? 'Zaktualizowano' : 'Utworzono',
        description: `Marka "${data.name}" została ${initialData ? 'zaktualizowana' : 'utworzona'}.`,
      })

      router.push('/admin/pojazdy')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/pojazdy">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {initialData ? 'Edytuj markę' : 'Nowa marka pojazdu'}
          </h1>
          <p className="text-muted-foreground">
            {initialData ? 'Zaktualizuj dane marki pojazdu' : 'Dodaj nową markę pojazdu do oferty'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Informacje podstawowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa marki *</Label>
                  <Input
                    id="name"
                    placeholder="np. MAN"
                    {...register('name')}
                    onChange={handleNameChange}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Pełna nazwa</Label>
                  <Input
                    id="fullName"
                    placeholder="np. MAN Truck & Bus"
                    {...register('fullName')}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug URL *</Label>
                  <Input
                    id="slug"
                    placeholder="man"
                    {...register('slug')}
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Typ pojazdu</Label>
                  <Select
                    value={watchType}
                    onValueChange={(value) => setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="truck">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Pojazd ciężarowy
                        </div>
                      </SelectItem>
                      <SelectItem value="pickup">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Pickup
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Krótki opis</Label>
                <Textarea
                  id="description"
                  placeholder="np. Zabudowy do pojazdów MAN TGM, TGL, TGS"
                  rows={2}
                  {...register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Pełny opis</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Szczegółowy opis oferty dla tej marki..."
                  rows={4}
                  {...register('longDescription')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Models */}
          <Card>
            <CardHeader>
              <CardTitle>Obsługiwane modele</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  placeholder="Model (np. TGM)"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="sm:col-span-1"
                />
                <Input
                  placeholder="Lata (np. 2007-2024)"
                  value={newModelYears}
                  onChange={(e) => setNewModelYears(e.target.value)}
                  className="sm:col-span-1"
                />
                <Button type="button" onClick={addModel}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj model
                </Button>
              </div>
              
              <div className="space-y-2">
                {models.map((model, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{model.name}</Badge>
                      {model.years && (
                        <span className="text-sm text-muted-foreground">{model.years}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeModel(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {models.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Brak modeli. Dodaj modele obsługiwane przez tę markę.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produkty dla tej marki
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  placeholder="Nazwa produktu"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
                <Input
                  placeholder="Krótki opis produktu"
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                />
                <Button type="button" onClick={addProduct}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj produkt
                </Button>
              </div>
              
              <div className="space-y-2">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Brak produktów. Dodaj produkty oferowane dla tej marki.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Publikacja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Widoczna na stronie</Label>
                <Switch
                  id="published"
                  checked={watch('published')}
                  onCheckedChange={(checked) => setValue('published', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Kolejność</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...register('sortOrder', { valueAsNumber: true })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Zapisz zmiany' : 'Utwórz markę'}
              </Button>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta tytuł</Label>
                <Input
                  id="metaTitle"
                  placeholder="Tytuł w wynikach wyszukiwania"
                  {...register('metaTitle')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta opis</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="Opis w wynikach wyszukiwania"
                  rows={3}
                  {...register('metaDescription')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Podgląd</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  {watchType === 'truck' ? (
                    <Truck className="h-5 w-5 text-primary" />
                  ) : (
                    <Car className="h-5 w-5 text-amber-500" />
                  )}
                  <Badge variant={watchType === 'truck' ? 'secondary' : 'outline'}>
                    {watchType === 'truck' ? 'Ciężarowy' : 'Pickup'}
                  </Badge>
                </div>
                <h3 className="font-semibold">{watchName || 'Nazwa marki'}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {watch('description') || 'Opis marki...'}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {models.length} modeli • {products.length} produktów
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
