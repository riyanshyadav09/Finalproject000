export interface UserAction {
  userId: string
  videoId: string
  action: 'view' | 'like' | 'dislike' | 'share' | 'skip' | 'watch_complete'
  timestamp: number
  context: {
    position: number
    sessionLength: number
    timeOfDay: number
    deviceType: string
  }
}

export interface RewardSignal {
  immediate: number
  delayed: number
  engagement: number
  satisfaction: number
}

export class ReinforcementLearningRanker {
  private qTable: Map<string, Map<string, number>> = new Map()
  private actionCounts: Map<string, Map<string, number>> = new Map()
  private learningRate = 0.1
  private discountFactor = 0.9
  private epsilon = 0.1 // Exploration rate
  private contextFeatures: string[] = []

  constructor() {
    this.initializeContextFeatures()
  }

  private initializeContextFeatures(): void {
    this.contextFeatures = [
      'time_morning', 'time_afternoon', 'time_evening', 'time_night',
      'device_mobile', 'device_desktop', 'device_tablet',
      'session_short', 'session_medium', 'session_long',
      'position_top3', 'position_top10', 'position_other'
    ]
  }

  // Multi-Armed Bandit for video selection
  selectVideos(userId: string, candidateVideos: string[], context: UserAction['context'], count: number = 10): string[] {
    const userState = this.getUserState(userId, context)
    const selectedVideos: string[] = []
    const availableVideos = [...candidateVideos]

    for (let i = 0; i < Math.min(count, availableVideos.length); i++) {
      let selectedVideo: string

      if (Math.random() < this.epsilon) {
        // Exploration: random selection
        const randomIndex = Math.floor(Math.random() * availableVideos.length)
        selectedVideo = availableVideos[randomIndex]
      } else {
        // Exploitation: select best video based on Q-values
        selectedVideo = this.getBestVideo(userState, availableVideos)
      }

      selectedVideos.push(selectedVideo)
      availableVideos.splice(availableVideos.indexOf(selectedVideo), 1)
    }

    return selectedVideos
  }

  private getUserState(userId: string, context: UserAction['context']): string {
    const features = this.extractContextFeatures(context)
    return `${userId}_${features.join('_')}`
  }

  private extractContextFeatures(context: UserAction['context']): string[] {
    const features: string[] = []
    
    // Time of day features
    const hour = new Date(context.timeOfDay).getHours()
    if (hour >= 6 && hour < 12) features.push('time_morning')
    else if (hour >= 12 && hour < 18) features.push('time_afternoon')
    else if (hour >= 18 && hour < 22) features.push('time_evening')
    else features.push('time_night')
    
    // Device type
    features.push(`device_${context.deviceType}`)
    
    // Session length
    if (context.sessionLength < 300) features.push('session_short')
    else if (context.sessionLength < 1800) features.push('session_medium')
    else features.push('session_long')
    
    // Position features
    if (context.position <= 3) features.push('position_top3')
    else if (context.position <= 10) features.push('position_top10')
    else features.push('position_other')
    
    return features
  }

  private getBestVideo(userState: string, videos: string[]): string {
    let bestVideo = videos[0]
    let bestValue = -Infinity
    
    const stateActions = this.qTable.get(userState) || new Map()
    
    for (const video of videos) {
      const qValue = stateActions.get(video) || 0
      const confidence = this.getConfidence(userState, video)
      
      // Upper Confidence Bound (UCB) for exploration
      const ucbValue = qValue + Math.sqrt(2 * Math.log(this.getTotalActions(userState)) / Math.max(1, confidence))
      
      if (ucbValue > bestValue) {
        bestValue = ucbValue
        bestVideo = video
      }
    }
    
    return bestVideo
  }

  private getConfidence(userState: string, video: string): number {
    return this.actionCounts.get(userState)?.get(video) || 0
  }

  private getTotalActions(userState: string): number {
    const stateCounts = this.actionCounts.get(userState)
    if (!stateCounts) return 1
    
    let total = 0
    for (const count of stateCounts.values()) {
      total += count
    }
    return Math.max(1, total)
  }

  // Update Q-values based on user feedback
  updateModel(action: UserAction, reward: RewardSignal): void {
    const userState = this.getUserState(action.userId, action.context)
    const videoId = action.videoId
    
    // Initialize if not exists
    if (!this.qTable.has(userState)) {
      this.qTable.set(userState, new Map())
    }
    if (!this.actionCounts.has(userState)) {
      this.actionCounts.set(userState, new Map())
    }
    
    const stateActions = this.qTable.get(userState)!
    const stateCounts = this.actionCounts.get(userState)!
    
    // Update action count
    stateCounts.set(videoId, (stateCounts.get(videoId) || 0) + 1)
    
    // Calculate total reward
    const totalReward = this.calculateTotalReward(reward, action.action)
    
    // Q-learning update
    const currentQ = stateActions.get(videoId) || 0
    const newQ = currentQ + this.learningRate * (totalReward - currentQ)
    
    stateActions.set(videoId, newQ)
    
    // Decay exploration rate
    this.epsilon = Math.max(0.01, this.epsilon * 0.995)
  }

