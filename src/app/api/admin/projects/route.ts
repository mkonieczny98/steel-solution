import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/projects - List all projects
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  return NextResponse.json(projects)
}

// POST /api/admin/projects - Create new project
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Check if slug is unique
    const existing = await prisma.project.findUnique({
      where: { slug: body.slug },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Realizacja z tym slugiem już istnieje' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        categoryId: body.categoryId,
        vehicleBrand: body.vehicleBrand || null,
        vehicleModel: body.vehicleModel || null,
        images: body.images || [],
        thumbnail: body.thumbnail || null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        featured: body.featured || false,
        published: body.published || false,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { message: 'Wystąpił błąd podczas tworzenia realizacji' },
      { status: 500 }
    )
  }
}
