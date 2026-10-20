import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, ExternalLink, FileText, Home, Lock, Menu, Pencil } from 'lucide-react'
import { ensureSystemPages } from '@/lib/content'
import { SYSTEM_PAGES, parseBlocks } from '@/lib/blocks'
import { formatDate } from '@/lib/utils'
import { NewPageDialog } from './new-page-dialog'

export const dynamic = 'force-dynamic'

const systemPath = (slug: string) => Object.values(SYSTEM_PAGES).find((p) => p.slug === slug)?.path

export default async function StronyPage() {
  await ensureSystemPages()
  const rows = await prisma.page.findMany({ orderBy: [{ system: 'desc' }, { sortOrder: 'asc' }, { title: 'asc' }] })
  // Strona główna zawsze na górze listy
  const pages = [...rows].sort((a, b) => Number(b.slug === SYSTEM_PAGES.home.slug) - Number(a.slug === SYSTEM_PAGES.home.slug))

  return (
    <>
      <AdminHeader title="Strony" description="Buduj strony z gotowych sekcji" action={<NewPageDialog />} />

      <div className="space-y-6 p-6">
        <div className="grid gap-3">
          {pages.map((page) => {
            const path = systemPath(page.slug) ?? `/${page.slug}`
            const sections = parseBlocks(page.content)
            return (
              <Card key={page.id}>
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {page.slug === SYSTEM_PAGES.home.slug ? <Home className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/strony/${page.id}`} className="font-semibold hover:text-primary">
                        {page.title}
                      </Link>
                      {page.system ? (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Stała strona
                        </Badge>
                      ) : page.published ? (
                        <Badge className="bg-green-600 hover:bg-green-600">Opublikowana</Badge>
                      ) : (
                        <Badge variant="outline">Szkic</Badge>
                      )}
                      {page.showInMenu && !page.system && (
                        <Badge variant="outline" className="gap-1">
                          <Menu className="h-3 w-3" />W menu
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {path} · {sections.length} {sections.length === 1 ? 'sekcja' : sections.length < 5 ? 'sekcje' : 'sekcji'} · zmieniono{' '}
                      {formatDate(page.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={path} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Podgląd
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/admin/strony/${page.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edytuj
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="bg-muted/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Telefon, adres, godziny i social media zmieniasz w „Danych firmy”. Produkty, marki i realizacje – w ich zakładkach.
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/dane-firmy">Dane firmy</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
