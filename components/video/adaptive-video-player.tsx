'use client'

import { useEffect, useRef, useState } from 'react'
import { DashPlayer } from '@/lib/video/streaming/dash-player'
import { QualityLevel, NetworkMetrics } from '@/lib/video/abr/abr-algorithm'
import { Button } from '@/components/ui/button'
import { Settings, Play, Pause, Volume2, Maximize } from 'lucide-react'

interface AdaptiveVideoPlayerProps {
  manifestUrl: string
  title?: string
  autoplay?: boolean
}

export function AdaptiveVideoPlayer({ manifestUrl, title, autoplay = false }: AdaptiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<DashPlayer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentQuality, setCurrentQuality] = useState<QualityLevel | null>(null)
  const [availableQualities, setAvailableQualities] = useState<QualityLevel[]>([])
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (videoRef.current && manifestUrl) {
      initializePlayer()
    }
    
    return () => {
      if (playerRef.current) {
        // Cleanup
      }
    }
  }, [manifestUrl])

  const initializePlayer = async () => {
    if (!videoRef.current) return
    
    try {
      setIsLoading(true)
      playerRef.current = new DashPlayer(videoRef.current)
      await playerRef.current.loadManifest(manifestUrl)
      
      setAvailableQualities(playerRef.current.getAvailableQualities())
      setCurrentQuality(playerRef.current.getCurrentQuality())
      
      // Start metrics monitoring
      const metricsInterval = setInterval(() => {
        if (playerRef.current) {
          setCurrentQuality(playerRef.current.getCurrentQuality())
          setNetworkMetrics(playerRef.current.getNetworkMetrics())
        }
      }, 1000)
      
      if (autoplay) {
        videoRef.current.play()
        setIsPlaying(true)
      }
      
      setIsLoading(false)
      
      return () => clearInterval(metricsInterval)
    } catch (error) {
      console.error('Player initialization failed:', error)
      setIsLoading(false)
    }
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleQualityChange = (qualityId: string) => {
    if (playerRef.current) {
      playerRef.current.setQuality(qualityId)
      setShowSettings(false)
    }
  }

  const formatBitrate = (bitrate: number): string => {
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)} Mbps`
    }
    return `${(bitrate / 1000).toFixed(0)} Kbps`
  }

  const getQualityLabel = (quality: QualityLevel): string => {
    const height = quality.resolution.split('x')[1]
    return `${height}p (${formatBitrate(quality.bitrate)})`
  }

  if (isLoading) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-white">Loading adaptive player...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-600 rounded mb-4">
            <div className="h-full bg-netflix-red rounded" style={{ width: '30%' }} />
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlayPause}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              
              <span className="text-white text-sm">
                {title || 'Video'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quality Indicator */}
              {currentQuality && (
                <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                  {getQualityLabel(currentQuality)}
                </div>
              )}
              
              {/* Network Metrics */}
              {networkMetrics && (
                <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                  {formatBitrate(networkMetrics.bandwidth)} | Buffer: {networkMetrics.bufferLevel.toFixed(1)}s
                </div>
              )}
              
              {/* Settings */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-48">
                    <div className="text-white text-sm font-medium mb-2">Quality</div>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleQualityChange('auto')}
                        className="block w-full text-left text-white text-sm hover:bg-white/20 px-2 py-1 rounded"
                      >
                        Auto (Recommended)
                      </button>
                      {availableQualities.map((quality) => (
                        <button
                          key={quality.id}
                          onClick={() => handleQualityChange(quality.id)}
                          className={`block w-full text-left text-sm hover:bg-white/20 px-2 py-1 rounded ${
                            currentQuality?.id === quality.id ? 'text-netflix-red' : 'text-white'
                          }`}
                        >
                          {getQualityLabel(quality)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}