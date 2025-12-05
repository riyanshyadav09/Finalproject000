'use client'

import { Play, Clock, Star, Crown } from 'lucide-react'
import Image from 'next/image'

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

export function VideoCard({ video, isHovered }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:00` : `${minutes}:00`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  return (
    <div className="group relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105">
      <div className="relative aspect-video">
        <Image
          src={video.thumbnail || `https://images.unsplash.com/photo-1440000000000?w=400&h=225&fit=crop`}
          alt={video.title}
          fill
          className="object-cover"
        />
        
        {video.isPremium && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold flex items-center">
            <Crown className="w-3 h-3 mr-1" />
            PREMIUM
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formatDuration(video.duration || 7200)}
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatViews(video.views)} views</span>
          {video.averageRating && (
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              {video.averageRating.toFixed(1)}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">{video.uploader.username}</p>
      </div>
    </div>
  )
}