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
  Package,
  Palette,
  Search,
  Truck,
  Car,
  Phone,
  Image as ImageIcon
} from 'lucide-react'
import { slugify } from '@/lib/utils'
import { ImageUpload, GalleryUpload } from '@/components/admin/image-upload'

const categorySchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  slug: z.string().min(1, 'Slug jest wymagany'),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  contentDescription: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().default('#3b82f6'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  sortOrder: z.number().default(0),
  published: z.boolean().default(true),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface VehicleBrand {
  id: string
  name: string
  slug: string
  type: string
}

interface CategoryFormProps {
  initialData?: {
    id: string
    name: string
    slug: string
    description: string | null
    longDescription: string | null
    contentDescription: string | null
    image: string | null
    icon: string | null
    color: string
    features: string
    benefits: string
    specifications: string
    heroImage: string | null
    gallery: string
    metaTitle: string | null
    metaDescription: string | null
    sortOrder: number
    published: boolean
    vehicleBrands?: { vehicleBrand: VehicleBrand }[]
  }
}

const colorOptions = [
  { value: '#3b82f6', label: 'Niebieski', class: 'bg-blue-500' },
  { value: '#22c55e', label: 'Zielony', class: 'bg-green-500' },
  { value: '#f97316', label: 'Pomarańczowy', class: 'bg-orange-500' },
  { value: '#ef4444', label: 'Czerwony', class: 'bg-red-500' },
  { value: '#8b5cf6', label: 'Fioletowy', class: 'bg-purple-500' },
  { value: '#f59e0b', label: 'Bursztynowy', class: 'bg-amber-500' },
]

const iconOptions = [
  { value: 'LayoutGrid', label: 'Siatka (półki)' },
  { value: 'Box', label: 'Pudełko (boksy)' },
  { value: 'Package', label: 'Paczka' },
  { value: 'Shield', label: 'Tarcza (mocowania)' },
  { value: 'Truck', label: 'Ciężarówka' },
  { value: 'Footprints', label: 'Stopnie' },
]

export function CategoryFormNew({ initialData }: CategoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [allVehicleBrands, setAllVehicleBrands] = useState<VehicleBrand[]>([])
  
  // Parse JSON fields
  const [features, setFeatures] = useState<string[]>(
    initialData?.features ? JSON.parse(initialData.features) : []
  )
  const [benefits, setBenefits] = useState<string[]>(
    initialData?.benefits ? JSON.parse(initialData.benefits) : []
  )
  const [specifications, setSpecifications] = useState<{label: string; value: string}[]>(
    initialData?.specifications ? JSON.parse(initialData.specifications) : []
  )
  
  // Selected vehicle brand IDs
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(
    initialData?.vehicleBrands?.map(vb => vb.vehicleBrand.id) || []
  )
  
  // Thumbnail, Hero image and gallery
  const [image, setImage] = useState<string>(initialData?.image || '')
  const [heroImage, setHeroImage] = useState<string>(initialData?.heroImage || '')
  const [gallery, setGallery] = useState<string[]>(
    initialData?.gallery ? JSON.parse(initialData.gallery) : []
  )
  
  const [newFeature, setNewFeature] = useState('')
  const [newBenefit, setNewBenefit] = useState('')
  const [newSpecLabel, setNewSpecLabel] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')

  // Fetch all vehicle brands
  useEffect(() => {
    async function fetchVehicleBrands() {
      try {
        const res = await fetch('/api/admin/vehicle-brands')
        if (res.ok) {
          const data = await res.json()
          setAllVehicleBrands(data)
        }
      } catch (error) {
        console.error('Error fetching vehicle brands:', error)
      }
    }
    fetchVehicleBrands()
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      longDescription: initialData?.longDescription || '',
      contentDescription: initialData?.contentDescription || '',
      icon: initialData?.icon || '',
      color: initialData?.color || '#3b82f6',
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
      sortOrder: initialData?.sortOrder || 0,
      published: initialData?.published ?? true,
    },
  })

  const watchName = watch('name')
  const watchColor = watch('color')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    if (!initialData) {
      setValue('slug', slugify(name))
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()])
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index))
  }

  const addSpecification = () => {
    if (newSpecLabel.trim() && newSpecValue.trim()) {
      setSpecifications([...specifications, { label: newSpecLabel.trim(), value: newSpecValue.trim() }])
      setNewSpecLabel('')
      setNewSpecValue('')
    }
  }

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const toggleVehicleBrand = (brandId: string) => {
    setSelectedVehicleIds(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true)

    try {
      const payload = {
        ...data,
        features: JSON.stringify(features),
        benefits: JSON.stringify(benefits),
        specifications: JSON.stringify(specifications),
        vehicleBrandIds: selectedVehicleIds,
        image: image || null,
        heroImage: heroImage || null,
        gallery: JSON.stringify(gallery),
        contentDescription: data.contentDescription || null,
      }

      const url = initialData 
        ? `/api/admin/categories/${initialData.id}`
        : '/api/admin/categories'
      
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
        description: `Kategoria "${data.name}" została ${initialData ? 'zaktualizowana' : 'utworzona'}.`,
      })

      router.push('/admin/kategorie')
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

  const trucks = allVehicleBrands.filter(b => b.type === 'truck')
  const pickups = allVehicleBrands.filter(b => b.type === 'pickup')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/kategorie">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {initialData ? 'Edytuj kategorię' : 'Nowa kategoria produktów'}
          </h1>
          <p className="text-muted-foreground">
            {initialData ? 'Zaktualizuj dane kategorii' : 'Dodaj nową kategorię do oferty'}
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
                <Package className="h-5 w-5" />
                Informacje podstawowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa kategorii *</Label>
                  <Input
                    id="name"
                    placeholder="np. Półki do kabin"
                    {...register('name')}
                    onChange={handleNameChange}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug URL *</Label>
                  <Input
                    id="slug"
                    placeholder="polki-do-kabin"
                    {...register('slug')}
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ikona</Label>
                  <Select
                    value={watch('icon') || ''}
                    onValueChange={(value) => setValue('icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz ikonę" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Kolor</Label>
                  <Select
                    value={watchColor}
                    onValueChange={(value) => setValue('color', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded ${color.class}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Krótki opis</Label>
                <Textarea
                  id="description"
                  placeholder="Krótki opis kategorii (1-2 zdania)"
                  rows={2}
                  {...register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Pełny opis (Hero)</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Szczegółowy opis kategorii wyświetlany w sekcji Hero..."
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
                  placeholder="Dodatkowy opis wyświetlany między pojazdami a galerią..."
                  rows={6}
                  {...register('contentDescription')}
                />
                <p className="text-xs text-muted-foreground">
                  Ten opis będzie wyświetlany w dedykowanej sekcji między pojazdami a galerią
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Cechy produktów</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="np. Montaż bez ingerencji w strukturę kabiny"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj
                </Button>
              </div>
              
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {features.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Brak cech. Dodaj cechy charakterystyczne dla tej kategorii.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Korzyści</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="np. Szybki dostęp do sprzętu"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj
                </Button>
              </div>
              
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span>{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {benefits.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Brak korzyści. Dodaj korzyści dla klienta.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specyfikacja techniczna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  placeholder="Parametr (np. Materiał)"
                  value={newSpecLabel}
                  onChange={(e) => setNewSpecLabel(e.target.value)}
                />
                <Input
                  placeholder="Wartość (np. Aluminium)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                />
                <Button type="button" onClick={addSpecification}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj
                </Button>
              </div>
              
              <div className="space-y-2">
                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <span className="font-medium">{spec.label}:</span>{' '}
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {specifications.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Brak specyfikacji. Dodaj parametry techniczne.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail, Hero Image and Gallery */}
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
                  Małe zdjęcie wyświetlane na liście kategorii i stronie głównej
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
                  Duże zdjęcie wyświetlane na górze strony kategorii
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
                  Dodatkowe zdjęcia prezentujące produkty z tej kategorii
                </p>
                <GalleryUpload
                  value={gallery}
                  onChange={setGallery}
                  maxImages={12}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Brands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Powiązane pojazdy
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Wybierz marki pojazdów, dla których dostępna jest ta kategoria produktów
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trucks */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <Truck className="h-4 w-4" />
                  Pojazdy ciężarowe ({trucks.filter(t => selectedVehicleIds.includes(t.id)).length}/{trucks.length})
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {trucks.map((brand) => (
                    <label
                      key={brand.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                        selectedVehicleIds.includes(brand.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedVehicleIds.includes(brand.id)}
                        onCheckedChange={() => toggleVehicleBrand(brand.id)}
                      />
                      <span className="font-medium">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pickups */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <Car className="h-4 w-4" />
                  Pickupy ({pickups.filter(p => selectedVehicleIds.includes(p.id)).length}/{pickups.length})
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {pickups.map((brand) => (
                    <label
                      key={brand.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                        selectedVehicleIds.includes(brand.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedVehicleIds.includes(brand.id)}
                        onCheckedChange={() => toggleVehicleBrand(brand.id)}
                      />
                      <span className="font-medium">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedVehicleIds.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <span className="text-sm text-muted-foreground">Wybrano:</span>
                  {allVehicleBrands
                    .filter(b => selectedVehicleIds.includes(b.id))
                    .map(brand => (
                      <Badge key={brand.id} variant="secondary">
                        {brand.name}
                        <button
                          type="button"
                          onClick={() => toggleVehicleBrand(brand.id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
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
                {initialData ? 'Zapisz zmiany' : 'Utwórz kategorię'}
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
                <div 
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: watchColor }}
                >
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{watchName || 'Nazwa kategorii'}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {watch('description') || 'Opis kategorii...'}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge variant="outline">{features.length} cech</Badge>
                  <Badge variant="outline">{benefits.length} korzyści</Badge>
                  <Badge variant="outline">{selectedVehicleIds.length} pojazdów</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
