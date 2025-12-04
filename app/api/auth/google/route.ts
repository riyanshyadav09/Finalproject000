import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { googleId, email, name, picture, role = 'USER' } = body

    if (!googleId || !email || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required Google authentication data' },
        { status: 400 }
      )
    }

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { googleId: googleId }
        ]
      },
      include: {
        subscription: true
      }
    })

    if (user) {
      // Update existing user with Google data if not already set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatar: picture,
            isVerified: true
          },
          include: {
            subscription: true
          }
        })
      }
    } else {
      // Create new user with Google authentication
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 4)
      
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username,
          firstName: name.split(' ')[0] || name,
          lastName: name.split(' ').slice(1).join(' ') || '',
          googleId,
          avatar: picture,
          password: '', // No password for Google auth
          isVerified: true,
          role: role as any,
          subscription: {
            create: {
              tier: 'FREE',
              isActive: true
            }
          }
        },
        include: {
          subscription: true
        }
      })
    }

    // Generate JWT token (simplified for demo)
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    })).toString('base64')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        subscription: user.subscription
      },
      token
    })

  } catch (error) {
    console.error('Google authentication error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}