import { test } from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { prepareAttachments } from '../src/lib/contact-files'
import { contactSchema } from '../src/lib/contact'

test('attachment validation decodes images and rejects disguised or excessive files', async () => {
  const png = await sharp({ create: { width: 20, height: 30, channels: 3, background: '#ca2030' } }).png().toBuffer()
  const file = new File([new Uint8Array(png)], 'kabina.png', { type: 'image/png' })
  const [saved] = await prepareAttachments([file])
  assert.equal(saved.mimeType, 'image/jpeg')
  assert.equal(saved.name, 'kabina.jpg')
  assert.equal((await sharp(saved.data).metadata()).format, 'jpeg')
  await assert.rejects(prepareAttachments([new File(['<svg></svg>'], 'fake.jpg', { type: 'image/jpeg' })]))
  await assert.rejects(prepareAttachments(Array(4).fill(file)))
  await assert.rejects(prepareAttachments([new File(['not pdf'], 'fake.pdf', { type: 'application/pdf' })]))
  await assert.rejects(prepareAttachments([new File([], 'empty.jpg', { type: 'image/jpeg' })]))
})

test('contact validation requires consent and limits project context', () => {
  const valid = { name: 'Test', email: 'test@example.invalid', message: 'Testowe zapytanie.', consent: true }
  assert.equal(contactSchema.safeParse(valid).success, true)
  assert.equal(contactSchema.safeParse({ ...valid, consent: false }).success, false)
  assert.equal(contactSchema.safeParse({ ...valid, projectSlug: '../../admin' }).success, false)
})
