import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'
import { boundedBody, RequestError } from '@/lib/request-limits'

export async function POST(request: NextRequest) {
  if (!await getServerSession(authOptions)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const bytes = await boundedBody(request, 6 * 1024 * 1024)
    const form = await new Response(new Uint8Array(bytes), { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData()
    const file = form.get('file')
    if (!file || typeof file === 'string' || !file.size || file.size > 5 * 1024 * 1024) throw new RequestError('Wybierz zdjęcie do 5 MB.')
    let buffer: Buffer
    try {
      const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
      if (!['jpeg', 'png', 'webp', 'gif'].includes((await source.metadata()).format || '')) throw new Error('format')
      buffer = await source.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
    } catch { throw new RequestError('Nie można odczytać obrazu. Wybierz JPG, PNG, WebP lub GIF.') }
    const filename = `${createHash('sha256').update(buffer).digest('hex')}.webp`
    const dir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), buffer)
    const url = `/uploads/${filename}`
    const existing = await prisma.media.findFirst({ where: { url }, select: { id: true } })
    if (!existing) await prisma.media.create({ data: { filename, originalName: file.name.slice(0, 200), mimeType: 'image/webp', size: buffer.length, url } })
    return NextResponse.json({ url, filename, size: buffer.length, type: 'image/webp' })
  } catch (error) {
    return NextResponse.json({ message: error instanceof RequestError ? error.message : 'Nie udało się zapisać zdjęcia.' }, { status: error instanceof RequestError ? error.status : 500 })
  }
}
