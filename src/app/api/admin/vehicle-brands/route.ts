import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const vehicleBrands = await prisma.vehicleBrand.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    })
    return NextResponse.json(vehicleBrands)
  } catch (error) {
    console.error('Error fetching vehicle brands:', error)
    return NextResponse.json(
      { message: 'Błąd podczas pobierania marek' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { categoryIds, ...brandData } = data

    // Check if slug already exists
    const existingBrand = await prisma.vehicleBrand.findUnique({
      where: { slug: data.slug },
    })

    if (existingBrand) {
      return NextResponse.json(
        { message: 'Marka z takim slug już istnieje' },
        { status: 400 }
      )
    }

    const vehicleBrand = await prisma.vehicleBrand.create({
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
        sortOrder: brandData.sortOrder || 0,
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

    return NextResponse.json(vehicleBrand, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle brand:', error)
    return NextResponse.json(
      { message: 'Błąd podczas tworzenia marki' },
      { status: 500 }
    )
  }
}
