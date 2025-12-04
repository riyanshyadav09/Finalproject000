import { NextRequest, NextResponse } from 'next/server'
import { VideoEncoder, VIDEO_PROFILES } from '@/lib/video/processing/video-encoder'
import { AuthMiddleware } from '@/lib/security/auth-middleware'
import path from 'path'
import { mkdir } from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const auth = await AuthMiddleware.validateAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const videoId = formData.get('videoId') as string
    const codecPreference = formData.get('codec') as 'h264' | 'vp9' | 'av1' || 'h264'

    if (!videoFile || !videoId) {
      return NextResponse.json({ error: 'Missing video file or ID' }, { status: 400 })
    }

    const processingDir = path.join(process.cwd(), 'uploads', 'processing', videoId)
    const outputDir = path.join(process.cwd(), 'uploads', 'videos', videoId)
    
    await mkdir(processingDir, { recursive: true })
    await mkdir(outputDir, { recursive: true })

    const inputPath = path.join(processingDir, 'input.mp4')
    const buffer = await videoFile.arrayBuffer()
    await require('fs/promises').writeFile(inputPath, Buffer.from(buffer))

    const profiles = VIDEO_PROFILES.filter(p => p.codec === codecPreference)
    const encodedFiles = await VideoEncoder.encodeVideo(inputPath, outputDir, profiles)
    const manifestPath = await VideoEncoder.generateDashManifest(outputDir, profiles)

    return NextResponse.json({
      success: true,
      videoId,
      manifestUrl: `/api/dash/${videoId}/manifest.mpd`,
      profiles: profiles.map(p => ({
        resolution: p.resolution,
        bitrate: p.bitrate,
        codec: p.codec
      })),
      encodedFiles: encodedFiles.length
    })

  } catch (error) {
    console.error('Video processing error:', error)
    return NextResponse.json({ error: 'Video processing failed' }, { status: 500 })
  }
}