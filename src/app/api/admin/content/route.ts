import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CONTENT_TAG } from '@/lib/data'
import { settingKey } from '@/lib/content'
import { contentDocs, isContentKey, sanitizeContent } from '@/lib/content-schema'

// PUT /api/admin/content – zapisuje treści jednej strony ({ key, values })
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { key?: unknown; values?: unknown }
    const docKey = body?.key
    if (!isContentKey(docKey)) {
      return NextResponse.json({ error: 'Nieznany rodzaj treści' }, { status: 400 })
    }

    const values = sanitizeContent(contentDocs[docKey], body.values)
    const key = settingKey(docKey)
    await prisma.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(values) },
      create: { key, value: JSON.stringify(values) },
    })
    revalidateTag(CONTENT_TAG)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving content:', error)
    return NextResponse.json({ error: 'Nie udało się zapisać treści' }, { status: 500 })
  }
}

// DELETE /api/admin/content?key=home – przywraca treści domyślne
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = request.nextUrl.searchParams.get('key')
  if (!isContentKey(key)) {
    return NextResponse.json({ error: 'Nieznany rodzaj treści' }, { status: 400 })
  }

  await prisma.setting.deleteMany({ where: { key: settingKey(key) } })
  revalidateTag(CONTENT_TAG)
  return NextResponse.json({ success: true })
}
