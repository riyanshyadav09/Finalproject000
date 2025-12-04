export interface AudioFingerprint {
  videoId: string
  fingerprint: number[]
  duration: number
  sampleRate: number
  timestamp: number
}

export interface VideoFingerprint {
  videoId: string
  frames: number[][]
  duration: number
  frameRate: number
  timestamp: number
}

export interface CopyrightMatch {
  originalVideoId: string
  matchedVideoId: string
  confidence: number
  matchType: 'audio' | 'video' | 'both'
  segments: Array<{
    startTime: number
    endTime: number
    confidence: number
  }>
}

export class ContentID {
  private audioFingerprints: Map<string, AudioFingerprint> = new Map()
  private videoFingerprints: Map<string, VideoFingerprint> = new Map()
  private hashBands: Map<string, Set<string>> = new Map()

  // Audio fingerprinting using spectral hashing
  generateAudioFingerprint(audioBuffer: Float32Array, sampleRate: number): number[] {
    const windowSize = 2048
    const hopSize = 512
    const fingerprint: number[] = []
    
    for (let i = 0; i < audioBuffer.length - windowSize; i += hopSize) {
      const window = audioBuffer.slice(i, i + windowSize)
      const spectrum = this.fft(window)
      const hash = this.spectralHash(spectrum)
      fingerprint.push(hash)
    }
    
    return fingerprint
  }

  // Simplified FFT implementation
  private fft(signal: Float32Array): number[] {
    const N = signal.length
    const spectrum: number[] = new Array(N / 2)
    
    for (let k = 0; k < N / 2; k++) {
      let real = 0
      let imag = 0
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N
        real += signal[n] * Math.cos(angle)
        imag += signal[n] * Math.sin(angle)
      }
      
      spectrum[k] = Math.sqrt(real * real + imag * imag)
    }
    
