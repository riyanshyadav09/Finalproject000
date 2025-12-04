export interface ConnectionInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g'
  downlink: number
  rtt: number
  saveData: boolean
}

export class NetworkMonitor {
  private static instance: NetworkMonitor
  private connectionInfo: ConnectionInfo | null = null
  private bandwidthHistory: number[] = []
  private rttHistory: number[] = []
  
  static getInstance(): NetworkMonitor {
    if (!this.instance) {
      this.instance = new NetworkMonitor()
    }
    return this.instance
  }

  constructor() {
    this.initializeNetworkAPI()
    this.startPerformanceMonitoring()
  }

  private initializeNetworkAPI(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        this.connectionInfo = {
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false
        }
        
        connection.addEventListener('change', () => {
          this.connectionInfo = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
          }
        })
      }
    }
  }

  private startPerformanceMonitoring(): void {
    // Monitor performance entries for network timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
            this.updateNetworkMetrics(entry as PerformanceNavigationTiming)
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation', 'resource'] })
    }
  }

  private updateNetworkMetrics(entry: PerformanceNavigationTiming): void {
    const downloadTime = entry.responseEnd - entry.responseStart
    const transferSize = (entry as any).transferSize || 0
    
    if (downloadTime > 0 && transferSize > 0) {
      const bandwidth = (transferSize * 8) / (downloadTime / 1000) // bps
      this.bandwidthHistory.push(bandwidth)
      
      // Keep only last 10 measurements
      if (this.bandwidthHistory.length > 10) {
        this.bandwidthHistory.shift()
      }
    }
    
    if (entry.domainLookupEnd && entry.domainLookupStart) {
      const rtt = entry.domainLookupEnd - entry.domainLookupStart
      this.rttHistory.push(rtt)
      
      if (this.rttHistory.length > 10) {
        this.rttHistory.shift()
      }
    }
  }

  getEstimatedBandwidth(): number {
    if (this.bandwidthHistory.length === 0) {
      return this.connectionInfo?.downlink ? this.connectionInfo.downlink * 1000000 : 1000000
    }
    
    // Use exponential weighted moving average
    let weightedSum = 0
    let weightSum = 0
    
    for (let i = 0; i < this.bandwidthHistory.length; i++) {
      const weight = Math.pow(0.8, this.bandwidthHistory.length - 1 - i)
      weightedSum += this.bandwidthHistory[i] * weight
      weightSum += weight
    }
    
    return weightedSum / weightSum
  }

  getEstimatedRTT(): number {
    if (this.rttHistory.length === 0) {
      return this.connectionInfo?.rtt || 100
    }
    
    return this.rttHistory.reduce((sum, rtt) => sum + rtt, 0) / this.rttHistory.length
  }

  getConnectionType(): string {
    return this.connectionInfo?.effectiveType || '4g'
  }

  isSlowConnection(): boolean {
    const bandwidth = this.getEstimatedBandwidth()
    const rtt = this.getEstimatedRTT()
    
    return bandwidth < 500000 || rtt > 300 || this.connectionInfo?.saveData === true
  }

  measureSegmentDownload(url: string, onProgress?: (loaded: number, total: number) => void): Promise<{
    data: ArrayBuffer
    downloadTime: number
    bytes: number
  }> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now()
      const xhr = new XMLHttpRequest()
      
      xhr.open('GET', url, true)
      xhr.responseType = 'arraybuffer'
      
      xhr.onprogress = (event) => {
        if (onProgress && event.lengthComputable) {
          onProgress(event.loaded, event.total)
        }
      }
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const downloadTime = performance.now() - startTime
          const bytes = xhr.response.byteLength
          
          resolve({
            data: xhr.response,
            downloadTime,
            bytes
          })
        } else {
          reject(new Error(`HTTP ${xhr.status}`))
        }
      }
      
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.send()
    })
  }
}