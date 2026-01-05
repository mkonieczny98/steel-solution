'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
}

export function ImageUpload({ value, onChange, label = 'Zdjęcie', placeholder = 'Wklej URL zdjęcia lub prześlij plik' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        onChange(data.url)
        setInputValue(data.url)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setInputValue(url)
    onChange(url)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button type="button" variant="outline" disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        </div>
        {inputValue && (
          <Button type="button" variant="outline" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {inputValue && (
        <div className="mt-2 relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
          <img
            src={inputValue}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}

interface GalleryUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  label?: string
  maxImages?: number
}

export function GalleryUpload({ value = [], onChange, label = 'Galeria', maxImages = 20 }: GalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [newUrl, setNewUrl] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    
    try {
      const uploadedUrls: string[] = []
      
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.url)
        }
      }
      
      onChange([...value, ...uploadedUrls].slice(0, maxImages))
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddUrl = () => {
    if (newUrl && value.length < maxImages) {
      onChange([...value, newUrl])
      setNewUrl('')
    }
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= value.length) return
    
    const newValue = [...value]
    ;[newValue[index], newValue[newIndex]] = [newValue[newIndex], newValue[index]]
    onChange(newValue)
  }

  return (
    <div className="space-y-4">
      <Label>{label} ({value.length}/{maxImages})</Label>
      
      {/* Add new image */}
      <div className="flex gap-2">
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Wklej URL zdjęcia"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
        />
        <Button type="button" variant="outline" onClick={handleAddUrl} disabled={!newUrl || value.length >= maxImages}>
          Dodaj
        </Button>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading || value.length >= maxImages}
          />
          <Button type="button" variant="outline" disabled={isUploading || value.length >= maxImages}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Gallery grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <Card key={index} className="overflow-hidden group relative">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {index > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMove(index, 'up')}
                      >
                        ←
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {index < value.length - 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMove(index, 'down')}
                      >
                        →
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-2 text-xs text-muted-foreground truncate">
                  {index + 1}. {url.split('/').pop()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Brak zdjęć w galerii</p>
          <p className="text-sm">Dodaj zdjęcia przez URL lub prześlij pliki</p>
        </div>
      )}
    </div>
  )
}
