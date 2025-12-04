export interface BigtableRow {
  key: string
  data: Map<string, Map<string, BigtableCell>>
}

export interface BigtableCell {
  value: Buffer
  timestamp: number
  labels?: string[]
}

export interface BigtableFilter {
  familyNameRegex?: string
  columnQualifierRegex?: string
  timestampRange?: { start: number; end: number }
  valueRegex?: string
  cellsPerColumn?: number
}

export class BigtableClient {
  private tables: Map<string, Map<string, BigtableRow>> = new Map()
  private tablets: Map<string, TabletServer> = new Map()
  private masterServer: MasterServer

  constructor() {
    this.masterServer = new MasterServer()
    this.initializeTabletServers()
  }

  private initializeTabletServers(): void {
    // Initialize tablet servers for horizontal scaling
    for (let i = 0; i < 3; i++) {
      const tabletId = `tablet-${i}`
      this.tablets.set(tabletId, new TabletServer(tabletId))
    }
  }

  async createTable(tableName: string, columnFamilies: string[]): Promise<void> {
    if (this.tables.has(tableName)) {
      throw new Error(`Table ${tableName} already exists`)
    }

    this.tables.set(tableName, new Map())
    
    // Register table with master server
    await this.masterServer.registerTable(tableName, columnFamilies)
    
    // Distribute initial tablets
    await this.distributeTablets(tableName)
  }

  private async distributeTablets(tableName: string): Promise<void> {
    const tabletServers = Array.from(this.tablets.values())
    const tabletCount = tabletServers.length
    
    for (let i = 0; i < tabletCount; i++) {
      const startKey = i === 0 ? '' : `shard_${i}`
      const endKey = i === tabletCount - 1 ? '~' : `shard_${i + 1}`
      
      await tabletServers[i].assignTablet(tableName, startKey, endKey)
    }
  }

  async put(tableName: string, rowKey: string, columnFamily: string, 
           column: string, value: Buffer, timestamp?: number): Promise<void> {
    const tablet = this.getTabletForKey(tableName, rowKey)
    
    await tablet.put(tableName, rowKey, columnFamily, column, value, timestamp || Date.now())
  }

  async get(tableName: string, rowKey: string, filter?: BigtableFilter): Promise<BigtableRow | null> {
    const tablet = this.getTabletForKey(tableName, rowKey)
    
    return await tablet.get(tableName, rowKey, filter)
  }

  async scan(tableName: string, startKey: string, endKey: string, 
            filter?: BigtableFilter, limit?: number): Promise<BigtableRow[]> {
    const results: BigtableRow[] = []
    const tablets = this.getTabletsForRange(tableName, startKey, endKey)
    
    for (const tablet of tablets) {
      const tabletResults = await tablet.scan(tableName, startKey, endKey, filter, limit)
      results.push(...tabletResults)
      
      if (limit && results.length >= limit) {
        break
      }
    }
    
    return results.slice(0, limit)
  }

  async mutateRows(tableName: string, mutations: Array<{
    rowKey: string
    mutations: Array<{
      type: 'PUT' | 'DELETE'
      columnFamily: string
      column: string
      value?: Buffer
      timestamp?: number
    }>
  }>): Promise<void> {
    // Group mutations by tablet
    const tabletMutations = new Map<TabletServer, typeof mutations>()
    
    for (const mutation of mutations) {
      const tablet = this.getTabletForKey(tableName, mutation.rowKey)
      
      if (!tabletMutations.has(tablet)) {
        tabletMutations.set(tablet, [])
      }
      tabletMutations.get(tablet)!.push(mutation)
    }
    
    // Execute mutations in parallel
    const promises = Array.from(tabletMutations.entries()).map(([tablet, muts]) =>
      tablet.mutateRows(tableName, muts)
    )
    
    await Promise.all(promises)
  }

  private getTabletForKey(tableName: string, rowKey: string): TabletServer {
    // Simple hash-based sharding
    const hash = this.hashKey(rowKey)
    const tabletIndex = hash % this.tablets.size
    return Array.from(this.tablets.values())[tabletIndex]
  }

  private getTabletsForRange(tableName: string, startKey: string, endKey: string): TabletServer[] {
    // For simplicity, return all tablets (in production, use range-based routing)
    return Array.from(this.tablets.values())
  }

  private hashKey(key: string): number {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) & 0xffffffff
    }
    return Math.abs(hash)
  }

  // Analytics queries for StreamFlix
  async getUserWatchHistory(userId: string, limit: number = 100): Promise<Array<{
    videoId: string
    watchTime: number
    timestamp: number
  }>> {
    const results = await this.scan(
      'user_watch_history',
      `${userId}#`,
      `${userId}#~`,
      { cellsPerColumn: 1 },
      limit
    )
    
    return results.map(row => {
      const data = row.data.get('watch')
      return {
        videoId: data?.get('video_id')?.value.toString() || '',
        watchTime: parseInt(data?.get('watch_time')?.value.toString() || '0'),
        timestamp: data?.get('timestamp')?.timestamp || 0
      }
    })
  }

  async getVideoMetrics(videoId: string): Promise<{
    views: number
    likes: number
    comments: number
    watchTime: number
  }> {
    const row = await this.get('video_metrics', videoId)
    
    if (!row) {
      return { views: 0, likes: 0, comments: 0, watchTime: 0 }
    }
    
    const metrics = row.data.get('metrics')
    return {
      views: parseInt(metrics?.get('views')?.value.toString() || '0'),
      likes: parseInt(metrics?.get('likes')?.value.toString() || '0'),
      comments: parseInt(metrics?.get('comments')?.value.toString() || '0'),
      watchTime: parseInt(metrics?.get('watch_time')?.value.toString() || '0')
    }
  }

  async incrementCounter(tableName: string, rowKey: string, 
                        columnFamily: string, column: string, delta: number = 1): Promise<number> {
    const tablet = this.getTabletForKey(tableName, rowKey)
    return await tablet.incrementCounter(tableName, rowKey, columnFamily, column, delta)
  }
}

