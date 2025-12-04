const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class LocalStorageManager {
  constructor(baseDir = './videos') {
    this.baseDir = baseDir;
    this.resolutions = {
      '1080p': '1920x1080',
      '720p': '1280x720', 
      '480p': '854x480',
      '360p': '640x360',
      '144p': '256x144'
    };
  }

  async initStorage() {
    const dirs = ['original', ...Object.keys(this.resolutions)];
    
    for (const dir of dirs) {
      await fs.mkdir(path.join(this.baseDir, dir), { recursive: true });
    }
  }

  async uploadVideo(videoId, filePath) {
    const originalPath = path.join(this.baseDir, 'original', `${videoId}.mp4`);
    await fs.copyFile(filePath, originalPath);
    
    // Convert to multiple resolutions
    const conversions = Object.entries(this.resolutions).map(([res, scale]) => 
      this.convertVideo(videoId, res, scale)
    );
    
    await Promise.all(conversions);
    return { videoId, status: 'processed' };
  }

  async convertVideo(videoId, resolution, scale) {
    const input = path.join(this.baseDir, 'original', `${videoId}.mp4`);
    const output = path.join(this.baseDir, resolution, `${videoId}.m3u8`);
    
    const cmd = `ffmpeg -i "${input}" -vf scale=${scale} -c:v libx264 -c:a aac -hls_time 10 -hls_playlist_type vod "${output}"`;
    
    await execAsync(cmd);
  }

  getVideoUrl(videoId, resolution = '720p') {
    return `/videos/${resolution}/${videoId}.m3u8`;
  }

  async deleteVideo(videoId) {
    const dirs = ['original', ...Object.keys(this.resolutions)];
    
    for (const dir of dirs) {
      const filePath = path.join(this.baseDir, dir, `${videoId}.*`);
      try {
        await execAsync(`rm -f ${filePath}`);
      } catch (error) {
        console.log(`File not found: ${filePath}`);
      }
    }
  }
}

module.exports = LocalStorageManager;