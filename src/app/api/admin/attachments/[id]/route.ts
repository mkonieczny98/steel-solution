import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getServerSession(authOptions)) return new Response(null, { status: 401 })
  const file = await prisma.contactAttachment.findUnique({ where: { id: (await params).id } })
  if (!file) return new Response(null, { status: 404 })
  return new Response(new Uint8Array(file.data), { headers: {
    'Content-Type': file.mimeType, 'Content-Length': String(file.size),
    'Content-Disposition': `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g, '%27')}`,
    'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "sandbox; default-src 'none'",
  } })
}
