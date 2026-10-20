import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/media – zdjęcia wgrane w panelu (do wyboru w bibliotece)
export async function GET() {
  if (!(await getServerSession(authOptions))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
    select: { id: true, url: true, originalName: true, size: true, createdAt: true },
  })
  return NextResponse.json(media, { headers: { 'Cache-Control': 'private, no-store' } })
}
