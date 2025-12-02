'use client'

import { useState } from 'react'
import { VideoPlayer } from '@/components/video/video-player'
import { VideoGrid } from '@/components/video/video-grid'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown, Share, Download, Plus, Star, Eye } from 'lucide-react'

const mockVideo = {
  id: '1',
  title: 'Avengers: Endgame',
  description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins.',
  thumbnail: 'https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=Avengers',
  hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  duration: 10800,
  views: 2500000,
  likes: 45000,
  isPremium: true,
  uploader: { username: 'Marvel Studios', avatar: '' },
  averageRating: 4.8,
  createdAt: '2024-01-15'
}

const relatedVideos = [
  {
    id: '2',
    title: 'Iron Man',
    description: 'Tony Stark becomes Iron Man',
    thumbnail: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Iron+Man',
    duration: 7200,
    views: 1800000,
    isPremium: false,
    uploader: { username: 'Marvel Studios', avatar: '' },
    averageRating: 4.5,
    createdAt: '2024-01-05'
  }
]

export default function WatchPage() {
  const [isLiked, setIsLiked] = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      <VideoPlayer
        src={mockVideo.hlsUrl}
        poster={mockVideo.thumbnail}
        title={mockVideo.title}
        className="w-full aspect-video"
      />

      <div className="px-4 md:px-8 lg:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{mockVideo.title}</h1>
            
            <div className="flex items-center space-x-6 text-gray-400 mb-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{mockVideo.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{mockVideo.averageRating}/5</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant={isLiked ? "netflix" : "outline"}
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center space-x-2"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{mockVideo.likes.toLocaleString()}</span>
              </Button>

              <Button
                variant={isInWatchlist ? "netflix" : "outline"}
                onClick={() => setIsInWatchlist(!isInWatchlist)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Watchlist</span>
              </Button>

              <Button variant="outline" className="flex items-center space-x-2">
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6">{mockVideo.description}</p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Related Videos</h3>
              <VideoGrid videos={relatedVideos} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}