export interface SpannerTransaction {
  id: string
  readTimestamp: number
  mutations: SpannerMutation[]
  status: 'ACTIVE' | 'COMMITTED' | 'ABORTED'
}

export interface SpannerMutation {
  table: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  keySet: any[]
  columns?: string[]
  values?: any[]
}

export interface SpannerQuery {
  sql: string
  params?: Record<string, any>
  types?: Record<string, string>
}

export class SpannerClient {
  private databases: Map<string, SpannerDatabase> = new Map()
  private transactions: Map<string, SpannerTransaction> = new Map()
  private globalClock: TrueTimeAPI

  constructor() {
    this.globalClock = new TrueTimeAPI()
  }

  async createDatabase(databaseId: string, schema: string[]): Promise<void> {
    const database = new SpannerDatabase(databaseId, this.globalClock)
    await database.createTables(schema)
    this.databases.set(databaseId, database)
  }

  async beginTransaction(databaseId: string, readOnly: boolean = false): Promise<string> {
    const database = this.databases.get(databaseId)
    if (!database) throw new Error(`Database ${databaseId} not found`)

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const transaction: SpannerTransaction = {
      id: transactionId,
      readTimestamp: await this.globalClock.now(),
      mutations: [],
      status: 'ACTIVE'
    }

    this.transactions.set(transactionId, transaction)
    return transactionId
  }

  async executeQuery(databaseId: string, query: SpannerQuery, 
                    transactionId?: string): Promise<any[]> {
    const database = this.databases.get(databaseId)
    if (!database) throw new Error(`Database ${databaseId} not found`)

    const readTimestamp = transactionId ? 
      this.transactions.get(transactionId)?.readTimestamp : 
      await this.globalClock.now()

    return await database.executeQuery(query, readTimestamp)
  }

  async executeMutation(databaseId: string, mutations: SpannerMutation[], 
                       transactionId?: string): Promise<void> {
    const database = this.databases.get(databaseId)
    if (!database) throw new Error(`Database ${databaseId} not found`)

    if (transactionId) {
      const transaction = this.transactions.get(transactionId)
      if (!transaction) throw new Error(`Transaction ${transactionId} not found`)
      
      transaction.mutations.push(...mutations)
    } else {
      // Single-use transaction
      const commitTimestamp = await this.globalClock.now()
      await database.applyMutations(mutations, commitTimestamp)
    }
  }

  async commitTransaction(transactionId: string): Promise<number> {
    const transaction = this.transactions.get(transactionId)
    if (!transaction) throw new Error(`Transaction ${transactionId} not found`)

    const commitTimestamp = await this.globalClock.now()
    
    // Two-phase commit across all affected databases
    const affectedDatabases = new Set<string>()
    for (const mutation of transaction.mutations) {
      // In production, determine database from table name
      affectedDatabases.add('default')
    }

    try {
      // Phase 1: Prepare
      for (const dbId of affectedDatabases) {
        const database = this.databases.get(dbId)
        if (database) {
          await database.prepare(transaction.mutations, commitTimestamp)
        }
      }

      // Phase 2: Commit
      for (const dbId of affectedDatabases) {
        const database = this.databases.get(dbId)
        if (database) {
          await database.applyMutations(transaction.mutations, commitTimestamp)
        }
      }

      transaction.status = 'COMMITTED'
      this.transactions.delete(transactionId)
      
      return commitTimestamp
    } catch (error) {
      transaction.status = 'ABORTED'
      this.transactions.delete(transactionId)
      throw error
    }
  }

