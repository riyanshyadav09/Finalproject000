'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { VideoGrid } from '@/components/video/video-grid'
import { HeroSection } from '@/components/layout/hero-section'
import { Navbar } from '@/components/layout/navbar'
import { useAuth } from '@/lib/auth/use-auth'

export default function HomePage() {
  const { user, loading } = useAuth()
  const [featuredVideos, setFeaturedVideos] = useState([])
  const [trendingVideos, setTrendingVideos] = useState([])

  useEffect(() => {
    // Fetch featured and trending videos
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const [featuredRes, trendingRes] = await Promise.all([
        fetch('/api/videos/featured'),
        fetch('/api/videos/trending')
      ])
      
      const featured = await featuredRes.json()
      const trending = await trendingRes.json()
      
      setFeaturedVideos(featured.data || [])
      setTrendingVideos(trending.data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-netflix-red"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Content Sections */}
        <div className="px-4 md:px-8 lg:px-16 space-y-12 pb-20">
          {/* Featured Content */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Featured</h2>
            <VideoGrid videos={featuredVideos} />
          </motion.section>

          {/* Trending Now */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Trending Now</h2>
            <VideoGrid videos={trendingVideos} />
          </motion.section>

          {/* Premium Upgrade CTA */}
          {user && user.role === 'USER' && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-r from-netflix-red to-red-700 rounded-lg p-8 text-center"
            >
              <h3 className="text-3xl font-bold mb-4">Upgrade to Premium</h3>
              <p className="text-lg mb-6">
                Unlock 4K streaming, offline downloads, and exclusive content
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-black hover:bg-gray-200"
              >
                Upgrade Now
              </Button>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  )
}