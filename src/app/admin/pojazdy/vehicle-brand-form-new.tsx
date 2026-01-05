'use client'

import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
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
  Package,
  Phone,
  Image as ImageIcon
} from 'lucide-react'
import { slugify } from '@/lib/utils'
import { ImageUpload, GalleryUpload } from '@/components/admin/image-upload'

const vehicleBrandSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  slug: z.string().min(1, 'Slug jest wymagany'),
  fullName: z.string().optional(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  contentDescription: z.string().optional(),
  type: z.string().default('truck'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  sortOrder: z.number().default(0),
  published: z.boolean().default(true),
})

type VehicleBrandFormData = z.infer<typeof vehicleBrandSchema>

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string
}

interface VehicleBrandFormProps {
  initialData?: {
    id: string
    name: string
    slug: string
    fullName: string | null
    description: string | null
    longDescription: string | null
    contentDescription: string | null
    image: string | null
    logo: string | null
    heroImage: string | null
    gallery: string
    type: string
    models: string
    metaTitle: string | null
    metaDescription: string | null
    sortOrder: number
    published: boolean
    categories?: { category: Category }[]
  }
}

export function VehicleBrandFormNew({ initialData }: VehicleBrandFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  
  // Parse JSON fields
  const [models, setModels] = useState<{name: string; years?: string}[]>(
    initialData?.models ? JSON.parse(initialData.models) : []
  )
  
  // Selected category IDs
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categories?.map(c => c.category.id) || []
  )
  
  // Thumbnail, Hero image and gallery
  const [image, setImage] = useState<string>(initialData?.image || '')
  const [heroImage, setHeroImage] = useState<string>(initialData?.heroImage || '')
  const [gallery, setGallery] = useState<string[]>(
    initialData?.gallery ? JSON.parse(initialData.gallery) : []
  )
  
  const [newModelName, setNewModelName] = useState('')
  const [newModelYears, setNewModelYears] = useState('')

  // Fetch all categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/admin/categories')
        if (res.ok) {
          const data = await res.json()
          setAllCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleBrandFormData>({
    resolver: zodResolver(vehicleBrandSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      fullName: initialData?.fullName || '',
      description: initialData?.description || '',
      longDescription: initialData?.longDescription || '',
      contentDescription: initialData?.contentDescription || '',
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

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const onSubmit = async (data: VehicleBrandFormData) => {
    setIsLoading(true)

    try {
      const payload = {
        ...data,
        models: JSON.stringify(models),
        categoryIds: selectedCategoryIds,
        image: image || null,
        heroImage: heroImage || null,
        gallery: JSON.stringify(gallery),
        contentDescription: data.contentDescription || null,
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
                <Label htmlFor="longDescription">Pełny opis (Hero)</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Szczegółowy opis oferty dla tej marki wyświetlany w sekcji Hero..."
                  rows={4}
                  {...register('longDescription')}
                />
                <p className="text-xs text-muted-foreground">
                  Ten opis będzie wyświetlany na górze strony w sekcji Hero
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentDescription">Opis dodatkowy (sekcja środkowa)</Label>
                <Textarea
                  id="contentDescription"
                  placeholder="Dodatkowy opis wyświetlany między produktami a galerią..."
                  rows={6}
                  {...register('contentDescription')}
                />
                <p className="text-xs text-muted-foreground">
                  Ten opis będzie wyświetlany w dedykowanej sekcji między produktami a galerią
                </p>
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

          {/* Hero Image and Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Zdjęcia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Miniatura (zajawka)</Label>
                <p className="text-sm text-muted-foreground">
                  Małe zdjęcie wyświetlane na liście pojazdów i stronie głównej
                </p>
                <ImageUpload
                  value={image}
                  onChange={setImage}
                  placeholder="URL miniatury lub prześlij plik"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Zdjęcie główne (Hero)</Label>
                <p className="text-sm text-muted-foreground">
                  Duże zdjęcie wyświetlane na górze strony marki
                </p>
                <ImageUpload
                  value={heroImage}
                  onChange={setHeroImage}
                  placeholder="URL zdjęcia hero lub prześlij plik"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Galeria zdjęć</Label>
                <p className="text-sm text-muted-foreground">
                  Dodatkowe zdjęcia prezentujące realizacje dla tej marki
                </p>
                <GalleryUpload
                  images={gallery}
                  onChange={setGallery}
                  maxImages={12}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories (Products) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Dostępne produkty
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Wybierz kategorie produktów dostępnych dla tej marki pojazdu
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {allCategories.map((category) => (
                  <label
                    key={category.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      selectedCategoryIds.includes(category.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedCategoryIds.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <div 
                      className="flex h-8 w-8 items-center justify-center rounded text-white"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    >
                      <Package className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </label>
                ))}
              </div>

              {selectedCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <span className="text-sm text-muted-foreground">Wybrano:</span>
                  {allCategories
                    .filter(c => selectedCategoryIds.includes(c.id))
                    .map(category => (
                      <Badge 
                        key={category.id} 
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                        className="text-white"
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className="ml-1 hover:opacity-70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}

              {allCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Brak kategorii produktów. Najpierw dodaj kategorie w zakładce "Kategorie produktów".
                </p>
              )}
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

          {/* Kontakt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Kontakt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">Miłosz Rypiński Steel Solution</p>
              <p className="text-muted-foreground">+48 690 418 119</p>
              <p className="text-muted-foreground">kontakt@steelsolution.pl</p>
              <p className="text-muted-foreground">Leśna 12, 64-020 Betkowo</p>
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
                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge variant="outline">{models.length} modeli</Badge>
                  <Badge variant="outline">{selectedCategoryIds.length} kategorii</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
