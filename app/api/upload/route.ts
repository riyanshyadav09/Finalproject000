import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

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
    const { fileName, fileType, fileSize, videoId } = body

    // Validate file size (5GB limit)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5368709120')
    if (fileSize > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv'
    ]

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Verify video ownership
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        uploaderId: session.user.id
      }
    })

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found or unauthorized' },
        { status: 404 }
      )
    }

    // Generate unique file key
    const timestamp = Date.now()
    const fileExtension = fileName.split('.').pop()
    const key = `videos/${session.user.id}/${videoId}/${timestamp}.${fileExtension}`

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
      Metadata: {
        uploaderId: session.user.id,
        videoId: videoId,
        originalName: fileName,
      }
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // Update video with original URL
    await prisma.video.update({
      where: { id: videoId },
      data: {
        originalUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        status: 'UPLOADING'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        key,
        videoId
      }
    })

  } catch (error) {
    console.error('Error generating upload URL:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}

// Handle upload completion webhook
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoId, key } = body

    // Update video status to processing
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'PROCESSING' }
    })

    // Trigger video processing (this would typically be done via a queue/lambda)
    // For now, we'll simulate the processing
    setTimeout(async () => {
      try {
        // Simulate HLS generation
        const hlsUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/hls/${videoId}/master.m3u8`
        
        await prisma.video.update({
          where: { id: videoId },
          data: {
            status: 'READY',
            hlsUrl,
            qualities: ['SD_360', 'HD_720', 'FHD_1080'], // Simulated qualities
            duration: 3600 // Simulated duration
          }
        })

        // Send notification to user (WebSocket or email)
        console.log(`Video ${videoId} processing completed`)
      } catch (error) {
        console.error('Error updating video after processing:', error)
        
        await prisma.video.update({
          where: { id: videoId },
          data: { status: 'FAILED' }
        })
      }
    }, 5000) // Simulate 5 second processing time

    return NextResponse.json({
      success: true,
      message: 'Upload completed, processing started'
    })

  } catch (error) {
    console.error('Error handling upload completion:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process upload completion' },
      { status: 500 }
    )
  }
}