import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Truck,
  FolderKanban,
  MessageSquare,
  Eye,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Image as ImageIcon,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

async function getStats() {
  const [projectsCount, categoriesCount, messagesCount, mediaCount] = await Promise.all([
    prisma.project.count(),
    prisma.category.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.media.count(),
  ])

  const recentProjects = await prisma.project.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  const recentMessages = await prisma.contactMessage.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  return {
    projectsCount,
    categoriesCount,
    messagesCount,
    mediaCount,
    recentProjects,
    recentMessages,
  }
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-1 h-3 w-32" />
      </CardContent>
    </Card>
  )
}

async function StatsCards() {
  const stats = await getStats()

  const cards = [
    {
      title: 'Realizacje',
      value: stats.projectsCount,
      description: 'Wszystkie projekty',
      icon: Truck,
      href: '/admin/realizacje',
      color: 'bg-blue-500',
    },
    {
      title: 'Kategorie',
      value: stats.categoriesCount,
      description: 'Aktywne kategorie',
      icon: FolderKanban,
      href: '/admin/kategorie',
      color: 'bg-green-500',
    },
    {
      title: 'Wiadomości',
      value: stats.messagesCount,
      description: 'Nieprzeczytane',
      icon: MessageSquare,
      href: '/admin/wiadomosci',
      color: 'bg-orange-500',
    },
    {
      title: 'Media',
      value: stats.mediaCount,
      description: 'Wszystkie pliki',
      icon: ImageIcon,
      href: '/admin/media',
      color: 'bg-purple-500',
    },
  ]

  return (
    <>
      {cards.map((card) => (
        <Card key={card.title} className="group relative overflow-hidden">
          <Link href={card.href} className="absolute inset-0 z-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-md p-2 ${card.color}`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
            <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

async function RecentProjects() {
  const stats = await getStats()

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ostatnie realizacje</CardTitle>
          <CardDescription>Najnowsze dodane projekty</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/realizacje/nowa">
            <Plus className="mr-2 h-4 w-4" />
            Nowa
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.recentProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Brak realizacji. Dodaj pierwszą!
            </p>
          ) : (
            stats.recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/realizacje/${project.id}`}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <Truck className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-none">{project.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.category.name}
                    {project.vehicleBrand && ` • ${project.vehicleBrand}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={project.published ? 'success' : 'secondary'}>
                    {project.published ? 'Opublikowane' : 'Szkic'}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

async function RecentMessages() {
  const stats = await getStats()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Wiadomości</CardTitle>
          <CardDescription>Ostatnie zapytania</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/wiadomosci">Zobacz wszystkie</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.recentMessages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Brak wiadomości
            </p>
          ) : (
            stats.recentMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${
                    message.read ? 'bg-muted' : 'bg-primary'
                  }`}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{message.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {message.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Przegląd panelu administracyjnego"
      />
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Suspense
            fallback={
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            }
          >
            <StatsCards />
          </Suspense>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Suspense
            fallback={
              <Card className="col-span-2">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            }
          >
            <RecentProjects />
          </Suspense>

          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            }
          >
            <RecentMessages />
          </Suspense>
        </div>
      </div>
    </>
  )
}
