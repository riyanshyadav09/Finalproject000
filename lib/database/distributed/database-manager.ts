import { BigtableClient } from '../bigtable/bigtable-client'
import { SpannerClient } from '../spanner/spanner-client'
import { ColossusClient } from '../colossus/colossus-client'

export interface DatabaseConfig {
  bigtable: {
    projectId: string
    instanceId: string
    tables: string[]
  }
  spanner: {
    projectId: string
    instanceId: string
    databaseId: string
  }
  colossus: {
    replicationFactor: number
    chunkSize: number
  }
}

export class DatabaseManager {
  private bigtable: BigtableClient
  private spanner: SpannerClient
  private colossus: ColossusClient

  constructor(private config: DatabaseConfig) {
    this.bigtable = new BigtableClient()
    this.spanner = new SpannerClient()
    this.colossus = new ColossusClient()
    
    this.initializeDatabases()
  }

  private async initializeDatabases(): Promise<void> {
    // Initialize Bigtable tables
    await this.bigtable.createTable('user_watch_history', ['watch', 'metadata'])
    await this.bigtable.createTable('video_metrics', ['metrics', 'analytics'])
    await this.bigtable.createTable('user_recommendations', ['recommendations', 'scores'])
    await this.bigtable.createTable('search_index', ['terms', 'scores'])

    // Initialize Spanner database
    const spannerSchema = [
      `CREATE TABLE Users (
        user_id STRING(36) NOT NULL,
        email STRING(255) NOT NULL,
        username STRING(50) NOT NULL,
        password_hash STRING(255) NOT NULL,
        first_name STRING(100),
        last_name STRING(100),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        subscription_tier STRING(20) DEFAULT 'FREE',
        is_verified BOOL DEFAULT FALSE
      ) PRIMARY KEY (user_id)`,
      
      `CREATE TABLE Videos (
        video_id STRING(36) NOT NULL,
        creator_id STRING(36) NOT NULL,
        title STRING(500) NOT NULL,
        description TEXT,
        duration INT64 NOT NULL,
        file_path STRING(1000),
        thumbnail_path STRING(1000),
        category STRING(50),
        tags ARRAY<STRING(50)>,
        view_count INT64 DEFAULT 0,
        like_count INT64 DEFAULT 0,
        upload_date TIMESTAMP NOT NULL,
        status STRING(20) DEFAULT 'PROCESSING',
        is_premium BOOL DEFAULT FALSE
      ) PRIMARY KEY (video_id)`,
      
      `CREATE TABLE WatchHistory (
        user_id STRING(36) NOT NULL,
        video_id STRING(36) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        watch_time INT64 NOT NULL,
        completion_rate FLOAT64,
        device_type STRING(20),
        session_id STRING(36)
      ) PRIMARY KEY (user_id, video_id, timestamp)`,
      
      `CREATE TABLE Subscriptions (
        subscription_id STRING(36) NOT NULL,
        user_id STRING(36) NOT NULL,
        tier STRING(20) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        is_active BOOL DEFAULT TRUE,
        payment_method STRING(50)
      ) PRIMARY KEY (subscription_id)`
    ]

    await this.spanner.createDatabase(this.config.spanner.databaseId, spannerSchema)
  }

  // User Management
  async createUser(userData: {
    userId: string
    email: string
    username: string
    passwordHash: string
    firstName?: string
    lastName?: string
  }): Promise<void> {
    // Store structured data in Spanner
    await this.spanner.createUserProfile(userData.userId, userData)
    
    // Initialize user analytics in Bigtable
    await this.bigtable.put(
      'user_recommendations',
      userData.userId,
      'metadata',
      'created_at',
      Buffer.from(Date.now().toString())
    )
  }

  async getUserProfile(userId: string): Promise<any> {
    const query = {
      sql: 'SELECT * FROM Users WHERE user_id = @userId',
      params: { userId },
      types: { userId: 'STRING' }
    }
    
    const results = await this.spanner.executeQuery(this.config.spanner.databaseId, query)
    return results[0] || null
  }

