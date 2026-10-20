import sharp from 'sharp'
import { RequestError } from '@/lib/request-limits'
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS_BYTES } from '@/lib/contact'

export async function prepareAttachments(files: File[]) {
  if (files.length > MAX_ATTACHMENTS) throw new RequestError('Możesz dodać maksymalnie 3 pliki.')
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_ATTACHMENTS_BYTES) throw new RequestError('Łączny rozmiar plików nie może przekraczać 10 MB.', 413)
  const result: { name: string; mimeType: string; size: number; data: Buffer }[] = []
  for (const file of files) {
    if (!file.size || file.size > MAX_ATTACHMENT_BYTES) throw new RequestError('Każdy plik musi mieć od 1 bajta do 5 MB.')
    const name = file.name.split(/[\\/]/).pop()!.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 140) || 'zalacznik'
    const original = Buffer.from(await file.arrayBuffer())
    if (file.type === 'application/pdf' && original.subarray(0, 5).toString() === '%PDF-') {
      result.push({ name: name.replace(/\.[^.]*$/, '') + '.pdf', mimeType: 'application/pdf', size: original.length, data: original })
      continue
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new RequestError('Dozwolone pliki: JPG, PNG, WebP i PDF.')
    try {
      const image = sharp(original, { limitInputPixels: 40_000_000 })
      const metadata = await image.metadata()
      if (!['jpeg', 'png', 'webp'].includes(metadata.format || '')) throw new Error('format')
      const data = await image.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()
      result.push({ name: name.replace(/\.[^.]*$/, '') + '.jpg', mimeType: 'image/jpeg', size: data.length, data })
    } catch { throw new RequestError(`Nie można odczytać zdjęcia „${name}”. Wybierz poprawny JPG, PNG lub WebP.`) }
  }
  return result
}
