'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Play, Info, Plus } from 'lucide-react'

interface FeaturedVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  hlsUrl: string
  duration: number
  isPremium: boolean
}

export function HeroSection() {
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedVideo()
  }, [])

  const fetchFeaturedVideo = async () => {
    try {
      const response = await fetch('/api/videos/featured?limit=1')
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        setFeaturedVideo(data.data[0])
      }
    } catch (error) {
      console.error('Error fetching featured video:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="relative h-screen bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-netflix-red"></div>
      </div>
    )
  }

  if (!featuredVideo) {
    return (
      <div className="relative h-screen bg-gradient-to-r from-netflix-red to-red-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">StreamFlix</h1>
          <p className="text-xl mb-8">Premium Video Streaming Platform</p>
          <Button size="lg" variant="secondary">
            Explore Content
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Video/Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${featuredVideo.thumbnail})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {featuredVideo.isPremium && (
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-semibold">
                    PREMIUM
                  </span>
                </div>
              )}

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                {featuredVideo.title}
              </h1>

              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-xl">
                {featuredVideo.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 text-lg"
                >
                  <Play className="mr-2 h-6 w-6 fill-current" />
                  Play
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-gray-600/70 text-white hover:bg-gray-600/90 font-semibold px-8 py-3 text-lg backdrop-blur-sm"
                >
                  <Info className="mr-2 h-6 w-6" />
                  More Info
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/20 font-semibold px-8 py-3 text-lg backdrop-blur-sm border border-white/30"
                >
                  <Plus className="mr-2 h-6 w-6" />
                  My List
                </Button>
              </div>

              {/* Video Info */}
              <div className="flex items-center space-x-4 mt-8 text-sm text-gray-300">
                <span className="bg-red-600 px-2 py-1 rounded text-white font-semibold">
                  HD
                </span>
                <span>{Math.floor(featuredVideo.duration / 60)} min</span>
                <span>2024</span>
                <span className="border border-gray-500 px-2 py-1 rounded text-xs">
                  13+
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
      >
        <div className="animate-bounce">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </motion.div>
    </div>
  )
}