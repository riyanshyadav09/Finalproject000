'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { VideoCard } from './video-card'

interface Video {
  id: string
  title: string
  description?: string
  thumbnail?: string
  duration?: number
  views: number
  isPremium: boolean
  uploader: {
    username: string
    avatar?: string
  }
  averageRating?: number
  createdAt: string
}

interface VideoGridProps {
  videos: Video[]
  className?: string
}

export function VideoGrid({ videos, className = '' }: VideoGridProps) {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)

  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm6 1a1 1 0 100 2h3a1 1 0 100-2H11z" />
            </svg>
          </div>
          <p className="text-lg font-medium">No videos available</p>
          <p className="text-sm">Check back later for new content</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}>
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
          whileHover={{ 
            scale: 1.05,
            zIndex: 10,
            transition: { duration: 0.2 }
          }}
          onHoverStart={() => setHoveredVideo(video.id)}
          onHoverEnd={() => setHoveredVideo(null)}
          className="relative"
        >
          <VideoCard 
            video={video} 
            isHovered={hoveredVideo === video.id}
          />
        </motion.div>
      ))}
    </div>
  )
}