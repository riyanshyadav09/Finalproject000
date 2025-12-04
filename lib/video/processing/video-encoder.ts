import { spawn } from 'child_process'
import path from 'path'

export interface VideoProfile {
  resolution: string
  bitrate: string
  codec: 'h264' | 'vp9' | 'av1'
  fps: number
}

export const VIDEO_PROFILES: VideoProfile[] = [
  { resolution: '426x240', bitrate: '400k', codec: 'h264', fps: 30 },
  { resolution: '640x360', bitrate: '800k', codec: 'h264', fps: 30 },
  { resolution: '854x480', bitrate: '1200k', codec: 'h264', fps: 30 },
  { resolution: '1280x720', bitrate: '2500k', codec: 'h264', fps: 30 },
  { resolution: '1920x1080', bitrate: '5000k', codec: 'h264', fps: 30 },
  { resolution: '3840x2160', bitrate: '15000k', codec: 'h264', fps: 30 }
]

export class VideoEncoder {
  static async encodeVideo(inputPath: string, outputDir: string, profiles: VideoProfile[]): Promise<string[]> {
    const outputPaths: string[] = []
    
    for (const profile of profiles) {
      const outputPath = path.join(outputDir, `${profile.resolution}_${profile.bitrate}.mp4`)
      await this.encodeProfile(inputPath, outputPath, profile)
      outputPaths.push(outputPath)
    }
    
    return outputPaths
  }

  private static async encodeProfile(input: string, output: string, profile: VideoProfile): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = this.getEncodingArgs(input, output, profile)
      const ffmpeg = spawn('ffmpeg', args)
      
      ffmpeg.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`FFmpeg failed with code ${code}`))
      })
    })
  }

  private static getEncodingArgs(input: string, output: string, profile: VideoProfile): string[] {
    const baseArgs = ['-i', input, '-y']
    
    switch (profile.codec) {
      case 'h264':
        return [
          ...baseArgs,
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '23',
          '-maxrate', profile.bitrate,
          '-bufsize', `${parseInt(profile.bitrate) * 2}k`,
          '-vf', `scale=${profile.resolution}`,
          '-r', profile.fps.toString(),
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', '+faststart',
          output
        ]
      
      case 'vp9':
        return [
          ...baseArgs,
          '-c:v', 'libvpx-vp9',
          '-b:v', profile.bitrate,
          '-maxrate', profile.bitrate,
          '-bufsize', `${parseInt(profile.bitrate) * 2}k`,
          '-vf', `scale=${profile.resolution}`,
          '-r', profile.fps.toString(),
          '-c:a', 'libopus',
          '-b:a', '128k',
          '-f', 'webm',
          output.replace('.mp4', '.webm')
        ]
      
      case 'av1':
        return [
          ...baseArgs,
          '-c:v', 'libaom-av1',
          '-b:v', profile.bitrate,
          '-maxrate', profile.bitrate,
          '-bufsize', `${parseInt(profile.bitrate) * 2}k`,
          '-vf', `scale=${profile.resolution}`,
          '-r', profile.fps.toString(),
          '-c:a', 'libopus',
          '-b:a', '128k',
          '-f', 'webm',
          output.replace('.mp4', '.webm')
        ]
      
      default:
        throw new Error(`Unsupported codec: ${profile.codec}`)
    }
  }

  static async generateDashManifest(videoDir: string, profiles: VideoProfile[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const manifestPath = path.join(videoDir, 'manifest.mpd')
      const inputFiles = profiles.map(p => 
        path.join(videoDir, `${p.resolution}_${p.bitrate}.${p.codec === 'h264' ? 'mp4' : 'webm'}`)
      )
      
      const args = [
        '-f', 'dash',
        '-seg_duration', '4',
        '-adaptation_sets', 'id=0,streams=v id=1,streams=a',
        ...inputFiles.flatMap(file => ['-i', file]),
        '-map', '0:v', '-map', '1:v', '-map', '2:v', '-map', '3:v',
        '-c', 'copy',
        manifestPath
      ]
      
      const ffmpeg = spawn('ffmpeg', args)
      
      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(manifestPath)
        else reject(new Error(`DASH manifest generation failed with code ${code}`))
      })
    })
  }
}