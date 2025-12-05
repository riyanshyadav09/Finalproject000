'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Info, Star } from '@/components/icons'
import Image from 'next/image'

const bannerMovies = [
  {
    id: 1,
    title: 'The Last Kingdom',
    description: 'An epic tale of warriors, kingdoms, and destiny in medieval England',
    image: '/api/placeholder/1920/1080',
    rating: 4.8,
    year: 2024
  }
]

const generateMovies = (count: number, category: string) => {
  const movies = []
  for (let i = 1; i <= count; i++) {
    movies.push({
      id: `${category}-${i}`,
      title: `${category} Movie ${i}`,
      description: `An amazing ${category.toLowerCase()} movie experience`,
      thumbnail: `/api/placeholder/300/450`,
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

export default function HomePage() {
  const [trendingMovies] = useState(generateMovies(10, 'Trending'))
  const currentBanner = bannerMovies[0]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-white font-bold text-xl ml-2">StreamFlix</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Sign In
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="pt-16">
        {/* Hero Banner */}
        <div className="relative h-screen">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-4">{currentBanner.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current mr-1" />
                  {currentBanner.rating}
                </span>
                <span>{currentBanner.year}</span>
                <span className="bg-red-600 px-2 py-1 rounded text-sm">HD</span>
              </div>
              <p className="text-lg md:text-xl text-gray-300 mb-6">{currentBanner.description}</p>
              <div className="flex space-x-4">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Play Now
                </Button>
                <Button size="lg" variant="outline" className="bg-gray-600/70 hover:bg-gray-600">
                  <Info className="mr-2 h-5 w-5" />
                  More Info
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="-mt-32 relative z-20 px-4 md:px-8 lg:px-16 space-y-12 pb-20">
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Trending Now</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trendingMovies.map((video) => (
                <div key={video.id} className="group relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105">
                  <div className="relative aspect-video bg-gray-800">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <Play className="w-12 h-12" />
                    </div>
                    
                    {video.isPremium && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                        PREMIUM
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                      2:00:00
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{Math.floor(video.views / 1000)}K views</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        {video.averageRating.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{video.uploader.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}