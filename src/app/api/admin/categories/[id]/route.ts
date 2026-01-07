import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        vehicleBrands: {
          include: { vehicleBrand: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { message: 'Kategoria nie znaleziona' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json(
      { message: 'Błąd pobierania kategorii' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Brak autoryzacji' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { vehicleBrandIds, ...categoryData } = data

    // Check if slug exists for different category
    const existingCategory = await prisma.category.findFirst({
      where: { 
        slug: data.slug,
        NOT: { id: params.id }
      },
    })

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Kategoria o takim slug już istnieje' },
        { status: 400 }
      )
    }

    // Delete existing relations
    await prisma.categoryVehicleBrand.deleteMany({
      where: { categoryId: params.id }
    })

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || null,
        longDescription: categoryData.longDescription || null,
        contentDescription: categoryData.contentDescription || null,
        icon: categoryData.icon || null,
        color: categoryData.color || '#3b82f6',
        features: categoryData.features || '[]',
        benefits: categoryData.benefits || '[]',
        specifications: categoryData.specifications || '[]',
        image: categoryData.image || null,
        heroImage: categoryData.heroImage || null,
        gallery: categoryData.gallery || '[]',
        metaTitle: categoryData.metaTitle || null,
        metaDescription: categoryData.metaDescription || null,
        sortOrder: categoryData.sortOrder || 0,
        published: categoryData.published ?? true,
        vehicleBrands: vehicleBrandIds?.length ? {
          create: vehicleBrandIds.map((id: string) => ({
            vehicleBrandId: id
          }))
        } : undefined,
      },
      include: {
        vehicleBrands: {
          include: { vehicleBrand: true }
        }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { message: 'Błąd aktualizacji kategorii' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Brak autoryzacji' },
        { status: 401 }
      )
    }

    // Check if category has projects
    const projectCount = await prisma.project.count({
      where: { categoryId: params.id },
    })

    if (projectCount > 0) {
      return NextResponse.json(
        { message: `Nie można usunąć kategorii z ${projectCount} realizacjami` },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { message: 'Błąd usuwania kategorii' },
      { status: 500 }
    )
  }
}
