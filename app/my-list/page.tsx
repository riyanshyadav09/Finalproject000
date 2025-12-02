'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { VideoGrid } from '@/components/video/video-grid'
import { Button } from '@/components/ui/button'
import { Heart, Clock, Download, Trash2 } from 'lucide-react'

const mockWatchlist = [
  {
    id: '1',
    title: 'Stranger Things',
    description: 'Supernatural drama series',
    thumbnail: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Stranger+Things',
    duration: 3600,
    views: 5000000,
    isPremium: true,
    uploader: { username: 'Netflix', avatar: '' },
    averageRating: 4.6,
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    title: 'The Dark Knight',
    description: 'Batman vs Joker',
    thumbnail: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Batman',
    duration: 9120,
    views: 1800000,
    isPremium: false,
    uploader: { username: 'Warner Bros', avatar: '' },
    averageRating: 4.9,
    createdAt: '2024-01-15'
  }
]

const mockDownloads = [
  {
    id: '3',
    title: 'Inception',
    description: 'Mind-bending thriller',
    thumbnail: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Inception',
    duration: 8880,
    views: 1200000,
    isPremium: true,
    uploader: { username: 'Warner Bros', avatar: '' },
    averageRating: 4.7,
    createdAt: '2024-01-10'
  }
]

export default function MyListPage() {
  const [activeTab, setActiveTab] = useState('watchlist')
  const [watchlist, setWatchlist] = useState(mockWatchlist)
  const [downloads, setDownloads] = useState(mockDownloads)

  const removeFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-20 px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My List</h1>
          <p className="text-gray-400 text-lg">Your personal collection of favorites</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900 rounded-lg p-1 w-fit">
          <Button
            variant={activeTab === 'watchlist' ? 'netflix' : 'ghost'}
            onClick={() => setActiveTab('watchlist')}
            className="flex items-center space-x-2"
          >
            <Heart className="h-4 w-4" />
            <span>Watchlist ({watchlist.length})</span>
          </Button>
          <Button
            variant={activeTab === 'continue' ? 'netflix' : 'ghost'}
            onClick={() => setActiveTab('continue')}
            className="flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>Continue Watching</span>
          </Button>
          <Button
            variant={activeTab === 'downloads' ? 'netflix' : 'ghost'}
            onClick={() => setActiveTab('downloads')}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Downloads ({downloads.length})</span>
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'watchlist' && (
          <div>
            {watchlist.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Your Watchlist</h2>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                <VideoGrid videos={watchlist} />
              </>
            ) : (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
                <p className="text-gray-400 mb-6">Add movies and shows you want to watch later</p>
                <Button variant="netflix">Browse Content</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'continue' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Continue Watching</h2>
            <div className="text-center py-16">
              <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No videos in progress</h3>
              <p className="text-gray-400">Start watching something to see it here</p>
            </div>
          </div>
        )}

        {activeTab === 'downloads' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Downloaded Videos</h2>
            {downloads.length > 0 ? (
              <VideoGrid videos={downloads} />
            ) : (
              <div className="text-center py-16">
                <Download className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No downloads yet</h3>
                <p className="text-gray-400">Download videos to watch offline</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}