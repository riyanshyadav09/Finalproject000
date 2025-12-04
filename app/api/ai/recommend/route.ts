import { NextRequest, NextResponse } from 'next/server'
import { CollaborativeFiltering } from '@/lib/ai/recommendation/collaborative-filtering'
import { DeepNeuralNetwork } from '@/lib/ai/recommendation/deep-neural-network'
import { ReinforcementLearningRanker } from '@/lib/ai/ranking/reinforcement-learning'
import { AuthMiddleware } from '@/lib/security/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const auth = await AuthMiddleware.validateAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, algorithm = 'hybrid', limit = 20, context } = await request.json()

    const interactions = [
      { userId: 'user1', videoId: 'video1', rating: 4.5, watchTime: 180, timestamp: Date.now() },
      { userId: 'user1', videoId: 'video2', rating: 3.8, watchTime: 120, timestamp: Date.now() },
      { userId: 'user2', videoId: 'video1', rating: 4.2, watchTime: 200, timestamp: Date.now() }
    ]

    let recommendations: string[] = []

    switch (algorithm) {
      case 'collaborative':
        const cf = new CollaborativeFiltering(interactions)
        recommendations = cf.recommendItems(userId, limit)
        break

      case 'deep_learning':
        const dnn = new DeepNeuralNetwork()
        const candidates = ['video1', 'video2', 'video3', 'video4', 'video5']
        const dnnRecs = dnn.generateRecommendations(userId, candidates, limit)
        recommendations = dnnRecs.map(r => r.videoId)
        break

      case 'reinforcement':
        const rl = new ReinforcementLearningRanker()
        const rlCandidates = ['video1', 'video2', 'video3', 'video4', 'video5']
        const rlRecs = rl.rankVideos(userId, rlCandidates, context || {
          position: 1,
          sessionLength: 300,
          timeOfDay: Date.now(),
          deviceType: 'desktop'
        })
        recommendations = rlRecs.map(r => r.videoId)
        break

      case 'hybrid':
      default:
        const cfRecs = new CollaborativeFiltering(interactions).recommendItems(userId, limit)
        const dnnInstance = new DeepNeuralNetwork()
        const dnnCandidates = ['video1', 'video2', 'video3', 'video4', 'video5']
        const dnnResults = dnnInstance.generateRecommendations(userId, dnnCandidates, limit)
        
        const hybridScores = new Map<string, number>()
        
        cfRecs.forEach((videoId, index) => {
          hybridScores.set(videoId, (hybridScores.get(videoId) || 0) + (limit - index) * 0.4)
        })
        
        dnnResults.forEach((result, index) => {
          hybridScores.set(result.videoId, (hybridScores.get(result.videoId) || 0) + result.score * 0.6)
        })
        
        recommendations = Array.from(hybridScores.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([videoId]) => videoId)
        break
    }

    return NextResponse.json({
      success: true,
      userId,
      algorithm,
      recommendations,
      metadata: {
        count: recommendations.length,
        timestamp: Date.now(),
        context: context || null
      }
    })

  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json({ error: 'Recommendation failed' }, { status: 500 })
  }
}