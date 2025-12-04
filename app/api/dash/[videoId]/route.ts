import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const videoId = params.videoId
    const manifestPath = path.join(process.cwd(), 'uploads', 'videos', videoId, 'manifest.mpd')
    
    const manifestContent = await readFile(manifestPath, 'utf-8')
    
    return new NextResponse(manifestContent, {
      headers: {
        'Content-Type': 'application/dash+xml',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Manifest not found' }, { status: 404 })
  }
}