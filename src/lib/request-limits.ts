import { createHmac } from 'node:crypto'
import { prisma } from '@/lib/prisma'

// Shared between server processes. Raw IP addresses are never persisted.
export async function rateLimited(request: Request, scope: string, max: number, windowMs: number) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
  const key = createHmac('sha256', process.env.NEXTAUTH_SECRET || 'local-development').update(`${scope}:${ip}`).digest('hex')
  const now = new Date()
  const expires = new Date(now.getTime() + windowMs)
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RequestLimit" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expires})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RequestLimit"."expiresAt" <= ${now} THEN 1 ELSE "RequestLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "RequestLimit"."expiresAt" <= ${now} THEN ${expires} ELSE "RequestLimit"."expiresAt" END
    RETURNING "count"`
  // Bounded retention of temporary, hashed identifiers.
  await prisma.requestLimit.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - 86400000) } } })
  return rows[0].count > max
}

export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

export async function boundedBody(request: Request, maxBytes: number) {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new RequestError('Pliki są za duże. Łączny limit to 10 MB.', 413)
  const reader = request.body?.getReader()
  if (!reader) throw new RequestError('Brak danych formularza.')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > maxBytes) {
        await reader.cancel()
        throw new RequestError('Pliki są za duże. Łączny limit to 10 MB.', 413)
      }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  return Buffer.concat(chunks)
}
