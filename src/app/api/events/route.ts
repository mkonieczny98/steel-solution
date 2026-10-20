import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimited, boundedBody } from '@/lib/request-limits'

const schema = z.object({ event: z.enum(['quote_click', 'phone_click', 'quote_start', 'quote_error']), page: z.enum(['home', 'contact', 'projects', 'offer', 'other']) }).strict()
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin')
    if (origin && origin !== request.nextUrl.origin) return new NextResponse(null, { status: 403 })
    const parsed = schema.safeParse(JSON.parse((await boundedBody(request, 512)).toString()))
    if (!parsed.success) return new NextResponse(null, { status: 400 })
    if (await rateLimited(request, 'events', 60, 60_000)) return new NextResponse(null, { status: 429 })
    const { event, page } = parsed.data
    const day = new Date().toISOString().slice(0, 10)
    const key = `${day}:${event}:${page}`
    await prisma.conversionCount.upsert({ where: { key }, create: { key, day, event, page }, update: { count: { increment: 1 } } })
    return new NextResponse(null, { status: 204 })
  } catch { return new NextResponse(null, { status: 400 }) }
}
