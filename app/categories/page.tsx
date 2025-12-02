'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { VideoGrid } from '@/components/video/video-grid'
import { Button } from '@/components/ui/button'
import { 
  Film, 
  Tv, 
  Zap, 
  Heart, 
  Laugh, 
  Skull, 
  Sword, 
  Rocket,
  BookOpen,
  Music
} from 'lucide-react'

const categories = [
  { id: 'action', name: 'Action', icon: Zap, color: 'bg-red-600' },
  { id: 'comedy', name: 'Comedy', icon: Laugh, color: 'bg-yellow-600' },
  { id: 'drama', name: 'Drama', icon: Heart, color: 'bg-pink-600' },
  { id: 'horror', name: 'Horror', icon: Skull, color: 'bg-purple-600' },
  { id: 'adventure', name: 'Adventure', icon: Sword, color: 'bg-green-600' },
  { id: 'sci-fi', name: 'Sci-Fi', icon: Rocket, color: 'bg-blue-600' },
  { id: 'documentary', name: 'Documentary', icon: BookOpen, color: 'bg-indigo-600' },
  { id: 'music', name: 'Music', icon: Music, color: 'bg-orange-600' }
]

const mockCategoryVideos = {
  action: [
    {
      id: '1',
      title: 'John Wick',
      description: 'Action thriller',
      thumbnail: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=John+Wick',
      duration: 6600,
      views: 2000000,
      isPremium: true,
      uploader: { username: 'Lionsgate', avatar: '' },
      averageRating: 4.5,
      createdAt: '2024-01-15'
    }
  ],
  comedy: [
    {
      id: '2',
      title: 'The Hangover',
      description: 'Comedy adventure',
      thumbnail: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Hangover',
      duration: 6000,
      views: 1500000,
      isPremium: false,
      uploader: { username: 'Warner Bros', avatar: '' },
      averageRating: 4.2,
      createdAt: '2024-01-12'
    }
  ]
}

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('action')
  const [videos, setVideos] = useState(mockCategoryVideos.action)

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setVideos(mockCategoryVideos[categoryId as keyof typeof mockCategoryVideos] || [])
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-20 px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse by Category</h1>
          <p className="text-gray-400 text-lg">Discover content by your favorite genres</p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`
                  ${category.color} ${selectedCategory === category.id ? 'ring-4 ring-white' : ''}
                  rounded-lg p-6 text-center hover:scale-105 transition-transform duration-200
                `}
              >
                <IconComponent className="h-8 w-8 mx-auto mb-2 text-white" />
                <span className="text-white font-semibold text-sm">{category.name}</span>
              </button>
            )
          })}
        </div>

        {/* Selected Category Content */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            {(() => {
              const selectedCat = categories.find(cat => cat.id === selectedCategory)
              const IconComponent = selectedCat?.icon || Film
              return (
                <>
                  <div className={`${selectedCat?.color || 'bg-gray-600'} p-2 rounded-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold capitalize">{selectedCategory} Movies & Shows</h2>
                </>
              )
            })()}
          </div>

          {videos.length > 0 ? (
            <VideoGrid videos={videos} />
          ) : (
            <div className="text-center py-16">
              <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No content available</h3>
              <p className="text-gray-400">Check back later for new {selectedCategory} content</p>
            </div>
          )}
        </div>

        {/* Popular Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Popular This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((category) => {
              const IconComponent = category.icon
              return (
                <div key={category.id} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`${category.color} p-2 rounded-lg`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Trending {category.name.toLowerCase()} content this week
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    Explore {category.name}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}