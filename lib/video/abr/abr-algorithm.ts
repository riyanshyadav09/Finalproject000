export interface NetworkMetrics {
  bandwidth: number // bps
  rtt: number // ms
  packetLoss: number // percentage
  bufferLevel: number // seconds
}

export interface QualityLevel {
  id: string
  resolution: string
  bitrate: number
  codec: string
  fps: number
}

export class ABRAlgorithm {
  private static readonly BUFFER_TARGET = 10 // seconds
  private static readonly BUFFER_MIN = 5 // seconds
  private static readonly BANDWIDTH_SAFETY_FACTOR = 0.8
  private static readonly QUALITY_SWITCH_THRESHOLD = 0.15

  static selectQuality(
    availableQualities: QualityLevel[],
    metrics: NetworkMetrics,
    currentQuality?: QualityLevel
  ): QualityLevel {
    // Sort qualities by bitrate
    const sortedQualities = [...availableQualities].sort((a, b) => a.bitrate - b.bitrate)
    
    // Calculate effective bandwidth
    const effectiveBandwidth = metrics.bandwidth * this.BANDWIDTH_SAFETY_FACTOR
    
    // Buffer-based selection
    if (metrics.bufferLevel < this.BUFFER_MIN) {
      return this.selectLowerQuality(sortedQualities, currentQuality)
    }
    
    // Bandwidth-based selection
    const bandwidthBasedQuality = this.selectByBandwidth(sortedQualities, effectiveBandwidth)
    
    // Stability check - avoid frequent switches
    if (currentQuality && this.shouldAvoidSwitch(currentQuality, bandwidthBasedQuality)) {
      return currentQuality
    }
    
    return bandwidthBasedQuality
  }

  private static selectByBandwidth(qualities: QualityLevel[], bandwidth: number): QualityLevel {
    let selectedQuality = qualities[0]
    
    for (const quality of qualities) {
      if (quality.bitrate <= bandwidth) {
        selectedQuality = quality
      } else {
        break
      }
    }
    
    return selectedQuality
  }

  private static selectLowerQuality(qualities: QualityLevel[], current?: QualityLevel): QualityLevel {
    if (!current) return qualities[0]
    
    const currentIndex = qualities.findIndex(q => q.id === current.id)
    return currentIndex > 0 ? qualities[currentIndex - 1] : qualities[0]
  }

  private static shouldAvoidSwitch(current: QualityLevel, proposed: QualityLevel): boolean {
    const bitrateRatio = Math.abs(current.bitrate - proposed.bitrate) / current.bitrate
    return bitrateRatio < this.QUALITY_SWITCH_THRESHOLD
  }

  static calculateThroughput(downloadedBytes: number, downloadTime: number): number {
    return (downloadedBytes * 8) / (downloadTime / 1000) // bps
  }

  static estimateBufferHealth(
    currentBuffer: number,
    segmentDuration: number,
    downloadTime: number
  ): number {
    const consumedBuffer = downloadTime / 1000
    return Math.max(0, currentBuffer + segmentDuration - consumedBuffer)
  }
}