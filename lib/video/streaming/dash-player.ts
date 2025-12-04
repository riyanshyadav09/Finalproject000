'use client'

import { ABRAlgorithm, NetworkMetrics, QualityLevel } from '../abr/abr-algorithm'

export class DashPlayer {
  private video: HTMLVideoElement
  private mediaSource: MediaSource
  private sourceBuffer: SourceBuffer | null = null
  private qualities: QualityLevel[] = []
  private currentQuality: QualityLevel | null = null
  private segmentIndex = 0
  private bufferLevel = 0
  private networkMetrics: NetworkMetrics = {
    bandwidth: 1000000, // 1 Mbps default
    rtt: 100,
    packetLoss: 0,
    bufferLevel: 0
  }

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement
    this.mediaSource = new MediaSource()
    this.video.src = URL.createObjectURL(this.mediaSource)
    
    this.mediaSource.addEventListener('sourceopen', () => {
      this.initializeSourceBuffer()
    })
    
    this.startBufferMonitoring()
    this.startNetworkMonitoring()
  }

  async loadManifest(manifestUrl: string): Promise<void> {
    const response = await fetch(manifestUrl)
    const manifestText = await response.text()
    this.parseManifest(manifestText)
    
    // Select initial quality
    this.currentQuality = ABRAlgorithm.selectQuality(this.qualities, this.networkMetrics)
    this.loadNextSegment()
  }

  private parseManifest(manifest: string): void {
    // Simplified DASH manifest parsing
    const parser = new DOMParser()
    const doc = parser.parseFromString(manifest, 'text/xml')
    const representations = doc.querySelectorAll('Representation')
    
    this.qualities = Array.from(representations).map((rep, index) => ({
      id: rep.getAttribute('id') || index.toString(),
      resolution: `${rep.getAttribute('width')}x${rep.getAttribute('height')}`,
      bitrate: parseInt(rep.getAttribute('bandwidth') || '0'),
      codec: rep.getAttribute('codecs') || 'h264',
      fps: parseInt(rep.getAttribute('frameRate') || '30')
    }))
  }

  private initializeSourceBuffer(): void {
    if (this.mediaSource.readyState === 'open') {
      this.sourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"')
      
      this.sourceBuffer.addEventListener('updateend', () => {
        this.loadNextSegment()
      })
    }
  }

  private async loadNextSegment(): Promise<void> {
    if (!this.currentQuality || !this.sourceBuffer) return
    
    const startTime = performance.now()
    const segmentUrl = this.getSegmentUrl(this.currentQuality, this.segmentIndex)
    
    try {
      const response = await fetch(segmentUrl)
      const segmentData = await response.arrayBuffer()
      const downloadTime = performance.now() - startTime
      
      // Update network metrics
      this.updateNetworkMetrics(segmentData.byteLength, downloadTime)
      
      // ABR decision
      const newQuality = ABRAlgorithm.selectQuality(
        this.qualities,
        this.networkMetrics,
        this.currentQuality
      )
      
      if (newQuality.id !== this.currentQuality.id) {
        console.log(`Quality switch: ${this.currentQuality.resolution} -> ${newQuality.resolution}`)
        this.currentQuality = newQuality
      }
      
      // Append segment to buffer
      if (!this.sourceBuffer.updating) {
        this.sourceBuffer.appendBuffer(segmentData)
        this.segmentIndex++
      }
      
    } catch (error) {
      console.error('Segment loading failed:', error)
      setTimeout(() => this.loadNextSegment(), 1000)
    }
  }

  private getSegmentUrl(quality: QualityLevel, index: number): string {
    return `/api/dash/${quality.id}/segment_${index}.m4s`
  }

  private updateNetworkMetrics(bytes: number, downloadTime: number): void {
    this.networkMetrics.bandwidth = ABRAlgorithm.calculateThroughput(bytes, downloadTime)
    this.networkMetrics.bufferLevel = this.getBufferLevel()
  }

  private getBufferLevel(): number {
    if (this.video.buffered.length > 0) {
      const currentTime = this.video.currentTime
      const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1)
      return Math.max(0, bufferedEnd - currentTime)
    }
    return 0
  }

  private startBufferMonitoring(): void {
    setInterval(() => {
      this.bufferLevel = this.getBufferLevel()
      this.networkMetrics.bufferLevel = this.bufferLevel
    }, 1000)
  }

  private startNetworkMonitoring(): void {
    // Network quality estimation
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        this.networkMetrics.bandwidth = connection.downlink * 1000000 // Convert to bps
        this.networkMetrics.rtt = connection.rtt || 100
      }
    }
  }

  getCurrentQuality(): QualityLevel | null {
    return this.currentQuality
  }

  getAvailableQualities(): QualityLevel[] {
    return this.qualities
  }

  setQuality(qualityId: string): void {
    const quality = this.qualities.find(q => q.id === qualityId)
    if (quality) {
      this.currentQuality = quality
    }
  }

  getNetworkMetrics(): NetworkMetrics {
    return { ...this.networkMetrics }
  }
}