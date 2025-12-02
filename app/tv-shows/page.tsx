'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { VideoGrid } from '@/components/video/video-grid'
import { Button } from '@/components/ui/button'
import { Tv, Star, Calendar } from 'lucide-react'

const generateTVShows = (count: number) => {
  const showTitles = [
    'Dark Mysteries', 'Comedy Central', 'Drama Queens', 'Action Heroes', 'Sci-Fi Adventures',
    'Horror Nights', 'Romance Stories', 'Thriller Zone', 'Fantasy Realm', 'Documentary Series',
    'Crime Files', 'Medical Drama', 'Legal Eagles', 'Tech World', 'Nature Watch'
  ]
  
  const shows = []
  for (let i = 1; i <= count; i++) {
    shows.push({
      id: `show-${i}`,
      title: showTitles[i % showTitles.length] + ` Season ${Math.floor(i / showTitles.length) + 1}`,
      description: 'Binge-worthy series that will keep you hooked for hours',
      thumbnail: `https://images.unsplash.com/photo-${1540000000000 + i * 100000}?w=300&h=450&fit=crop`,
      duration: 2700 + i * 50,
      views: Math.floor(Math.random() * 8000000),
      isPremium: i % 4 === 0,
      uploader: { username: 'StreamFlix Originals', avatar: '' },
      averageRating: 4 + Math.random(),
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    })
  }
  return shows
}

const mockTVShows = generateTVShows(100)

export default function TVShowsPage() {
  const [shows, setShows] = useState(mockTVShows)
  const [selectedGenre, setSelectedGenre] = useState('all')

  const genres = ['all', 'drama', 'comedy', 'thriller', 'sci-fi', 'documentary']

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-20 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Tv className="h-8 w-8 text-netflix-red" />
            <h1 className="text-4xl font-bold">TV Shows</h1>
          </div>
          <p className="text-gray-400 text-lg">Binge-watch the best series and shows</p>
        </div>

        {/* Genre Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Browse by Genre</h3>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "netflix" : "outline"}
                onClick={() => setSelectedGenre(genre)}
                className="capitalize"
              >
                {genre === 'all' ? 'All Genres' : genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            Top Rated Shows
          </h2>
          <VideoGrid videos={shows} />
        </div>

        {/* Recently Added */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Calendar className="h-6 w-6 text-blue-500 mr-2" />
            Recently Added
          </h2>
          <VideoGrid videos={shows} />
        </div>
      </div>
    </div>
  )
}