  async abortTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId)
    if (transaction) {
      transaction.status = 'ABORTED'
      this.transactions.delete(transactionId)
    }
  }

  // StreamFlix specific operations
  async createUserProfile(userId: string, profile: any): Promise<void> {
    const mutations: SpannerMutation[] = [{
      table: 'Users',
      operation: 'INSERT',
      keySet: [userId],
      columns: ['user_id', 'email', 'username', 'created_at'],
      values: [userId, profile.email, profile.username, new Date().toISOString()]
    }]

    await this.executeMutation('streamflix', mutations)
  }

  async getUserVideos(userId: string): Promise<any[]> {
    const query: SpannerQuery = {
      sql: `
        SELECT v.video_id, v.title, v.duration, v.view_count, v.upload_date
        FROM Videos v
        WHERE v.creator_id = @userId
        ORDER BY v.upload_date DESC
      `,
      params: { userId },
      types: { userId: 'STRING' }
    }

    return await this.executeQuery('streamflix', query)
  }

  async getRecommendations(userId: string, limit: number = 20): Promise<any[]> {
    const query: SpannerQuery = {
      sql: `
        WITH UserPreferences AS (
          SELECT category, COUNT(*) as watch_count
          FROM WatchHistory wh
          JOIN Videos v ON wh.video_id = v.video_id
          WHERE wh.user_id = @userId
          GROUP BY category
          ORDER BY watch_count DESC
          LIMIT 3
        ),
        RecommendedVideos AS (
          SELECT v.video_id, v.title, v.view_count, v.category,
                 ROW_NUMBER() OVER (PARTITION BY v.category ORDER BY v.view_count DESC) as rn
          FROM Videos v
          JOIN UserPreferences up ON v.category = up.category
          WHERE v.creator_id != @userId
        )
        SELECT video_id, title, view_count, category
        FROM RecommendedVideos
        WHERE rn <= 7
        ORDER BY view_count DESC
        LIMIT @limit
      `,
      params: { userId, limit },
      types: { userId: 'STRING', limit: 'INT64' }
    }

    return await this.executeQuery('streamflix', query)
  }

  async recordWatchHistory(userId: string, videoId: string, watchTime: number): Promise<void> {
    const txnId = await this.beginTransaction('streamflix')
    
    try {
      // Insert watch history
      const watchMutation: SpannerMutation = {
        table: 'WatchHistory',
        operation: 'INSERT',
        keySet: [userId, videoId, Date.now()],
        columns: ['user_id', 'video_id', 'timestamp', 'watch_time'],
        values: [userId, videoId, new Date().toISOString(), watchTime]
      }

      // Update video view count
      const updateMutation: SpannerMutation = {
        table: 'Videos',
        operation: 'UPDATE',
        keySet: [videoId],
        columns: ['view_count'],
        values: ['view_count + 1'] // SQL expression
      }

      await this.executeMutation('streamflix', [watchMutation, updateMutation], txnId)
      await this.commitTransaction(txnId)
    } catch (error) {
      await this.abortTransaction(txnId)
      throw error
    }
  }

  async getAnalytics(startDate: string, endDate: string): Promise<any> {
    const query: SpannerQuery = {
      sql: `
        SELECT 
          DATE(wh.timestamp) as date,
          COUNT(DISTINCT wh.user_id) as daily_active_users,
          COUNT(*) as total_views,
          SUM(wh.watch_time) as total_watch_time,
          AVG(wh.watch_time) as avg_watch_time
        FROM WatchHistory wh
        WHERE DATE(wh.timestamp) BETWEEN @startDate AND @endDate
        GROUP BY DATE(wh.timestamp)
        ORDER BY date
      `,
      params: { startDate, endDate },
      types: { startDate: 'DATE', endDate: 'DATE' }
    }

    return await this.executeQuery('streamflix', query)
  }
}

class SpannerDatabase {
  private tables: Map<string, SpannerTable> = new Map()
  private locks: Map<string, Set<string>> = new Map()

  constructor(private databaseId: string, private globalClock: TrueTimeAPI) {}

  async createTables(schema: string[]): Promise<void> {
    for (const tableSchema of schema) {
      const tableName = this.extractTableName(tableSchema)
      this.tables.set(tableName, new SpannerTable(tableName, tableSchema))
    }
  }