  // Video Management
  async uploadVideo(videoData: {
    videoId: string
    creatorId: string
    title: string
    description: string
    duration: number
    category: string
    tags: string[]
    videoBuffer: Buffer
    thumbnailBuffer?: Buffer
  }): Promise<void> {
    // Store video file in Colossus
    const videoPath = await this.colossus.storeVideo(videoData.videoId, videoData.videoBuffer)
    
    if (videoData.thumbnailBuffer) {
      await this.colossus.storeThumbnail(videoData.videoId, videoData.thumbnailBuffer)
    }

    // Store metadata in Spanner
    const mutations = [{
      table: 'Videos',
      operation: 'INSERT' as const,
      keySet: [videoData.videoId],
      columns: ['video_id', 'creator_id', 'title', 'description', 'duration', 'file_path', 'category', 'tags', 'upload_date'],
      values: [
        videoData.videoId,
        videoData.creatorId,
        videoData.title,
        videoData.description,
        videoData.duration,
        videoPath,
        videoData.category,
        videoData.tags,
        new Date().toISOString()
      ]
    }]

    await this.spanner.executeMutation(this.config.spanner.databaseId, mutations)

    // Initialize metrics in Bigtable
    await this.bigtable.put(
      'video_metrics',
      videoData.videoId,
      'metrics',
      'views',
      Buffer.from('0')
    )
  }

  async getVideo(videoId: string): Promise<{ metadata: any; videoData: Buffer }> {
    // Get metadata from Spanner
    const query = {
      sql: 'SELECT * FROM Videos WHERE video_id = @videoId',
      params: { videoId },
      types: { videoId: 'STRING' }
    }
    
    const results = await this.spanner.executeQuery(this.config.spanner.databaseId, query)
    const metadata = results[0]
    
    if (!metadata) {
      throw new Error(`Video ${videoId} not found`)
    }

    // Get video data from Colossus
    const videoData = await this.colossus.getVideo(videoId)
    
    return { metadata, videoData }
  }

  // Analytics and Recommendations
  async recordWatchEvent(userId: string, videoId: string, watchTime: number, deviceType: string): Promise<void> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Record in Spanner for structured queries
    await this.spanner.recordWatchHistory(userId, videoId, watchTime)
    
    // Record in Bigtable for fast analytics
    const timestamp = Date.now()
    const rowKey = `${userId}#${timestamp}#${videoId}`
    
    await this.bigtable.put('user_watch_history', rowKey, 'watch', 'video_id', Buffer.from(videoId))
    await this.bigtable.put('user_watch_history', rowKey, 'watch', 'watch_time', Buffer.from(watchTime.toString()))
    await this.bigtable.put('user_watch_history', rowKey, 'watch', 'device_type', Buffer.from(deviceType))
    await this.bigtable.put('user_watch_history', rowKey, 'watch', 'timestamp', Buffer.from(timestamp.toString()))
    
