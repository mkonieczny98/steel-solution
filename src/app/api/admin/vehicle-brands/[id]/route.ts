import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleBrand = await prisma.vehicleBrand.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: { category: true }
        }
      }
    })

    if (!vehicleBrand) {
      return NextResponse.json(
        { message: 'Marka nie znaleziona' },
        { status: 404 }
      )
    }

    return NextResponse.json(vehicleBrand)
  } catch (error) {
    console.error('Error fetching vehicle brand:', error)
    return NextResponse.json(
      { message: 'Błąd podczas pobierania marki' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { categoryIds, ...brandData } = data

    // Check if slug already exists (excluding current brand)
    const existingBrand = await prisma.vehicleBrand.findFirst({
      where: {
        slug: data.slug,
        NOT: { id: params.id },
      },
    })

    if (existingBrand) {
      return NextResponse.json(
        { message: 'Marka z takim slug już istnieje' },
        { status: 400 }
      )
    }

    // Delete existing relations
    await prisma.categoryVehicleBrand.deleteMany({
      where: { vehicleBrandId: params.id }
    })

    const vehicleBrand = await prisma.vehicleBrand.update({
      where: { id: params.id },
      data: {
        name: brandData.name,
        slug: brandData.slug,
        fullName: brandData.fullName || null,
        description: brandData.description || null,
        longDescription: brandData.longDescription || null,
        contentDescription: brandData.contentDescription || null,
        type: brandData.type || 'truck',
        models: brandData.models || '[]',
        image: brandData.image || null,
        heroImage: brandData.heroImage || null,
        gallery: brandData.gallery || '[]',
        metaTitle: brandData.metaTitle || null,
        metaDescription: brandData.metaDescription || null,
        sortOrder: brandData.sortOrder ?? 0,
        published: brandData.published ?? true,
        categories: categoryIds?.length ? {
          create: categoryIds.map((id: string) => ({
            categoryId: id
          }))
        } : undefined,
      },
      include: {
        categories: {
          include: { category: true }
        }
      }
    })

    return NextResponse.json(vehicleBrand)
  } catch (error) {
    console.error('Error updating vehicle brand:', error)
    return NextResponse.json(
      { message: 'Błąd podczas aktualizacji marki' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await prisma.vehicleBrand.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Marka usunięta' })
  } catch (error) {
    console.error('Error deleting vehicle brand:', error)
    return NextResponse.json(
      { message: 'Błąd podczas usuwania marki' },
      { status: 500 }
    )
  }
}