    return spectrum
  }

  // Spectral hashing for robust audio fingerprinting
  private spectralHash(spectrum: number[]): number {
    const bands = [
      [0, 10], [10, 20], [20, 40], [40, 80], [80, 160], [160, 320]
    ]
    
    let hash = 0
    
    for (let i = 0; i < bands.length; i++) {
      const [start, end] = bands[i]
      let energy = 0
      
      for (let j = start; j < Math.min(end, spectrum.length); j++) {
        energy += spectrum[j]
      }
      
      // Compare adjacent bands
      if (i > 0) {
        const prevBand = bands[i - 1]
        let prevEnergy = 0
        
        for (let j = prevBand[0]; j < Math.min(prevBand[1], spectrum.length); j++) {
          prevEnergy += spectrum[j]
        }
        
        if (energy > prevEnergy) {
          hash |= (1 << i)
        }
      }
    }
    
    return hash
  }

  // Video fingerprinting using perceptual hashing
  generateVideoFingerprint(frames: ImageData[]): number[][] {
    const fingerprints: number[][] = []
    
    for (const frame of frames) {
      const hash = this.perceptualHash(frame)
      fingerprints.push(hash)
    }
    
    return fingerprints
  }

  // Perceptual hash for video frames
  private perceptualHash(imageData: ImageData): number[] {
    const { width, height, data } = imageData
    const grayScale: number[] = []
    
    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      grayScale.push(gray)
    }
    
    // Resize to 8x8 for DCT
    const resized = this.resize(grayScale, width, height, 8, 8)
    
    // Apply DCT
    const dct = this.dct2d(resized, 8, 8)
    
    // Extract low-frequency components
    const hash: number[] = []
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (i + j < 8) {
          hash.push(dct[i * 8 + j])
        }
      }
    }
    
    return hash
  }

  private resize(data: number[], oldW: number, oldH: number, newW: number, newH: number): number[] {
    const resized: number[] = new Array(newW * newH)
    const xRatio = oldW / newW
    const yRatio = oldH / newH
    
    for (let i = 0; i < newH; i++) {
      for (let j = 0; j < newW; j++) {
        const x = Math.floor(j * xRatio)
        const y = Math.floor(i * yRatio)
        resized[i * newW + j] = data[y * oldW + x]
      }
    }
    
    return resized
  }

  private dct2d(data: number[], width: number, height: number): number[] {
    const result: number[] = new Array(width * height)
    
    for (let u = 0; u < height; u++) {
      for (let v = 0; v < width; v++) {
        let sum = 0
        
        for (let x = 0; x < height; x++) {
          for (let y = 0; y < width; y++) {
            sum += data[x * width + y] * 
                   Math.cos((2 * x + 1) * u * Math.PI / (2 * height)) *
                   Math.cos((2 * y + 1) * v * Math.PI / (2 * width))
          }
        }
        
        const cu = u === 0 ? 1 / Math.sqrt(2) : 1
        const cv = v === 0 ? 1 / Math.sqrt(2) : 1
        
        result[u * width + v] = 0.25 * cu * cv * sum
      }
    }
    
    return result
  }

  // Store fingerprints with LSH for fast matching
  storeFingerprint(videoId: string, audioFp: number[], videoFp: number[][]): void {
    this.audioFingerprints.set(videoId, {
      videoId,
      fingerprint: audioFp,
      duration: audioFp.length * 0.023, // Assuming 23ms per frame
      sampleRate: 44100,
      timestamp: Date.now()
    })
    
    this.videoFingerprints.set(videoId, {
      videoId,
      frames: videoFp,
      duration: videoFp.length / 30, // Assuming 30 FPS
      frameRate: 30,
      timestamp: Date.now()
    })
    
    // Create LSH bands for fast similarity search
    this.createLSHBands(videoId, audioFp)
  }

  private createLSHBands(videoId: string, fingerprint: number[]): void {
    const bandSize = 5
    const numBands = Math.floor(fingerprint.length / bandSize)
    
    for (let i = 0; i < numBands; i++) {
      const band = fingerprint.slice(i * bandSize, (i + 1) * bandSize)
      const bandHash = this.hashBand(band)
      
      if (!this.hashBands.has(bandHash)) {
        this.hashBands.set(bandHash, new Set())
      }
      this.hashBands.get(bandHash)!.add(videoId)
    }
  }

  private hashBand(band: number[]): string {
    return band.map(x => x.toString(16)).join('')
  }

  // Find copyright matches
  findMatches(videoId: string, threshold: number = 0.8): CopyrightMatch[] {
    const audioFp = this.audioFingerprints.get(videoId)
    const videoFp = this.videoFingerprints.get(videoId)
    
    if (!audioFp || !videoFp) return []
    
    const matches: CopyrightMatch[] = []
    const candidates = this.findCandidates(audioFp.fingerprint)
    
    for (const candidateId of candidates) {
      if (candidateId === videoId) continue
      
      const candidateAudio = this.audioFingerprints.get(candidateId)
      const candidateVideo = this.videoFingerprints.get(candidateId)
      
      if (!candidateAudio || !candidateVideo) continue
      
      const audioSimilarity = this.calculateAudioSimilarity(audioFp.fingerprint, candidateAudio.fingerprint)
      const videoSimilarity = this.calculateVideoSimilarity(videoFp.frames, candidateVideo.frames)
      
      if (audioSimilarity > threshold || videoSimilarity > threshold) {
        const matchType = audioSimilarity > threshold && videoSimilarity > threshold ? 'both' :
                         audioSimilarity > threshold ? 'audio' : 'video'
        
        matches.push({
          originalVideoId: candidateId,
          matchedVideoId: videoId,
          confidence: Math.max(audioSimilarity, videoSimilarity),
          matchType,
          segments: this.findMatchingSegments(audioFp.fingerprint, candidateAudio.fingerprint)
        })
      }
    }
    
    return matches.sort((a, b) => b.confidence - a.confidence)
  }

  private findCandidates(fingerprint: number[]): Set<string> {
    const candidates = new Set<string>()
    const bandSize = 5
    const numBands = Math.floor(fingerprint.length / bandSize)
    
    for (let i = 0; i < numBands; i++) {
      const band = fingerprint.slice(i * bandSize, (i + 1) * bandSize)
      const bandHash = this.hashBand(band)
      const bandCandidates = this.hashBands.get(bandHash)
      
      if (bandCandidates) {
        for (const candidate of bandCandidates) {
          candidates.add(candidate)
        }
      }
    }
    
    return candidates
  }

  private calculateAudioSimilarity(fp1: number[], fp2: number[]): number {
    const minLength = Math.min(fp1.length, fp2.length)
    let matches = 0
    
    for (let i = 0; i < minLength; i++) {
      // Hamming distance for hash comparison
      const xor = fp1[i] ^ fp2[i]
      const hammingDistance = this.popCount(xor)
      
      if (hammingDistance < 8) { // Threshold for similar hashes
        matches++
      }
    }
    
    return matches / minLength
  }

  private calculateVideoSimilarity(frames1: number[][], frames2: number[][]): number {
    const minFrames = Math.min(frames1.length, frames2.length)
    let totalSimilarity = 0
    
    for (let i = 0; i < minFrames; i++) {
      const similarity = this.cosineSimilarity(frames1[i], frames2[i])
      totalSimilarity += similarity
    }
    
    return totalSimilarity / minFrames
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (let i = 0; i < Math.min(vec1.length, vec2.length); i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }

  private popCount(n: number): number {
    let count = 0
    while (n) {
      count += n & 1
      n >>>= 1
    }
    return count
  }

  private findMatchingSegments(fp1: number[], fp2: number[]): Array<{startTime: number, endTime: number, confidence: number}> {
    const segments: Array<{startTime: number, endTime: number, confidence: number}> = []
    const windowSize = 50
    const stepSize = 10
    
    for (let i = 0; i < fp1.length - windowSize; i += stepSize) {
      const window1 = fp1.slice(i, i + windowSize)
      
      for (let j = 0; j < fp2.length - windowSize; j += stepSize) {
        const window2 = fp2.slice(j, j + windowSize)
        const similarity = this.calculateAudioSimilarity(window1, window2)
        
        if (similarity > 0.8) {
          segments.push({
            startTime: i * 0.023, // Convert to seconds
            endTime: (i + windowSize) * 0.023,
            confidence: similarity
          })
        }
      }
    }
    
    return segments
  }
}