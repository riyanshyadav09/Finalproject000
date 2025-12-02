'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { VideoCard } from './video-card'
import { Button } from '@/components/ui/button'
import { Grid, List, Filter, SortAsc } from 'lucide-react'

interface VideoGalleryProps {
  videos: any[]
  title?: string
  showFilters?: boolean
  viewMode?: 'grid' | 'list'
}

export function VideoGallery({ 
  videos, 
  title = "Video Gallery", 
  showFilters = true,
  viewMode: initialViewMode = 'grid'
}: VideoGalleryProps) {
  const [viewMode, setViewMode] = useState(initialViewMode)
  const [sortBy, setSortBy] = useState('newest')
  const [filterBy, setFilterBy] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const videosPerPage = 12

  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => {
      if (filterBy === 'all') return true
      if (filterBy === 'premium') return video.isPremium
      if (filterBy === 'free') return !video.isPremium
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'popular':
          return b.views - a.views
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0)
        default:
          return 0
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400">{filteredVideos.length} videos found</p>
        </div>

        {showFilters && (
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'netflix' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'netflix' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Dropdown */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 text-sm"
            >
              <option value="all">All Videos</option>
              <option value="premium">Premium Only</option>
              <option value="free">Free Videos</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        )}
      </div>

      {/* Video Grid/List */}
      {paginatedVideos.length > 0 ? (
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
              : 'space-y-4'
          }
        >
          {paginatedVideos.map((video, index) => (
            <motion.div
              key={video.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={viewMode === 'list' ? 'w-full' : ''}
            >
              {viewMode === 'grid' ? (
                <VideoCard video={video} />
              ) : (
                <div className="flex bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                  <img
                    src={video.thumbnail || 'https://via.placeholder.com/160x90/1a1a1a/ffffff?text=Video'}
                    alt={video.title}
                    className="w-40 h-24 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">{video.title}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{video.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{video.views?.toLocaleString()} views</span>
                      <span>{Math.floor(video.duration / 60)} min</span>
                      {video.averageRating && (
                        <span>★ {video.averageRating.toFixed(1)}</span>
                      )}
                      {video.isPremium && (
                        <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-semibold">
                          PREMIUM
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
          <p className="text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'netflix' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}