'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
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
  Package,
  Palette,
  FileText,
  Settings,
  Search
} from 'lucide-react'
import { slugify } from '@/lib/utils'

const categorySchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  slug: z.string().min(1, 'Slug jest wymagany'),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().default('blue'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  sortOrder: z.number().default(0),
  published: z.boolean().default(true),
})

type CategoryForm = z.infer<typeof categorySchema>

interface CategoryFormProps {
  initialData?: {
    id: string
    name: string
    slug: string
    description: string | null
    longDescription: string | null
    image: string | null
    icon: string | null
    color: string
    features: string
    benefits: string
    specifications: string
    vehicles: string
    metaTitle: string | null
    metaDescription: string | null
    sortOrder: number
    published: boolean
  }
}

const colorOptions = [
  { value: 'blue', label: 'Niebieski', class: 'bg-blue-500' },
  { value: 'green', label: 'Zielony', class: 'bg-green-500' },
  { value: 'orange', label: 'Pomarańczowy', class: 'bg-orange-500' },
  { value: 'red', label: 'Czerwony', class: 'bg-red-500' },
  { value: 'purple', label: 'Fioletowy', class: 'bg-purple-500' },
  { value: 'amber', label: 'Bursztynowy', class: 'bg-amber-500' },
]

const iconOptions = [
  { value: 'LayoutGrid', label: 'Siatka (półki)' },
  { value: 'Box', label: 'Pudełko (boksy)' },
  { value: 'Package', label: 'Paczka' },
  { value: 'Shield', label: 'Tarcza (mocowania)' },
  { value: 'Truck', label: 'Ciężarówka' },
  { value: 'Wrench', label: 'Klucz' },
]

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
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
  const [vehicles, setVehicles] = useState<string[]>(
    initialData?.vehicles ? JSON.parse(initialData.vehicles) : []
  )
  
  const [newFeature, setNewFeature] = useState('')
  const [newBenefit, setNewBenefit] = useState('')
  const [newSpecLabel, setNewSpecLabel] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')
  const [newVehicle, setNewVehicle] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      longDescription: initialData?.longDescription || '',
      icon: initialData?.icon || '',
      color: initialData?.color || 'blue',
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

  const addVehicle = () => {
    if (newVehicle.trim()) {
      setVehicles([...vehicles, newVehicle.trim()])
      setNewVehicle('')
    }
  }

  const removeVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: CategoryForm) => {
    setIsLoading(true)

    try {
      const payload = {
        ...data,
        features: JSON.stringify(features),
        benefits: JSON.stringify(benefits),
        specifications: JSON.stringify(specifications),
        vehicles: JSON.stringify(vehicles),
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
            {initialData ? 'Edytuj kategorię' : 'Nowa kategoria'}
          </h1>
          <p className="text-muted-foreground">
            {initialData ? 'Zaktualizuj dane kategorii produktów' : 'Dodaj nową kategorię produktów'}
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

              <div className="space-y-2">
                <Label htmlFor="description">Krótki opis</Label>
                <Textarea
                  id="description"
                  placeholder="Krótki opis kategorii wyświetlany na liście"
                  rows={2}
                  {...register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Pełny opis</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Szczegółowy opis kategorii wyświetlany na stronie kategorii"
                  rows={4}
                  {...register('longDescription')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Cechy produktów (Co oferujemy)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="np. Półki górne na całą szerokość kabiny"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 py-1.5">
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {features.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Brak cech. Dodaj cechy produktów w tej kategorii.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Korzyści (Benefits)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="np. Optymalne wykorzystanie przestrzeni kabiny"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {benefits.map((benefit, index) => (
                  <Badge key={index} variant="outline" className="gap-1 py-1.5">
                    {benefit}
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Specyfikacja techniczna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Parametr (np. Materiał)"
                  value={newSpecLabel}
                  onChange={(e) => setNewSpecLabel(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Wartość (np. Aluminium 2mm)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addSpecification}>
                  <Plus className="h-4 w-4" />
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
              </div>
            </CardContent>
          </Card>

          {/* Compatible vehicles */}
          <Card>
            <CardHeader>
              <CardTitle>Kompatybilne pojazdy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="np. MAN TGM/TGL/TGS"
                  value={newVehicle}
                  onChange={(e) => setNewVehicle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVehicle())}
                />
                <Button type="button" onClick={addVehicle}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {vehicles.map((vehicle, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 py-1.5">
                    {vehicle}
                    <button
                      type="button"
                      onClick={() => removeVehicle(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
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
                {initialData ? 'Zapisz zmiany' : 'Utwórz kategorię'}
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
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Podgląd
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${colorOptions.find(c => c.value === watchColor)?.class || 'bg-blue-500'} text-white`}>
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{watchName || 'Nazwa kategorii'}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {watch('description') || 'Opis kategorii...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
