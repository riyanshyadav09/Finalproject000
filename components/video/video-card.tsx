'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown,
  Clock,
  Eye,
  Star,
  Crown
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'

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

interface VideoCardProps {
  video: Video
  isHovered?: boolean
}

export function VideoCard({ video, isHovered = false }: VideoCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id })
      })
      
      if (response.ok) {
        setIsInWatchlist(!isInWatchlist)
      }
    } catch (error) {
      console.error('Error updating watchlist:', error)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await fetch('/api/videos/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, action: 'like' })
      })
    } catch (error) {
      console.error('Error liking video:', error)
    }
  }

  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await fetch('/api/videos/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, action: 'dislike' })
      })
    } catch (error) {
      console.error('Error disliking video:', error)
    }
  }

  return (
    <Link href={`/watch/${video.id}`} className="block">
      <div className="relative group cursor-pointer">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
          {!imageError && video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Premium Badge */}
          {video.isPremium && (
            <div className="absolute top-2 left-2">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <Crown className="h-3 w-3 mr-1" />
                PREMIUM
              </div>
            </div>
          )}

          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isHovered ? 1 : 0, 
                opacity: isHovered ? 1 : 0 
              }}
              transition={{ duration: 0.2 }}
              className="bg-white/90 rounded-full p-3"
            >
              <Play className="h-6 w-6 text-black fill-current" />
            </motion.div>
          </div>
        </div>

        {/* Expanded Info (on hover) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-gray-900 rounded-b-lg shadow-2xl border border-gray-700 p-4 z-20"
            >
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                {video.title}
              </h3>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200 rounded-full p-2"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-gray-700 rounded-full p-2"
                    onClick={handleAddToWatchlist}
                  >
                    <Plus className={`h-4 w-4 ${isInWatchlist ? 'rotate-45' : ''} transition-transform`} />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-gray-700 rounded-full p-2"
                    onClick={handleLike}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-gray-700 rounded-full p-2"
                    onClick={handleDislike}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-gray-700 rounded-full p-2"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Video Stats */}
              <div className="flex items-center space-x-4 text-xs text-gray-400 mb-2">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>

                {video.averageRating && video.averageRating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span>{video.averageRating.toFixed(1)}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <p className="text-gray-300 text-xs line-clamp-2 mb-2">
                  {video.description}
                </p>
              )}

              {/* Uploader */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  {video.uploader.avatar ? (
                    <Image
                      src={video.uploader.avatar}
                      alt={video.uploader.username}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-xs text-white">
                      {video.uploader.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {video.uploader.username}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Basic Info (always visible) */}
        <div className="mt-3 px-1">
          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
            {video.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{video.uploader.username}</span>
            <span>{video.views.toLocaleString()} views</span>
          </div>
        </div>
      </div>
    </Link>
  )
}