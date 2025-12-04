export interface WatchSession {
  userId: string
  videoId: string
  startTime: number
  endTime: number
  watchDuration: number
  videoDuration: number
  completionRate: number
  interactions: Array<{
    type: 'pause' | 'seek' | 'volume' | 'quality'
    timestamp: number
    value?: number
  }>
}

export interface UserProfile {
  userId: string
  demographics: {
    age?: number
    gender?: string
    location?: string
  }
  preferences: {
    categories: string[]
    avgSessionLength: number
    preferredTime: number[]
    deviceTypes: string[]
  }
  behavior: {
    skipRate: number
    completionRate: number
    engagementScore: number
    diversityScore: number
  }
}

export class WatchHistoryPredictor {
  private userProfiles: Map<string, UserProfile> = new Map()
  private sessionHistory: WatchSession[] = []
  private categoryEmbeddings: Map<string, number[]> = new Map()

  constructor() {
    this.initializeCategoryEmbeddings()
  }

  private initializeCategoryEmbeddings(): void {
    const categories = [
      'entertainment', 'education', 'music', 'gaming', 'sports', 
      'news', 'technology', 'lifestyle', 'comedy', 'documentary'
    ]
    
    categories.forEach(category => {
      this.categoryEmbeddings.set(category, 
        Array.from({ length: 50 }, () => (Math.random() - 0.5) * 0.1)
      )
    })
  }

  // Predict watch time for a video
  predictWatchTime(userId: string, videoId: string, videoDuration: number, category: string): {
    predictedWatchTime: number
    completionProbability: number
    engagementScore: number
    confidence: number
  } {
    const userProfile = this.getUserProfile(userId)
    const categoryAffinity = this.calculateCategoryAffinity(userId, category)
    const timeContext = this.getTimeContext()
    
    // Base prediction using user's historical completion rate
    let basePrediction = videoDuration * userProfile.behavior.completionRate
    
    // Adjust for category preference
    basePrediction *= (0.5 + categoryAffinity * 0.5)
    
    // Adjust for video length preference
    const lengthPreference = this.calculateLengthPreference(userId, videoDuration)
    basePrediction *= lengthPreference
    
    // Adjust for time context (time of day, device, etc.)
    basePrediction *= timeContext.timeBoost
    
    // Calculate completion probability
    const completionProb = Math.min(1, basePrediction / videoDuration)
    
    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(userId, category, videoDuration)
    
    // Calculate confidence based on data availability
    const confidence = this.calculatePredictionConfidence(userId)
    
    return {
      predictedWatchTime: Math.max(0, Math.min(basePrediction, videoDuration)),
      completionProbability: completionProb,
      engagementScore,
      confidence
    }
  }

