import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

// PATCH /api/admin/messages/[id] – oznacz jako przeczytaną / nieprzeczytaną
export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const parsed = z.object({
      read: z.boolean().optional(),
      status: z.enum(['new', 'contact', 'offer', 'won', 'closed']).optional(),
      notes: z.string().max(5000).optional(),
      followUpAt: z.string().datetime().nullable().optional(),
    }).strict().safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Nieprawidłowe dane.' }, { status: 400 })
    const body = parsed.data
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { ...body, followUpAt: body.followUpAt === undefined ? undefined : body.followUpAt === null ? null : new Date(body.followUpAt) },
    })
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

// DELETE /api/admin/messages/[id]
export async function DELETE(request: NextRequest, { params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.contactMessage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
