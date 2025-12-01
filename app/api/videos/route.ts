import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const quality = searchParams.get('quality')
    
    const session = await getServerSession(authOptions)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'READY',
      isPublic: true,
    }

    // Filter by premium content based on user subscription
    if (!session?.user || session.user.role === 'USER') {
      where.isPremium = false
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    if (quality) {
      where.qualities = { has: quality }
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              avatar: true,
            }
          },
          _count: {
            select: {
              comments: true,
              ratings: true,
              favorites: true,
            }
          }
        }
      }),
      prisma.video.count({ where })
    ])

    // Calculate average ratings
    const videosWithRatings = await Promise.all(
      videos.map(async (video) => {
        const avgRating = await prisma.rating.aggregate({
          where: { videoId: video.id },
          _avg: { rating: true }
        })

        return {
          ...video,
          averageRating: avgRating._avg.rating || 0,
          totalComments: video._count.comments,
          totalRatings: video._count.ratings,
          totalFavorites: video._count.favorites,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: videosWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['CREATOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, category, tags, isPremium, isPublic } = body

    const video = await prisma.video.create({
      data: {
        title,
        description,
        category,
        tags: tags || [],
        isPremium: isPremium || false,
        isPublic: isPublic !== false,
        uploaderId: session.user.id,
        status: 'UPLOADING'
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            avatar: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: video
    })

  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 500 }
    )
  }
}