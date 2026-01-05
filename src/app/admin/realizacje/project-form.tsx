'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { slugify } from '@/lib/utils'

const projectSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  slug: z.string().min(1, 'Slug jest wymagany'),
  description: z.string().min(1, 'Opis jest wymagany'),
  categoryId: z.string().min(1, 'Wybierz kategorię'),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
})

type ProjectForm = z.infer<typeof projectSchema>

interface Category {
  id: string
  name: string
  slug: string
}

interface ProjectFormProps {
  categories: Category[]
  initialData?: {
    id: string
    title: string
    slug: string
    description: string | null
    categoryId: string
    vehicleBrand: string | null
    vehicleModel: string | null
    images: string[]
    thumbnail: string | null
    metaTitle: string | null
    metaDescription: string | null
    featured: boolean
    published: boolean
  }
}

const vehicleBrands = [
  'MAN',
  'Mercedes-Benz',
  'Volvo',
  'Scania',
  'Renault',
  'Starman',
  'Toyota',
  'Nissan',
  'SsangYong',
  'Ford',
  'Iveco',
  'Inne',
]

export function ProjectForm({ categories, initialData }: ProjectFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [thumbnail, setThumbnail] = useState<string | null>(initialData?.thumbnail || null)

  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      categoryId: initialData?.categoryId || '',
      vehicleBrand: initialData?.vehicleBrand || '',
      vehicleModel: initialData?.vehicleModel || '',
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
      featured: initialData?.featured || false,
      published: initialData?.published || false,
    },
  })

  const title = watch('title')
  const featured = watch('featured')
  const published = watch('published')

  const generateSlug = () => {
    if (title) {
      setValue('slug', slugify(title))
    }
  }

  const onSubmit = async (data: ProjectForm) => {
    setIsLoading(true)

    try {
      const url = isEditing
        ? `/api/admin/projects/${initialData.id}`
        : '/api/admin/projects'

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images,
          thumbnail,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Wystąpił błąd')
      }

      toast({
        title: isEditing ? 'Zaktualizowano' : 'Utworzono',
        description: isEditing
          ? 'Realizacja została zaktualizowana'
          : 'Nowa realizacja została utworzona',
      })

      router.push('/admin/realizacje')
      router.refresh()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.message || 'Nie udało się zapisać realizacji',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
              <CardDescription>
                Wypełnij podstawowe dane realizacji
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tytuł *</Label>
                <Input
                  id="title"
                  placeholder="np. Zabudowa MAN TGM dla OSP Kraków"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    placeholder="zabudowa-man-tgm-osp-krakow"
                    {...register('slug')}
                  />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Generuj
                  </Button>
                </div>
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis *</Label>
                <Textarea
                  id="description"
                  placeholder="Opisz szczegóły realizacji..."
                  rows={6}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Kategoria *</Label>
                  <Select
                    value={watch('categoryId')}
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-destructive">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleBrand">Marka pojazdu</Label>
                  <Select
                    value={watch('vehicleBrand') || ''}
                    onValueChange={(value) => setValue('vehicleBrand', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz markę" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Model pojazdu</Label>
                <Input
                  id="vehicleModel"
                  placeholder="np. TGM, Actros, FH16"
                  {...register('vehicleModel')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zdjęcia</CardTitle>
              <CardDescription>
                Dodaj zdjęcia realizacji (miniatura i galeria)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Miniatura</Label>
                <div className="flex items-center gap-4">
                  {thumbnail ? (
                    <div className="relative">
                      <img
                        src={thumbnail}
                        alt="Miniatura"
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6"
                        onClick={() => setThumbnail(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <Input
                    type="url"
                    placeholder="URL miniatury"
                    value={thumbnail || ''}
                    onChange={(e) => setThumbnail(e.target.value || null)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Galeria zdjęć</Label>
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Zdjęcie ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6"
                        onClick={() =>
                          setImages(images.filter((_, i) => i !== index))
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Dodaj URL zdjęcia"
                    id="newImage"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('newImage') as HTMLInputElement
                      if (input.value) {
                        setImages([...images, input.value])
                        input.value = ''
                      }
                    }}
                  >
                    Dodaj
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                Optymalizacja pod wyszukiwarki
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta tytuł</Label>
                <Input
                  id="metaTitle"
                  placeholder="Tytuł strony w wynikach wyszukiwania"
                  {...register('metaTitle')}
                />
                <p className="text-xs text-muted-foreground">
                  Pozostaw puste, aby użyć tytułu realizacji
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta opis</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="Opis strony w wynikach wyszukiwania"
                  rows={3}
                  {...register('metaDescription')}
                />
                <p className="text-xs text-muted-foreground">
                  Pozostaw puste, aby użyć opisu realizacji
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publikacja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Opublikowane</Label>
                  <p className="text-xs text-muted-foreground">
                    Widoczne na stronie
                  </p>
                </div>
                <Switch
                  checked={published}
                  onCheckedChange={(checked) => setValue('published', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Wyróżnione</Label>
                  <p className="text-xs text-muted-foreground">
                    Pokaż na stronie głównej
                  </p>
                </div>
                <Switch
                  checked={featured}
                  onCheckedChange={(checked) => setValue('featured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : isEditing ? (
                'Zapisz zmiany'
              ) : (
                'Utwórz realizację'
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/realizacje">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anuluj
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
