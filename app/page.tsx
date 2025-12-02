'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { VideoGrid } from '@/components/video/video-grid'
import { Navbar } from '@/components/layout/navbar'
import { useAuth } from '@/lib/auth/use-auth'
import { Play, Info, ChevronLeft, ChevronRight, TrendingUp, Crown, Clock, Star } from 'lucide-react'
import Image from 'next/image'

const bannerMovies = [
  {
    id: 1,
    title: 'The Last Kingdom',
    description: 'An epic tale of warriors, kingdoms, and destiny in medieval England',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop',
    rating: 4.8,
    year: 2024
  },
  {
    id: 2,
    title: 'Neon Nights',
    description: 'A cyberpunk thriller set in a dystopian future where technology rules all',
    image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1920&h=1080&fit=crop',
    rating: 4.6,
    year: 2024
  },
  {
    id: 3,
    title: 'Ocean Deep',
    description: 'Dive into the mysterious depths of the ocean in this breathtaking documentary',
    image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=1920&h=1080&fit=crop',
    rating: 4.9,
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

export default function HomePage() {
  const { user } = useAuth()
  const [currentBanner, setCurrentBanner] = useState(0)
  const [trendingMovies] = useState(generateMovies(20, 'Trending'))
  const [premiumMovies] = useState(generateMovies(20, 'Premium'))
  const [thisWeekMovies] = useState(generateMovies(20, 'This Week'))
  const [thisMonthMovies] = useState(generateMovies(20, 'This Month'))
  const [latestMovies] = useState(generateMovies(20, 'Latest'))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerMovies.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % bannerMovies.length)
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + bannerMovies.length) % bannerMovies.length)

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main>
        {/* Hero Banner Slider */}
        <div className="relative h-screen">
          {bannerMovies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentBanner ? 1 : 0 }}
              transition={{ duration: 1 }}
              className={`absolute inset-0 ${index === currentBanner ? 'z-10' : 'z-0'}`}
            >
              <div className="relative h-full w-full">
                <Image
                  src={movie.image}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-2xl"
                  >
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">{movie.title}</h1>
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="flex items-center text-yellow-500">
                        <Star className="h-5 w-5 fill-current mr-1" />
                        {movie.rating}
                      </span>
                      <span>{movie.year}</span>
                      <span className="bg-red-600 px-2 py-1 rounded text-sm">HD</span>
                    </div>
                    <p className="text-lg md:text-xl text-gray-300 mb-6">{movie.description}</p>
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
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Banner Navigation */}
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-3 rounded-full"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-3 rounded-full"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          {/* Banner Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {bannerMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentBanner ? 'w-8 bg-netflix-red' : 'w-4 bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="-mt-32 relative z-20 px-4 md:px-8 lg:px-16 space-y-12 pb-20">
          {/* Trending Now */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="h-8 w-8 text-netflix-red" />
              <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
            </div>
            <VideoGrid videos={trendingMovies} />
          </motion.section>

          {/* Premium Content */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Crown className="h-8 w-8 text-yellow-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Premium Collection</h2>
            </div>
            <VideoGrid videos={premiumMovies} />
          </motion.section>

          {/* This Week */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="h-8 w-8 text-blue-500" />
              <h2 className="text-2xl md:text-3xl font-bold">This Week's Picks</h2>
            </div>
            <VideoGrid videos={thisWeekMovies} />
          </motion.section>

          {/* This Month */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Star className="h-8 w-8 text-purple-500" />
              <h2 className="text-2xl md:text-3xl font-bold">This Month's Best</h2>
            </div>
            <VideoGrid videos={thisMonthMovies} />
          </motion.section>

          {/* Latest Releases */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Play className="h-8 w-8 text-green-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Latest Releases</h2>
            </div>
            <VideoGrid videos={latestMovies} />
          </motion.section>
        </div>
      </main>
    </div>
  )
}