class TabletServer {
  private data: Map<string, Map<string, BigtableRow>> = new Map()
  private tablets: Map<string, { startKey: string; endKey: string }> = new Map()

  constructor(private serverId: string) {}

  async assignTablet(tableName: string, startKey: string, endKey: string): Promise<void> {
    const tabletId = `${tableName}:${startKey}:${endKey}`
    this.tablets.set(tabletId, { startKey, endKey })
    
    if (!this.data.has(tableName)) {
      this.data.set(tableName, new Map())
    }
  }

  async put(tableName: string, rowKey: string, columnFamily: string, 
           column: string, value: Buffer, timestamp: number): Promise<void> {
    const table = this.data.get(tableName)
    if (!table) throw new Error(`Table ${tableName} not found`)
    
    let row = table.get(rowKey)
    if (!row) {
      row = { key: rowKey, data: new Map() }
      table.set(rowKey, row)
    }
    
    let family = row.data.get(columnFamily)
    if (!family) {
      family = new Map()
      row.data.set(columnFamily, family)
    }
    
    family.set(column, { value, timestamp })
  }

  async get(tableName: string, rowKey: string, filter?: BigtableFilter): Promise<BigtableRow | null> {
    const table = this.data.get(tableName)
    if (!table) return null
    
    const row = table.get(rowKey)
    if (!row) return null
    
    if (filter) {
      return this.applyFilter(row, filter)
    }
    
    return row
  }

  async scan(tableName: string, startKey: string, endKey: string, 
            filter?: BigtableFilter, limit?: number): Promise<BigtableRow[]> {
    const table = this.data.get(tableName)
    if (!table) return []
    
    const results: BigtableRow[] = []
    
    for (const [key, row] of table) {
      if (key >= startKey && key < endKey) {
        const filteredRow = filter ? this.applyFilter(row, filter) : row
        if (filteredRow) {
          results.push(filteredRow)
        }
        
        if (limit && results.length >= limit) {
          break
        }
      }
    }
    
    return results.sort((a, b) => a.key.localeCompare(b.key))
  }

  async mutateRows(tableName: string, mutations: Array<{
    rowKey: string
    mutations: Array<{
      type: 'PUT' | 'DELETE'
      columnFamily: string
      column: string
      value?: Buffer
      timestamp?: number
    }>
  }>): Promise<void> {
    for (const rowMutation of mutations) {
      for (const mut of rowMutation.mutations) {
        if (mut.type === 'PUT' && mut.value) {
          await this.put(tableName, rowMutation.rowKey, mut.columnFamily, 
                        mut.column, mut.value, mut.timestamp || Date.now())
        } else if (mut.type === 'DELETE') {
          await this.deleteCell(tableName, rowMutation.rowKey, mut.columnFamily, mut.column)
        }
      }
    }
  }

  async incrementCounter(tableName: string, rowKey: string, 
                        columnFamily: string, column: string, delta: number): Promise<number> {
    const currentRow = await this.get(tableName, rowKey)
    const currentValue = currentRow?.data.get(columnFamily)?.get(column)?.value
    const current = currentValue ? parseInt(currentValue.toString()) : 0
    const newValue = current + delta
    
    await this.put(tableName, rowKey, columnFamily, column, 
                  Buffer.from(newValue.toString()), Date.now())
    
    return newValue
  }

  private async deleteCell(tableName: string, rowKey: string, 
                          columnFamily: string, column: string): Promise<void> {
    const table = this.data.get(tableName)
    if (!table) return
    
    const row = table.get(rowKey)
    if (!row) return
    
    const family = row.data.get(columnFamily)
    if (family) {
      family.delete(column)
    }
  }

  private applyFilter(row: BigtableRow, filter: BigtableFilter): BigtableRow | null {
    const filteredRow: BigtableRow = { key: row.key, data: new Map() }
    
    for (const [familyName, family] of row.data) {
      if (filter.familyNameRegex && !new RegExp(filter.familyNameRegex).test(familyName)) {
        continue
      }
      
      const filteredFamily = new Map<string, BigtableCell>()
      
      for (const [column, cell] of family) {
        if (filter.columnQualifierRegex && !new RegExp(filter.columnQualifierRegex).test(column)) {
          continue
        }
        
        if (filter.timestampRange) {
          if (cell.timestamp < filter.timestampRange.start || 
              cell.timestamp > filter.timestampRange.end) {
            continue
          }
        }
        
        if (filter.valueRegex && !new RegExp(filter.valueRegex).test(cell.value.toString())) {
          continue
        }
        
        filteredFamily.set(column, cell)
      }
      
      if (filteredFamily.size > 0) {
        filteredRow.data.set(familyName, filteredFamily)
      }
    }
    
    return filteredRow.data.size > 0 ? filteredRow : null
  }
}

class MasterServer {
  private tableMetadata: Map<string, {
    columnFamilies: string[]
    tablets: Array<{ startKey: string; endKey: string; server: string }>
  }> = new Map()

  async registerTable(tableName: string, columnFamilies: string[]): Promise<void> {
    this.tableMetadata.set(tableName, {
      columnFamilies,
      tablets: []
    })
  }

  async getTableMetadata(tableName: string) {
    return this.tableMetadata.get(tableName)
  }
}