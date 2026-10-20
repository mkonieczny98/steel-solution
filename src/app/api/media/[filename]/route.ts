import { NextRequest } from 'next/server'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params
  const width = Number(request.nextUrl.searchParams.get('w') || 1280)
  if (!/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.(webp|png|jpg|jpeg|gif)$/i.test(filename) || ![320, 640, 960, 1280, 1920, 2400].includes(width)) return new Response(null, { status: 400 })
  const root = path.join(process.cwd(), 'public', 'uploads')
  const cached = path.join(root, '.variants', `${filename}-${width}.webp`)
  try {
    let bytes: Buffer
    try { bytes = await readFile(cached) } catch {
      const input = await readFile(path.join(root, filename))
      bytes = await sharp(input, { limitInputPixels: 40_000_000 }).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
      await mkdir(path.dirname(cached), { recursive: true })
      await writeFile(cached, bytes)
    }
    return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } })
  } catch { return new Response(null, { status: 404 }) }
}
