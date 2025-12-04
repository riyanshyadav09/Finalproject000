export interface UserInteraction {
  userId: string
  videoId: string
  rating: number
  watchTime: number
  timestamp: number
}

export interface VideoFeatures {
  videoId: string
  category: string
  duration: number
  tags: string[]
  uploadDate: number
  viewCount: number
}

export class CollaborativeFiltering {
  private userItemMatrix: Map<string, Map<string, number>> = new Map()
  private itemSimilarity: Map<string, Map<string, number>> = new Map()
  private userSimilarity: Map<string, Map<string, number>> = new Map()

  constructor(private interactions: UserInteraction[]) {
    this.buildUserItemMatrix()
    this.calculateItemSimilarity()
    this.calculateUserSimilarity()
  }

  private buildUserItemMatrix(): void {
    for (const interaction of this.interactions) {
      if (!this.userItemMatrix.has(interaction.userId)) {
        this.userItemMatrix.set(interaction.userId, new Map())
      }
      
      // Implicit feedback: watch time ratio as rating
      const rating = Math.min(5, interaction.watchTime / 60) // Max 5 for 60+ seconds
      this.userItemMatrix.get(interaction.userId)!.set(interaction.videoId, rating)
    }
  }

  private calculateItemSimilarity(): void {
    const items = Array.from(new Set(this.interactions.map(i => i.videoId)))
    
    for (let i = 0; i < items.length; i++) {
      const itemA = items[i]
      if (!this.itemSimilarity.has(itemA)) {
        this.itemSimilarity.set(itemA, new Map())
      }
      
      for (let j = i + 1; j < items.length; j++) {
        const itemB = items[j]
        const similarity = this.cosineSimilarity(itemA, itemB)
        
        this.itemSimilarity.get(itemA)!.set(itemB, similarity)
        if (!this.itemSimilarity.has(itemB)) {
          this.itemSimilarity.set(itemB, new Map())
        }
        this.itemSimilarity.get(itemB)!.set(itemA, similarity)
      }
    }
  }

  private calculateUserSimilarity(): void {
    const users = Array.from(this.userItemMatrix.keys())
    
    for (let i = 0; i < users.length; i++) {
      const userA = users[i]
      if (!this.userSimilarity.has(userA)) {
        this.userSimilarity.set(userA, new Map())
      }
      
      for (let j = i + 1; j < users.length; j++) {
        const userB = users[j]
        const similarity = this.userCosineSimilarity(userA, userB)
        
        this.userSimilarity.get(userA)!.set(userB, similarity)
        if (!this.userSimilarity.has(userB)) {
          this.userSimilarity.set(userB, new Map())
        }
        this.userSimilarity.get(userB)!.set(userA, similarity)
      }
    }
  }

  private cosineSimilarity(itemA: string, itemB: string): number {
    const usersA = new Set<string>()
    const usersB = new Set<string>()
    
    for (const [userId, items] of this.userItemMatrix) {
      if (items.has(itemA)) usersA.add(userId)
      if (items.has(itemB)) usersB.add(userId)
    }
    
    const intersection = new Set([...usersA].filter(u => usersB.has(u)))
    const union = new Set([...usersA, ...usersB])
    
    return intersection.size / Math.sqrt(usersA.size * usersB.size)
  }

  private userCosineSimilarity(userA: string, userB: string): number {
    const itemsA = this.userItemMatrix.get(userA) || new Map()
    const itemsB = this.userItemMatrix.get(userB) || new Map()
    
    const commonItems = new Set([...itemsA.keys()].filter(item => itemsB.has(item)))
    
    if (commonItems.size === 0) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (const item of commonItems) {
      const ratingA = itemsA.get(item) || 0
      const ratingB = itemsB.get(item) || 0
      
      dotProduct += ratingA * ratingB
      normA += ratingA * ratingA
      normB += ratingB * ratingB
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  recommendItems(userId: string, topK: number = 10): string[] {
    const userItems = this.userItemMatrix.get(userId) || new Map()
    const recommendations = new Map<string, number>()
    
    // Item-based collaborative filtering
    for (const [itemId, rating] of userItems) {
      const similarItems = this.itemSimilarity.get(itemId) || new Map()
      
      for (const [similarItem, similarity] of similarItems) {
        if (!userItems.has(similarItem)) {
          const score = (recommendations.get(similarItem) || 0) + similarity * rating
          recommendations.set(similarItem, score)
        }
      }
    }
    
    return Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([itemId]) => itemId)
  }

  recommendByUserSimilarity(userId: string, topK: number = 10): string[] {
    const similarUsers = this.userSimilarity.get(userId) || new Map()
    const userItems = this.userItemMatrix.get(userId) || new Map()
    const recommendations = new Map<string, number>()
    
    for (const [similarUserId, similarity] of similarUsers) {
      const similarUserItems = this.userItemMatrix.get(similarUserId) || new Map()
      
      for (const [itemId, rating] of similarUserItems) {
        if (!userItems.has(itemId)) {
          const score = (recommendations.get(itemId) || 0) + similarity * rating
          recommendations.set(itemId, score)
        }
      }
    }
    
    return Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([itemId]) => itemId)
  }
}