    // Update video metrics
    await this.bigtable.incrementCounter('video_metrics', videoId, 'metrics', 'views', 1)
    await this.bigtable.incrementCounter('video_metrics', videoId, 'metrics', 'total_watch_time', watchTime)
  }

  async getUserRecommendations(userId: string, limit: number = 20): Promise<any[]> {
    // Get recommendations from Spanner (collaborative filtering)
    const spannerRecs = await this.spanner.getRecommendations(userId, limit)
    
    // Get personalized scores from Bigtable
    const bigtableRecs = await this.bigtable.scan(
      'user_recommendations',
      `${userId}#`,
      `${userId}#~`,
      { familyNameRegex: 'recommendations' },
      limit
    )
    
    // Combine and rank recommendations
    const combinedRecs = this.combineRecommendations(spannerRecs, bigtableRecs)
    
    return combinedRecs.slice(0, limit)
  }

  private combineRecommendations(spannerRecs: any[], bigtableRecs: any[]): any[] {
    const scoreMap = new Map<string, number>()
    
    // Add Spanner recommendations (collaborative filtering)
    spannerRecs.forEach((rec, index) => {
      scoreMap.set(rec.video_id, (spannerRecs.length - index) * 0.6)
    })
    
    // Add Bigtable recommendations (content-based)
    bigtableRecs.forEach(row => {
      const videoId = row.data.get('recommendations')?.get('video_id')?.value.toString()
      const score = parseFloat(row.data.get('recommendations')?.get('score')?.value.toString() || '0')
      
      if (videoId) {
        scoreMap.set(videoId, (scoreMap.get(videoId) || 0) + score * 0.4)
      }
    })
    
    return Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([videoId, score]) => ({ video_id: videoId, score }))
  }

  async getAnalyticsDashboard(startDate: string, endDate: string): Promise<{
    dailyActiveUsers: number
    totalViews: number
    totalWatchTime: number
    topVideos: any[]
    userGrowth: any[]
  }> {
    // Get structured analytics from Spanner
    const spannerAnalytics = await this.spanner.getAnalytics(startDate, endDate)
    
    // Get real-time metrics from Bigtable
    const videoMetrics = await this.bigtable.scan(
      'video_metrics',
      '',
      '~',
      { familyNameRegex: 'metrics' },
      100
    )
    
    const topVideos = videoMetrics
      .map(row => ({
        videoId: row.key,
        views: parseInt(row.data.get('metrics')?.get('views')?.value.toString() || '0'),
        watchTime: parseInt(row.data.get('metrics')?.get('total_watch_time')?.value.toString() || '0')
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
    
    return {
      dailyActiveUsers: spannerAnalytics.reduce((sum: number, day: any) => sum + day.daily_active_users, 0),
      totalViews: spannerAnalytics.reduce((sum: number, day: any) => sum + day.total_views, 0),
      totalWatchTime: spannerAnalytics.reduce((sum: number, day: any) => sum + day.total_watch_time, 0),
      topVideos,
      userGrowth: spannerAnalytics
    }
  }

  // Search functionality
  async indexVideoForSearch(videoId: string, title: string, description: string, tags: string[]): Promise<void> {
    const searchTerms = [
      ...title.toLowerCase().split(' '),
      ...description.toLowerCase().split(' '),
      ...tags.map(tag => tag.toLowerCase())
    ].filter(term => term.length > 2)
    
    for (const term of searchTerms) {
      const rowKey = `${term}#${videoId}`
      await this.bigtable.put('search_index', rowKey, 'terms', 'video_id', Buffer.from(videoId))
      await this.bigtable.put('search_index', rowKey, 'scores', 'relevance', Buffer.from('1.0'))
    }
  }

  async searchVideos(query: string, limit: number = 20): Promise<string[]> {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
    const videoScores = new Map<string, number>()
    
    for (const term of searchTerms) {
      const results = await this.bigtable.scan(
        'search_index',
        `${term}#`,
        `${term}#~`,
        undefined,
        100
      )
      
      for (const row of results) {
        const videoId = row.data.get('terms')?.get('video_id')?.value.toString()
        const relevance = parseFloat(row.data.get('scores')?.get('relevance')?.value.toString() || '0')
        
        if (videoId) {
          videoScores.set(videoId, (videoScores.get(videoId) || 0) + relevance)
        }
      }
    }
    
    return Array.from(videoScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([videoId]) => videoId)
  }

  // System health and monitoring
  async getSystemHealth(): Promise<{
    bigtable: { status: string; tables: number }
    spanner: { status: string; databases: number }
    colossus: { status: string; files: number; totalSize: number }
  }> {
    const colossusStats = await this.colossus.getStorageStats()
    
    return {
      bigtable: {
        status: 'healthy',
        tables: 4
      },
      spanner: {
        status: 'healthy',
        databases: 1
      },
      colossus: {
        status: 'healthy',
        files: colossusStats.totalFiles,
        totalSize: colossusStats.totalSize
      }
    }
  }
}