import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/header'
import { Button } from '@/components/ui/button'
import { EntityLayoutEditor } from '@/components/admin/entity-layout-editor'
import { entityBlocks } from '@/lib/blocks'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LayoutPage({ params }: Props) {
  const { id } = await params
  const item = await prisma.vehicleBrand.findUnique({ where: { id } })
  if (!item) notFound()

  return (
    <>
      <AdminHeader
        title={`Układ strony: ${item.name}`}
        description="Dodawaj, przestawiaj i edytuj sekcje strony"
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/pojazdy">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Marki
            </Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-5xl p-6">
        <EntityLayoutEditor
          kind="brand"
          id={item.id}
          name={item.name}
          publicPath={`/oferta/pojazdy/${item.slug}`}
          formPath={`/admin/pojazdy/${item.id}`}
          initialBlocks={entityBlocks(item.blocks, 'brand')}
          isDefault={!item.blocks}
        />
      </div>
    </>
  )
}
