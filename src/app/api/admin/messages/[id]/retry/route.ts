import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { notifyContact } from '@/lib/contact-notifications'
import { prisma } from '@/lib/prisma'
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getServerSession(authOptions)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } })) return NextResponse.json({ error: 'Nie znaleziono zapytania.' }, { status: 404 })
  await notifyContact(id)
  const message = await prisma.contactMessage.findUniqueOrThrow({ where: { id }, select: { notificationStatus: true } })
  return NextResponse.json(message)
}
