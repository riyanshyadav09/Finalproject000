'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { VideoGrid } from '@/components/video/video-grid'
import { Button } from '@/components/ui/button'
import { Filter, Search } from 'lucide-react'

const generateMovies = (count: number) => {
  const movieTitles = [
    'The Last Stand', 'Midnight Runner', 'City Lights', 'Ocean Deep', 'Mountain Peak',
    'Desert Storm', 'Arctic Freeze', 'Jungle Quest', 'Space Odyssey', 'Time Traveler',
    'Dark Shadows', 'Bright Future', 'Lost Kingdom', 'Hidden Treasure', 'Ancient Secrets',
    'Modern Warfare', 'Silent Night', 'Loud Thunder', 'Gentle Rain', 'Wild Fire'
  ]
  
  const movies = []
  for (let i = 1; i <= count; i++) {
    movies.push({
      id: `movie-${i}`,
      title: movieTitles[i % movieTitles.length] + ` ${Math.floor(i / movieTitles.length) + 1}`,
      description: 'An epic cinematic experience that will leave you breathless',
      thumbnail: `https://images.unsplash.com/photo-${1440000000000 + i * 100000}?w=300&h=450&fit=crop`,
      duration: 7200 + i * 100,
      views: Math.floor(Math.random() * 5000000),
      isPremium: i % 3 === 0,
      uploader: { username: 'StreamFlix Studios', avatar: '' },
      averageRating: 4 + Math.random(),
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    })
  }
  return movies
}

const mockMovies = generateMovies(100)

export default function MoviesPage() {
  const [movies, setMovies] = useState(mockMovies)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'premium' && movie.isPremium) ||
      (filter === 'free' && !movie.isPremium)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-20 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Movies</h1>
          <p className="text-gray-400 text-lg">Discover amazing movies from around the world</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700"
            >
              <option value="all">All Movies</option>
              <option value="premium">Premium Only</option>
              <option value="free">Free Movies</option>
            </select>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-700 focus:border-netflix-red"
            />
          </div>
        </div>

        {/* Movies Grid */}
        <VideoGrid videos={filteredMovies} />
      </div>
    </div>
  )
}