  private calculateTotalReward(reward: RewardSignal, action: string): number {
    let totalReward = 0
    
    // Action-specific rewards
    switch (action) {
      case 'view':
        totalReward += 1
        break
      case 'like':
        totalReward += 5
        break
      case 'share':
        totalReward += 10
        break
      case 'watch_complete':
        totalReward += 15
        break
      case 'skip':
        totalReward -= 2
        break
      case 'dislike':
        totalReward -= 5
        break
    }
    
    // Add reward signals
    totalReward += reward.immediate * 0.4
    totalReward += reward.delayed * 0.3
    totalReward += reward.engagement * 0.2
    totalReward += reward.satisfaction * 0.1
    
    return totalReward
  }

  // Contextual bandit for personalized ranking
  rankVideos(userId: string, videos: string[], context: UserAction['context']): Array<{videoId: string, score: number}> {
    const userState = this.getUserState(userId, context)
    const stateActions = this.qTable.get(userState) || new Map()
    
    const rankedVideos = videos.map(videoId => {
      const qValue = stateActions.get(videoId) || 0
      const confidence = this.getConfidence(userState, videoId)
      
      // Thompson Sampling for exploration
      const sampledValue = this.thompsonSample(qValue, confidence)
      
      return {
        videoId,
        score: sampledValue
      }
    })
    
    return rankedVideos.sort((a, b) => b.score - a.score)
  }

  private thompsonSample(mean: number, count: number): number {
    // Beta distribution sampling for Thompson Sampling
    const alpha = Math.max(1, count * (mean + 1) / 2)
    const beta = Math.max(1, count * (1 - mean + 1) / 2)
    
    // Simplified beta sampling (in production, use proper beta distribution)
    return Math.random() * (alpha / (alpha + beta)) + mean * 0.5
  }

  // Deep Q-Network features (simplified)
  extractDeepFeatures(userId: string, videoId: string, context: UserAction['context']): number[] {
    const features: number[] = []
    
    // User features (would come from user profile)
    features.push(
      Math.random(), // User age (normalized)
      Math.random(), // User activity level
      Math.random()  // User preference diversity
    )
    
    // Video features (would come from video metadata)
    features.push(
      Math.random(), // Video popularity
      Math.random(), // Video recency
      Math.random(), // Video quality score
      Math.random()  // Video engagement rate
    )
    
    // Context features
    features.push(
      context.timeOfDay / 24,           // Time of day (normalized)
      context.sessionLength / 3600,    // Session length (normalized)
      context.position / 100,           // Position (normalized)
      context.deviceType === 'mobile' ? 1 : 0  // Device type
    )
    
    // Interaction features (would come from user history)
    features.push(
      Math.random(), // User-video category affinity
      Math.random(), // User-creator affinity
      Math.random()  // Similar users' preference
    )
    
    return features
  }

  // Policy gradient for continuous improvement
  updatePolicy(episodes: UserAction[]): void {
    const batchSize = Math.min(32, episodes.length)
    const batch = episodes.slice(-batchSize)
    
    for (const episode of batch) {
      const reward = this.calculateEpisodeReward(episode)
      this.updateModel(episode, reward)
    }
  }

  private calculateEpisodeReward(action: UserAction): RewardSignal {
    // Calculate reward based on user action and context
    let immediate = 0
    let delayed = 0
    let engagement = 0
    let satisfaction = 0
    
    switch (action.action) {
      case 'view':
        immediate = 1
        engagement = 0.5
        break
      case 'like':
        immediate = 2
        engagement = 2
        satisfaction = 1
        break
      case 'share':
        immediate = 3
        engagement = 3
        satisfaction = 2
        delayed = 1
        break
      case 'watch_complete':
        immediate = 4
        engagement = 4
        satisfaction = 3
        delayed = 2
        break
      case 'skip':
        immediate = -1
        engagement = -1
        break
      case 'dislike':
        immediate = -2
        engagement = -2
        satisfaction = -2
        break
    }
    
    return { immediate, delayed, engagement, satisfaction }
  }

  // Get model performance metrics
  getModelMetrics(): {
    totalActions: number
    explorationRate: number
    averageReward: number
    convergenceScore: number
  } {
    let totalActions = 0
    let totalReward = 0
    
    for (const stateActions of this.qTable.values()) {
      for (const qValue of stateActions.values()) {
        totalActions++
        totalReward += qValue
      }
    }
    
    return {
      totalActions,
      explorationRate: this.epsilon,
      averageReward: totalActions > 0 ? totalReward / totalActions : 0,
      convergenceScore: Math.max(0, 1 - this.epsilon) // Higher when more converged
    }
  }
}