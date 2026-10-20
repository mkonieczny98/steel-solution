import { z } from 'zod'

export const snapshotSchema = z.object({
  title: z.string().trim().min(1).max(200), slug: z.string().min(1).max(80),
  description: z.string().max(300).nullable(), published: z.boolean(),
  showInMenu: z.boolean(), sortOrder: z.number().int(), content: z.string().nullable(),
})
export type PageSnapshot = z.infer<typeof snapshotSchema>
export function snapshotOf(page: PageSnapshot): PageSnapshot {
  return snapshotSchema.parse(page)
}
export function readDraft(value: string | null, fallback: PageSnapshot): PageSnapshot {
  if (!value) return snapshotOf(fallback)
  try { return snapshotSchema.parse(JSON.parse(value)) } catch { return snapshotOf(fallback) }
}