  async executeQuery(query: SpannerQuery, readTimestamp: number): Promise<any[]> {
    // Simplified SQL parsing and execution
    const tableName = this.extractTableFromQuery(query.sql)
    const table = this.tables.get(tableName)
    
    if (!table) throw new Error(`Table ${tableName} not found`)
    
    return await table.executeQuery(query, readTimestamp)
  }

  async prepare(mutations: SpannerMutation[], commitTimestamp: number): Promise<void> {
    // Acquire locks for all affected rows
    for (const mutation of mutations) {
      const lockKey = `${mutation.table}:${mutation.keySet.join(':')}`
      
      if (!this.locks.has(mutation.table)) {
        this.locks.set(mutation.table, new Set())
      }
      
      const tableLocks = this.locks.get(mutation.table)!
      if (tableLocks.has(lockKey)) {
        throw new Error(`Lock conflict on ${lockKey}`)
      }
      
      tableLocks.add(lockKey)
    }
  }

  async applyMutations(mutations: SpannerMutation[], commitTimestamp: number): Promise<void> {
    for (const mutation of mutations) {
      const table = this.tables.get(mutation.table)
      if (table) {
        await table.applyMutation(mutation, commitTimestamp)
      }
      
      // Release locks
      const lockKey = `${mutation.table}:${mutation.keySet.join(':')}`
      this.locks.get(mutation.table)?.delete(lockKey)
    }
  }

  private extractTableName(schema: string): string {
    const match = schema.match(/CREATE TABLE (\w+)/i)
    return match ? match[1] : 'unknown'
  }

  private extractTableFromQuery(sql: string): string {
    const match = sql.match(/FROM (\w+)/i)
    return match ? match[1] : 'unknown'
  }
}

class SpannerTable {
  private data: Map<string, any> = new Map()
  private versions: Map<string, Array<{ value: any; timestamp: number }>> = new Map()

  constructor(private tableName: string, private schema: string) {}

  async executeQuery(query: SpannerQuery, readTimestamp: number): Promise<any[]> {
    // Simplified query execution - in production, use proper SQL parser
    const results: any[] = []
    
    for (const [key, value] of this.data) {
      const versions = this.versions.get(key) || []
      const validVersion = versions
        .filter(v => v.timestamp <= readTimestamp)
        .sort((a, b) => b.timestamp - a.timestamp)[0]
      
      if (validVersion) {
        results.push(validVersion.value)
      }
    }
    
    return results
  }

  async applyMutation(mutation: SpannerMutation, commitTimestamp: number): Promise<void> {
    const key = mutation.keySet.join(':')
    
    switch (mutation.operation) {
      case 'INSERT':
      case 'UPDATE':
        const newValue = this.buildRowFromMutation(mutation)
        
        if (!this.versions.has(key)) {
          this.versions.set(key, [])
        }
        
        this.versions.get(key)!.push({
          value: newValue,
          timestamp: commitTimestamp
        })
        
        this.data.set(key, newValue)
        break
        
      case 'DELETE':
        this.data.delete(key)
        if (this.versions.has(key)) {
          this.versions.get(key)!.push({
            value: null,
            timestamp: commitTimestamp
          })
        }
        break
    }
  }

  private buildRowFromMutation(mutation: SpannerMutation): any {
    const row: any = {}
    
    if (mutation.columns && mutation.values) {
      for (let i = 0; i < mutation.columns.length; i++) {
        row[mutation.columns[i]] = mutation.values[i]
      }
    }
    
    return row
  }
}

class TrueTimeAPI {
  private clockSkew: number = 0
  private uncertainty: number = 1 // milliseconds

  async now(): Promise<number> {
    // Simulate TrueTime with uncertainty bounds
    const baseTime = Date.now() + this.clockSkew
    return baseTime
  }

  async earliest(): Promise<number> {
    return (await this.now()) - this.uncertainty
  }

  async latest(): Promise<number> {
    return (await this.now()) + this.uncertainty
  }

  getUncertainty(): number {
    return this.uncertainty
  }
}