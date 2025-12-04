const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

class VideoProcessor {
  static resolutions = {
    '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
    '720p': { width: 1280, height: 720, bitrate: '2500k' },
    '480p': { width: 854, height: 480, bitrate: '1000k' },
    '360p': { width: 640, height: 360, bitrate: '750k' },
    '144p': { width: 256, height: 144, bitrate: '400k' }
  };

  static async processVideo(inputPath, outputDir, videoId) {
    const results = {};
    
    for (const [res, config] of Object.entries(this.resolutions)) {
      const outputPath = path.join(outputDir, res, `${videoId}.m3u8`);
      
      const cmd = `ffmpeg -i "${inputPath}" \
        -vf scale=${config.width}:${config.height} \
        -c:v libx264 -b:v ${config.bitrate} \
        -c:a aac -b:a 128k \
        -hls_time 10 \
        -hls_playlist_type vod \
        -hls_segment_filename "${path.join(outputDir, res, `${videoId}_%03d.ts`)}" \
        "${outputPath}"`;
      
      try {
        await execAsync(cmd);
        results[res] = outputPath;
      } catch (error) {
        console.error(`Failed to process ${res}:`, error.message);
      }
    }
    
    return results;
  }

  static async generateThumbnail(inputPath, outputPath, timestamp = '00:00:01') {
    const cmd = `ffmpeg -i "${inputPath}" -ss ${timestamp} -vframes 1 -q:v 2 "${outputPath}"`;
    await execAsync(cmd);
  }
}

module.exports = VideoProcessor;