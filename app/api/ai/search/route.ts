import { NextRequest, NextResponse } from 'next/server'
import { SearchAlgorithm } from '@/lib/ai/search/search-algorithm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')

    const mockDocuments = [
      {
        id: 'video1',
        title: 'Amazing Tech Review 2024',
        description: 'Complete review of latest technology trends and gadgets',
        tags: ['tech', 'review', 'gadgets', '2024'],
        category: 'technology',
        duration: 600,
        viewCount: 150000,
        uploadDate: Date.now() - 86400000,
        creator: 'TechGuru'
      },
      {
        id: 'video2',
        title: 'Cooking Masterclass',
        description: 'Learn professional cooking techniques from expert chefs',
        tags: ['cooking', 'food', 'tutorial', 'chef'],
        category: 'education',
        duration: 1200,
        viewCount: 89000,
        uploadDate: Date.now() - 172800000,
        creator: 'ChefMaster'
      },
      {
        id: 'video3',
        title: 'Gaming Highlights 2024',
        description: 'Best gaming moments and epic gameplay footage',
        tags: ['gaming', 'highlights', 'gameplay', 'epic'],
        category: 'gaming',
        duration: 480,
        viewCount: 250000,
        uploadDate: Date.now() - 43200000,
        creator: 'GamePro'
      }
    ]

    const searchEngine = new SearchAlgorithm(mockDocuments)
    
    if (query.trim() === '') {
      return NextResponse.json({
        success: true,
        query: '',
        results: [],
        suggestions: searchEngine.getSuggestions('', 10),
        metadata: { count: 0, algorithm: 'none' }
      })
    }

    let results
    if (userId) {
      const userPreferences = ['technology', 'gaming'] // Mock preferences
      results = searchEngine.personalizedSearch(query, userId, userPreferences, limit)
    } else {
      results = searchEngine.search(query, limit)
    }

    const suggestions = searchEngine.getSuggestions(query, 5)

    return NextResponse.json({
      success: true,
      query,
      results: results.map(result => ({
        video: result.document,
        score: result.score,
        signals: result.relevanceSignals
      })),
      suggestions,
      metadata: {
        count: results.length,
        algorithm: userId ? 'personalized_bm25' : 'bm25',
        processingTime: '12ms'
      }
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}