import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Props {
  params: { id: string }
}

// GET /api/admin/projects/[id]
export async function GET(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { category: true },
  })

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}

// PUT /api/admin/projects/[id]
export async function PUT(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Check if slug is unique (excluding current project)
    const existing = await prisma.project.findFirst({
      where: {
        slug: body.slug,
        NOT: { id: params.id },
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Realizacja z tym slugiem już istnieje' },
        { status: 400 }
      )
    }

    const project = await prisma.project.update({
      where: { id: params.id },
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
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { message: 'Wystąpił błąd podczas aktualizacji' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/projects/[id]
export async function DELETE(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { message: 'Wystąpił błąd podczas usuwania' },
      { status: 500 }
    )
  }
}
