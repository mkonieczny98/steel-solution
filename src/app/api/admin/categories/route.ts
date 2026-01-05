import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        vehicleBrands: {
          include: {
            vehicleBrand: true
          }
        }
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { message: 'Błąd pobierania kategorii' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Check if slug exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Kategoria o takim slug już istnieje' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
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

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { message: 'Błąd tworzenia kategorii' },
      { status: 500 }
    )
  }
}