  private getUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      // Create default profile for new user
      this.userProfiles.set(userId, {
        userId,
        demographics: {},
        preferences: {
          categories: [],
          avgSessionLength: 300,
          preferredTime: [19, 20, 21], // Evening hours
          deviceTypes: ['desktop']
        },
        behavior: {
          skipRate: 0.3,
          completionRate: 0.6,
          engagementScore: 0.5,
          diversityScore: 0.4
        }
      })
    }
    return this.userProfiles.get(userId)!
  }

  private calculateCategoryAffinity(userId: string, category: string): number {
    const userSessions = this.sessionHistory.filter(s => s.userId === userId)
    const categorySessions = userSessions.filter(s => 
      this.getVideoCategory(s.videoId) === category
    )
    
    if (categorySessions.length === 0) return 0.5 // Neutral for unknown categories
    
    const avgCompletionRate = categorySessions.reduce((sum, s) => 
      sum + s.completionRate, 0
    ) / categorySessions.length
    
    return Math.min(1, avgCompletionRate * 1.2) // Boost slightly
  }

  private calculateLengthPreference(userId: string, videoDuration: number): number {
    const userSessions = this.sessionHistory.filter(s => s.userId === userId)
    
    if (userSessions.length === 0) return 1
    
    // Find sessions with similar video lengths
    const similarLengthSessions = userSessions.filter(s => {
      const lengthRatio = Math.min(s.videoDuration, videoDuration) / 
                         Math.max(s.videoDuration, videoDuration)
      return lengthRatio > 0.7 // Similar length threshold
    })
    
    if (similarLengthSessions.length === 0) return 0.8 // Slight penalty for unknown lengths
    
    const avgCompletion = similarLengthSessions.reduce((sum, s) => 
      sum + s.completionRate, 0
    ) / similarLengthSessions.length
    
    return Math.min(1.2, avgCompletion * 1.1)
  }

  private getTimeContext(): { timeBoost: number; deviceBoost: number } {
    const hour = new Date().getHours()
    let timeBoost = 1
    
    // Peak viewing hours boost
    if (hour >= 19 && hour <= 22) {
      timeBoost = 1.2
    } else if (hour >= 12 && hour <= 14) {
      timeBoost = 1.1 // Lunch break
    } else if (hour >= 6 && hour <= 9) {
      timeBoost = 0.9 // Morning rush
    } else {
      timeBoost = 0.8 // Off-peak hours
    }
    
    return { timeBoost, deviceBoost: 1 }
  }

  private calculateEngagementScore(userId: string, category: string, duration: number): number {
    const userProfile = this.getUserProfile(userId)
    const categoryAffinity = this.calculateCategoryAffinity(userId, category)
    
    // Base engagement from user profile
    let engagement = userProfile.behavior.engagementScore
    
    // Adjust for category preference
    engagement *= (0.7 + categoryAffinity * 0.3)
    
    // Adjust for optimal video length (engagement peaks around 5-10 minutes)
    const optimalLength = 600 // 10 minutes
    const lengthFactor = Math.exp(-Math.abs(duration - optimalLength) / optimalLength)
    engagement *= (0.8 + lengthFactor * 0.2)
    
    return Math.min(1, engagement)
  }

  private calculatePredictionConfidence(userId: string): number {
    const userSessions = this.sessionHistory.filter(s => s.userId === userId)
    
    // Confidence increases with more data
    const dataConfidence = Math.min(1, userSessions.length / 50)
    
    // Confidence decreases with high variance in behavior
    const completionRates = userSessions.map(s => s.completionRate)
    const variance = this.calculateVariance(completionRates)
    const consistencyConfidence = Math.max(0.3, 1 - variance)
    
    return (dataConfidence + consistencyConfidence) / 2
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 1
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
  }

  private getVideoCategory(videoId: string): string {
    // Mock category lookup (in production, fetch from database)
    const categories = ['entertainment', 'education', 'music', 'gaming', 'sports']
    return categories[Math.floor(Math.random() * categories.length)]
  }

  // Update user profile based on new session data
  updateUserProfile(session: WatchSession): void {
    this.sessionHistory.push(session)
    
    const userProfile = this.getUserProfile(session.userId)
    const userSessions = this.sessionHistory.filter(s => s.userId === session.userId)
    
    // Update behavior metrics
    const completionRates = userSessions.map(s => s.completionRate)
    userProfile.behavior.completionRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    
    const skipRates = userSessions.map(s => s.completionRate < 0.1 ? 1 : 0)
    userProfile.behavior.skipRate = skipRates.reduce((sum, rate) => sum + rate, 0) / skipRates.length
    
    // Update engagement score based on interactions
    const avgInteractions = userSessions.reduce((sum, s) => sum + s.interactions.length, 0) / userSessions.length
    userProfile.behavior.engagementScore = Math.min(1, avgInteractions / 10)
    
    // Update category preferences
    const categoryFreq = new Map<string, number>()
    userSessions.forEach(s => {
      const category = this.getVideoCategory(s.videoId)
      categoryFreq.set(category, (categoryFreq.get(category) || 0) + 1)
    })
    
    userProfile.preferences.categories = Array.from(categoryFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category)
    
    this.userProfiles.set(session.userId, userProfile)
  }

  // Predict next video preferences
  predictNextVideoPreferences(userId: string): {
    preferredCategories: string[]
    preferredDuration: { min: number; max: number }
    optimalTime: number
    confidence: number
  } {
    const userProfile = this.getUserProfile(userId)
    const userSessions = this.sessionHistory.filter(s => s.userId === session.userId)
    
    // Analyze recent sessions for trends
    const recentSessions = userSessions.slice(-20)
    
    // Category preferences from recent activity
    const recentCategories = recentSessions.map(s => this.getVideoCategory(s.videoId))
    const categoryFreq = new Map<string, number>()
    recentCategories.forEach(cat => {
      categoryFreq.set(cat, (categoryFreq.get(cat) || 0) + 1)
    })
    
    const preferredCategories = Array.from(categoryFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category)
    
    // Duration preferences
    const completedVideos = recentSessions.filter(s => s.completionRate > 0.8)
    const durations = completedVideos.map(s => s.videoDuration)
    
    const avgDuration = durations.length > 0 ? 
      durations.reduce((sum, d) => sum + d, 0) / durations.length : 600
    
    const preferredDuration = {
      min: Math.max(60, avgDuration * 0.7),
      max: Math.min(3600, avgDuration * 1.3)
    }
    
    // Optimal viewing time
    const sessionHours = recentSessions.map(s => new Date(s.startTime).getHours())
    const hourFreq = new Map<number, number>()
    sessionHours.forEach(hour => {
      hourFreq.set(hour, (hourFreq.get(hour) || 0) + 1)
    })
    
    const optimalTime = Array.from(hourFreq.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 20
    
    const confidence = this.calculatePredictionConfidence(userId)
    
    return {
      preferredCategories,
      preferredDuration,
      optimalTime,
      confidence
    }
  }

  // Get user insights for dashboard
  getUserInsights(userId: string): {
    totalWatchTime: number
    averageSession: number
    topCategories: Array<{ category: string; percentage: number }>
    engagementTrend: number[]
    predictions: any
  } {
    const userSessions = this.sessionHistory.filter(s => s.userId === userId)
    
    const totalWatchTime = userSessions.reduce((sum, s) => sum + s.watchDuration, 0)
    const averageSession = userSessions.length > 0 ? totalWatchTime / userSessions.length : 0
    
    // Category analysis
    const categoryTime = new Map<string, number>()
    userSessions.forEach(s => {
      const category = this.getVideoCategory(s.videoId)
      categoryTime.set(category, (categoryTime.get(category) || 0) + s.watchDuration)
    })
    
    const topCategories = Array.from(categoryTime.entries())
      .map(([category, time]) => ({
        category,
        percentage: (time / totalWatchTime) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)
    
    // Engagement trend (last 30 sessions)
    const recentSessions = userSessions.slice(-30)
    const engagementTrend = recentSessions.map(s => s.completionRate)
    
    const predictions = this.predictNextVideoPreferences(userId)
    
    return {
      totalWatchTime,
      averageSession,
      topCategories,
      engagementTrend,
      predictions
    }
  }
}