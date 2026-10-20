import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())
import assert from 'node:assert/strict'
import { randomUUID, createHmac } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import { encode } from 'next-auth/jwt'
import sharp from 'sharp'
import { unlink, readdir } from 'node:fs/promises'
import path from 'node:path'

const base = process.env.TEST_BASE_URL || 'http://localhost:3010'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Tests only run against localhost.')
const p = new PrismaClient()
const run = randomUUID()
const slug = `test-${run}`
const requestId = randomUUID()
const testIp = '198.51.100.42'
const day = new Date().toISOString().slice(0, 10)
let userId: string | undefined
let pageId: string | undefined
let mediaUrl: string | undefined
let conversionAdded = false
async function main() {
  const user = await p.user.create({ data: { email: `test-${run}@example.invalid`, password: 'no-password-login', role: 'ADMIN' } })
  userId = user.id
  const jwt = await encode({ secret: process.env.NEXTAUTH_SECRET!, token: { id: user.id, sub: user.id, role: 'ADMIN', email: user.email }, maxAge: 900 })
  const auth = { cookie: `next-auth.session-token=${jwt}` }
  const adminPage = await fetch(`${base}/admin/wiadomosci`, { headers: auth })
  assert.match(await adminPage.text(), /Poczta SMTP nie jest skonfigurowana/, 'Start test server with SMTP_HOST empty; never send actual mail in tests.')
  const payload = { name: 'Test automatyczny', email: `test-${run}@example.invalid`, message: 'Test techniczny formularza i załączników.', consent: true, requestId }
  const png = await sharp({ create: { width: 24, height: 24, channels: 3, background: { r: Math.floor(Math.random()*255), g: 91, b: 200 } } }).png().toBuffer()
  const form = new FormData()
  form.set('data', JSON.stringify(payload))
  form.append('attachments', new File([new Uint8Array(png)], 'test.png', { type: 'image/png' }))
  let response = await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'x-forwarded-for': testIp }, body: form })
  assert.equal(response.status, 200, await response.text())
  conversionAdded = true
  const saved = await p.contactMessage.findUniqueOrThrow({ where: { requestId }, include: { attachments: { select: { id: true } } } })
  assert.equal(saved.attachments.length, 1)
  response = await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp }, body: JSON.stringify(payload) })
  assert.equal(response.status, 200)
  assert.equal(await p.contactMessage.count({ where: { requestId } }), 1)
  const attachment = `/api/admin/attachments/${saved.attachments[0].id}`
  assert.equal((await fetch(base + attachment)).status, 401)
  response = await fetch(base + attachment, { headers: auth })
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-disposition')!, /^attachment;/)
  assert.equal(response.headers.get('content-type'), 'image/jpeg')
  response = await fetch(`${base}/api/admin/messages/${saved.id}`, { method: 'PATCH', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'offer', notes: 'Test', followUpAt: '2026-11-01T12:00:00Z' }) })
  assert.equal(response.status, 200)
  assert.equal((await response.json()).status, 'offer')
  response = await fetch(`${base}/api/admin/messages/${saved.id}/retry`, { method: 'POST', headers: auth })
  assert.equal(response.status, 200)
  const notified = await p.contactMessage.findUniqueOrThrow({ where: { id: saved.id } })
  assert.equal(notified.notificationStatus, 'not_configured')
  console.log('PASS: lead + private attachment + idempotent retry + lead status + SMTP status')

  const page = await p.page.create({ data: { title: 'Original', slug, content: '[]', published: true } })
  pageId = page.id
  const api = `${base}/api/admin/pages/${page.id}`
  const save = (body: object) => fetch(api, { method: 'PUT', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  response = await save({ version: page.updatedAt.toISOString(), action: 'draft', title: 'Draft title', blocks: [] })
  assert.equal(response.status, 200, await response.clone().text())
  let updated = await response.json()
  assert.equal(updated.title, 'Original')
  assert.equal(JSON.parse(updated.draft).title, 'Draft title')
  assert.equal((await fetch(`${base}/podglad/${page.id}`)).status, 404)
  assert.match(await (await fetch(`${base}/podglad/${page.id}`, { headers: auth })).text(), /Draft title/)
  assert.equal((await save({ version: page.updatedAt.toISOString(), action: 'publish', title: 'Stale' })).status, 409)
  response = await save({ version: updated.updatedAt, action: 'publish', title: 'Published title', slug: `${slug}-new`, blocks: [] })
  assert.equal(response.status, 200)
  updated = await response.json()
  assert.equal(updated.title, 'Published title')
  assert.equal(updated.draft, null)
  response = await fetch(`${base}/${slug}`, { redirect: 'manual' })
  assert.equal(response.status, 308)
  const revision = await p.pageRevision.findFirstOrThrow({ where: { pageId: page.id } })
  response = await save({ version: updated.updatedAt, action: 'restore', revisionId: revision.id })
  assert.equal(response.status, 200)
  updated = await response.json()
  assert.equal(updated.title, 'Published title')
  assert.equal(JSON.parse(updated.draft).title, 'Original')
  console.log('PASS: draft isolation + private preview + conflict check + publish + revision restore + redirect')

  const upload = new FormData(); upload.append('file', new File([new Uint8Array(png)], `${run}.png`, { type: 'image/png' }))
  assert.equal((await fetch(`${base}/api/upload`, { method: 'POST', body: upload })).status, 401)
  response = await fetch(`${base}/api/upload`, { method: 'POST', headers: auth, body: upload })
  assert.equal(response.status, 200, await response.clone().text())
  mediaUrl = (await response.json()).url
  response = await fetch(`${base}/api/media/${mediaUrl!.split('/').pop()}?w=640`)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'image/webp')
  assert.ok((await sharp(Buffer.from(await response.arrayBuffer())).metadata()).width! <= 640)
  assert.equal((await fetch(`${base}/api/media/fake.webp?w=999999`)).status, 400)
  console.log('PASS: authenticated upload + decoded WebP + responsive variant')

  for (let i = 0; i < 4; i++) response = await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp }, body: '{}' })
  assert.equal(response.status, 429)
  console.log('PASS: persistent request limit')
}
main().finally(async () => {
  await p.contactMessage.deleteMany({ where: { requestId } })
  if (pageId) await p.page.deleteMany({ where: { id: pageId } })
  await p.pageRedirect.deleteMany({ where: { from: { startsWith: slug } } })
  if (userId) await p.user.deleteMany({ where: { id: userId } })
  const key = createHmac('sha256', process.env.NEXTAUTH_SECRET || 'local-development').update(`contact:${testIp}`).digest('hex')
  await p.requestLimit.deleteMany({ where: { key } })
  if (conversionAdded) await p.conversionCount.updateMany({ where: { key: `${day}:quote_success:contact` }, data: { count: { decrement: 1 } } })
  if (mediaUrl) {
    await p.media.deleteMany({ where: { url: mediaUrl } })
    const filename = mediaUrl.split('/').pop()!
    await unlink(path.join('public/uploads', filename)).catch(() => {})
    for (const name of await readdir('public/uploads/.variants').catch(() => [] as string[])) if (name.startsWith(filename)) await unlink(path.join('public/uploads/.variants', name))
  }
  await p.$disconnect()
}).catch(error => { console.error(error); process.exitCode = 1 })
