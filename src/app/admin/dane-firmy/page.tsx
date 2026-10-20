import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { Button } from '@/components/ui/button'
import { ContentEditor } from '@/components/admin/content-editor'
import { contentDocs } from '@/lib/content-schema'
import { getCompanyContent } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const doc = contentDocs.company
  const content = await getCompanyContent()
  return (
    <>
      <AdminHeader
        title={doc.title}
        description={doc.description}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/strony">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Strony
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <ContentEditor docKey="company" initial={content} />
      </div>
    </>
  )
}
