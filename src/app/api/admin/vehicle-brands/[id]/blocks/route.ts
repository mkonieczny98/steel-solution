import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CONTENT_TAG } from '@/lib/data'
import { blockTypesFor, sanitizeBlocks } from '@/lib/blocks'

interface Props {
  params: Promise<{ id: string }>
}

// PUT – zapis układu sekcji strony ({ blocks }); { blocks: null } przywraca układ domyślny
export async function PUT(request: NextRequest, { params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { blocks?: unknown }
    const allowed = blockTypesFor('brand')
    const blocks = body.blocks === null ? null : sanitizeBlocks(body.blocks).filter((b) => allowed.includes(b.type))
    await prisma.vehicleBrand.update({
      where: { id },
      data: { blocks: blocks && blocks.length > 0 ? JSON.stringify(blocks) : null },
    })
    revalidateTag(CONTENT_TAG)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving layout:', error)
    return NextResponse.json({ error: 'Nie udało się zapisać układu strony' }, { status: 500 })
  }
}
