'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { VideoGallery } from '@/components/video/video-gallery'
import { Button } from '@/components/ui/button'
import { Search, Trending, Clock, Star, Crown } from 'lucide-react'

const generateAllVideos = (count: number) => {
  const titles = [
    'Epic Adventure', 'Mystery Thriller', 'Romantic Comedy', 'Action Packed', 'Sci-Fi Journey',
    'Horror Story', 'Drama Series', 'Fantasy World', 'Documentary', 'Crime Investigation',
    'Space Exploration', 'Time Travel', 'Superhero Saga', 'Historical Epic', 'Modern Tale'
  ]
  
  const videos = []
  for (let i = 1; i <= count; i++) {
    videos.push({
      id: `video-${i}`,
      title: titles[i % titles.length] + ` ${Math.floor(i / titles.length) + 1}`,
      description: 'An unforgettable viewing experience with stunning visuals',
      thumbnail: `https://images.unsplash.com/photo-${1440000000000 + i * 150000}?w=300&h=450&fit=crop`,
      duration: 5400 + i * 120,
      views: Math.floor(Math.random() * 10000000),
      isPremium: i % 3 === 0,
      uploader: { username: 'StreamFlix', avatar: '' },
      averageRating: 3.5 + Math.random() * 1.5,
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    })
  }
  return videos
}

const mockAllVideos = generateAllVideos(100)

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('all')
  const [filteredVideos, setFilteredVideos] = useState(mockAllVideos)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredVideos(mockAllVideos)
    } else {
      const filtered = mockAllVideos.filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredVideos(filtered)
    }
  }

  const sections = [
    { id: 'all', name: 'All Content', icon: Search, count: mockAllVideos.length },
    { id: 'trending', name: 'Trending', icon: Trending, count: 12 },
    { id: 'recent', name: 'Recently Added', icon: Clock, count: 8 },
    { id: 'top-rated', name: 'Top Rated', icon: Star, count: 15 },
    { id: 'premium', name: 'Premium', icon: Crown, count: mockAllVideos.filter(v => v.isPremium).length }
  ]

  const getSectionVideos = (sectionId: string) => {
    switch (sectionId) {
      case 'trending':
        return mockAllVideos.sort((a, b) => b.views - a.views).slice(0, 12)
      case 'recent':
        return mockAllVideos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8)
      case 'top-rated':
        return mockAllVideos.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      case 'premium':
        return mockAllVideos.filter(video => video.isPremium)
      default:
        return filteredVideos
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-20 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse All Content</h1>
          <p className="text-gray-400 text-lg">Discover thousands of movies, TV shows, and documentaries</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for movies, TV shows, documentaries..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg pl-12 pr-4 py-4 border border-gray-700 focus:border-netflix-red focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const IconComponent = section.icon
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'netflix' : 'outline'}
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{section.name}</span>
                  <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                    {section.count}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Content Gallery */}
        <VideoGallery
          videos={getSectionVideos(activeSection)}
          title={sections.find(s => s.id === activeSection)?.name || 'All Content'}
          showFilters={true}
        />

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-netflix-red mb-2">
              {mockAllVideos.length}
            </div>
            <div className="text-gray-400">Total Videos</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {mockAllVideos.filter(v => v.isPremium).length}
            </div>
            <div className="text-gray-400">Premium Content</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {mockAllVideos.reduce((acc, v) => acc + v.views, 0).toLocaleString()}
            </div>
            <div className="text-gray-400">Total Views</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">
              {(mockAllVideos.reduce((acc, v) => acc + (v.averageRating || 0), 0) / mockAllVideos.length).toFixed(1)}
            </div>
            <div className="text-gray-400">Avg Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}