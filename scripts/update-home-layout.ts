import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { DEFAULT_PAGE_BLOCKS, HOME_BLOCK_ORDER, type Block } from '../src/lib/blocks'
import { snapshotOf } from '../src/lib/page-snapshots'

async function main() {
  const previousFile = process.argv[2]
  if (!previousFile) throw new Error('Podaj plik poprzednich domyślnych bloków.')
  const old = JSON.parse(readFileSync(previousFile, 'utf8')) as Record<string, Block[]>
  const p = new PrismaClient()
  try {
    const page = await p.page.findUnique({ where: { slug: 'strona-glowna' } })
    if (!page) return
    const blocks = JSON.parse(page.content || '[]') as Block[]
    const updated = blocks.map(block => {
      const before = old['strona-glowna'].find(b => b.id === block.id)
      const next = DEFAULT_PAGE_BLOCKS['strona-glowna'].find(b => b.id === block.id)
      if (!before || !next) return block
      // Only untouched default values are upgraded; editor changes are preserved.
      const data = { ...block.data }
      for (const [key, value] of Object.entries(next.data)) {
        if (JSON.stringify(block.data[key]) === JSON.stringify(before.data[key])) data[key] = value
      }
      return { ...block, data }
    })
    if (blocks.length === HOME_BLOCK_ORDER.length && blocks.every(b => HOME_BLOCK_ORDER.includes(b.id))) updated.sort((a, b) => HOME_BLOCK_ORDER.indexOf(a.id) - HOME_BLOCK_ORDER.indexOf(b.id))
    await p.$transaction(async tx => {
      await tx.pageRevision.create({ data: { pageId: page.id, snapshot: JSON.stringify(snapshotOf(page)) } })
      await tx.page.update({ where: { id: page.id }, data: { content: JSON.stringify(updated) } })
    })
    console.log('Układ głównej zaktualizowany; poprzednia wersja dostępna w historii publikacji.')
  } finally { await p.$disconnect() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
