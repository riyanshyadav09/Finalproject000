import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const LocalStorageManager = require('../../../lib/storage/local-storage');
const VideoProcessor = require('../../../lib/storage/video-processor');

const storage = new LocalStorageManager('./videos');

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('video');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const videoId = uuidv4();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save original file
    const tempPath = path.join('./temp', `${videoId}.mp4`);
    await writeFile(tempPath, buffer);
    
    // Initialize storage and process video
    await storage.initStorage();
    const result = await storage.uploadVideo(videoId, tempPath);
    
    // Generate thumbnail
    const thumbnailPath = path.join('./videos', 'thumbnails', `${videoId}.jpg`);
    await VideoProcessor.generateThumbnail(tempPath, thumbnailPath);
    
    return NextResponse.json({
      videoId,
      status: 'processed',
      urls: {
        '1080p': storage.getVideoUrl(videoId, '1080p'),
        '720p': storage.getVideoUrl(videoId, '720p'),
        '480p': storage.getVideoUrl(videoId, '480p'),
        '360p': storage.getVideoUrl(videoId, '360p'),
        '144p': storage.getVideoUrl(videoId, '144p')
      },
      thumbnail: `/videos/thumbnails/${videoId}.jpg`
    });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}