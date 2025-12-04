import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // In a real app, you would send an email here
    // For demo purposes, we'll just log the reset link
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    console.log('Password reset link:', resetLink)

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetLink)

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
      // Remove this in production - only for demo
      resetLink: resetLink
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}