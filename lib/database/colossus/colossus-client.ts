export interface ColossusFile {
  path: string
  size: number
  chunks: ColossusChunk[]
  replicationFactor: number
  metadata: Record<string, any>
}

export interface ColossusChunk {
  id: string
  size: number
  checksum: string
  replicas: ColossusReplica[]
}

export interface ColossusReplica {
  chunkServerId: string
  location: string
  status: 'ACTIVE' | 'STALE' | 'CORRUPTED'
}

export class ColossusClient {
  private master: ColossusMaster
  private chunkServers: Map<string, ColossusChunkServer> = new Map()
  private files: Map<string, ColossusFile> = new Map()

  constructor() {
    this.master = new ColossusMaster()
    this.initializeChunkServers()
  }

  private initializeChunkServers(): void {
    // Initialize distributed chunk servers
    for (let i = 0; i < 5; i++) {
      const serverId = `chunkserver-${i}`
      const server = new ColossusChunkServer(serverId, `datacenter-${i % 2}`)
      this.chunkServers.set(serverId, server)
      this.master.registerChunkServer(serverId, server)
    }
  }

  async createFile(path: string, replicationFactor: number = 3): Promise<void> {
    if (this.files.has(path)) {
      throw new Error(`File ${path} already exists`)
    }

    const file: ColossusFile = {
      path,
      size: 0,
      chunks: [],
      replicationFactor,
      metadata: {
        createdAt: Date.now(),
        owner: 'streamflix',
        permissions: 'rw-r--r--'
      }
    }

    this.files.set(path, file)
    await this.master.registerFile(path, file)
  }

  async writeFile(path: string, data: Buffer): Promise<void> {
    const file = this.files.get(path)
    if (!file) {
      await this.createFile(path)
    }

    const chunkSize = 64 * 1024 * 1024 // 64MB chunks
    const chunks: ColossusChunk[] = []

    // Split data into chunks
    for (let offset = 0; offset < data.length; offset += chunkSize) {
      const chunkData = data.slice(offset, Math.min(offset + chunkSize, data.length))
      const chunkId = this.generateChunkId()
      
      const chunk = await this.writeChunk(chunkId, chunkData, file!.replicationFactor)
      chunks.push(chunk)
    }

    // Update file metadata
    const updatedFile = this.files.get(path)!
    updatedFile.chunks = chunks
    updatedFile.size = data.length
    updatedFile.metadata.modifiedAt = Date.now()

    this.files.set(path, updatedFile)
  }

  async readFile(path: string): Promise<Buffer> {
    const file = this.files.get(path)
    if (!file) {
      throw new Error(`File ${path} not found`)
    }

    const chunks: Buffer[] = []

    for (const chunkMeta of file.chunks) {
      const chunkData = await this.readChunk(chunkMeta.id)
      chunks.push(chunkData)
    }

    return Buffer.concat(chunks)
  }

  async appendFile(path: string, data: Buffer): Promise<void> {
    const file = this.files.get(path)
    if (!file) {
      throw new Error(`File ${path} not found`)
    }

    // For simplicity, create new chunks for appended data
    const chunkSize = 64 * 1024 * 1024
    const newChunks: ColossusChunk[] = []

    for (let offset = 0; offset < data.length; offset += chunkSize) {
      const chunkData = data.slice(offset, Math.min(offset + chunkSize, data.length))
      const chunkId = this.generateChunkId()
      
      const chunk = await this.writeChunk(chunkId, chunkData, file.replicationFactor)
      newChunks.push(chunk)
    }

    file.chunks.push(...newChunks)
    file.size += data.length
    file.metadata.modifiedAt = Date.now()
  }

  private async writeChunk(chunkId: string, data: Buffer, replicationFactor: number): Promise<ColossusChunk> {
    const chunkServers = await this.master.selectChunkServers(replicationFactor)
    const replicas: ColossusReplica[] = []
    const checksum = this.calculateChecksum(data)

    // Write to primary replica first
    const primaryServer = chunkServers[0]
    await primaryServer.writeChunk(chunkId, data, checksum)
    
    replicas.push({
      chunkServerId: primaryServer.serverId,
      location: primaryServer.location,
      status: 'ACTIVE'
    })

    // Replicate to secondary servers
    for (let i = 1; i < chunkServers.length; i++) {
      const server = chunkServers[i]
      try {
        await server.writeChunk(chunkId, data, checksum)
        replicas.push({
          chunkServerId: server.serverId,
          location: server.location,
          status: 'ACTIVE'
        })
      } catch (error) {
        console.error(`Failed to replicate chunk ${chunkId} to ${server.serverId}:`, error)
      }
    }

    return {
      id: chunkId,
      size: data.length,
      checksum,
      replicas
    }
  }

  private async readChunk(chunkId: string): Promise<Buffer> {
    const chunkInfo = await this.master.getChunkInfo(chunkId)
    if (!chunkInfo) {
      throw new Error(`Chunk ${chunkId} not found`)
    }

    // Try to read from active replicas
    for (const replica of chunkInfo.replicas) {
      if (replica.status === 'ACTIVE') {
        const server = this.chunkServers.get(replica.chunkServerId)
        if (server) {
          try {
            const data = await server.readChunk(chunkId)
            
            // Verify checksum
            const checksum = this.calculateChecksum(data)
            if (checksum === chunkInfo.checksum) {
              return data
            } else {
              console.warn(`Checksum mismatch for chunk ${chunkId} on server ${server.serverId}`)
              replica.status = 'CORRUPTED'
            }
          } catch (error) {
            console.error(`Failed to read chunk ${chunkId} from ${server.serverId}:`, error)
          }
        }
      }
    }

    throw new Error(`No valid replicas found for chunk ${chunkId}`)
  }

  async deleteFile(path: string): Promise<void> {
    const file = this.files.get(path)
    if (!file) {
      throw new Error(`File ${path} not found`)
    }

    // Delete all chunks
    for (const chunk of file.chunks) {
      await this.deleteChunk(chunk.id)
    }

    this.files.delete(path)
    await this.master.unregisterFile(path)
  }

  private async deleteChunk(chunkId: string): Promise<void> {
    const chunkInfo = await this.master.getChunkInfo(chunkId)
    if (!chunkInfo) return

    // Delete from all replicas
    for (const replica of chunkInfo.replicas) {
      const server = this.chunkServers.get(replica.chunkServerId)
      if (server) {
        try {
          await server.deleteChunk(chunkId)
        } catch (error) {
          console.error(`Failed to delete chunk ${chunkId} from ${server.serverId}:`, error)
        }
      }
    }

    await this.master.unregisterChunk(chunkId)
  }

  // StreamFlix specific operations
  async storeVideo(videoId: string, videoData: Buffer): Promise<string> {
    const videoPath = `/videos/${videoId}.mp4`
    await this.writeFile(videoPath, videoData)
    return videoPath
  }

  async getVideo(videoId: string): Promise<Buffer> {
    const videoPath = `/videos/${videoId}.mp4`
    return await this.readFile(videoPath)
  }

  async storeVideoSegment(videoId: string, segmentIndex: number, segmentData: Buffer): Promise<void> {
    const segmentPath = `/videos/${videoId}/segment_${segmentIndex}.ts`
    await this.writeFile(segmentPath, segmentData)
  }

  async getVideoSegment(videoId: string, segmentIndex: number): Promise<Buffer> {
    const segmentPath = `/videos/${videoId}/segment_${segmentIndex}.ts`
    return await this.readFile(segmentPath)
  }

  async storeThumbnail(videoId: string, thumbnailData: Buffer): Promise<void> {
    const thumbnailPath = `/thumbnails/${videoId}.jpg`
    await this.writeFile(thumbnailPath, thumbnailData)
  }

  async getStorageStats(): Promise<{
    totalFiles: number
    totalSize: number
    totalChunks: number
    replicationFactor: number
    chunkServers: number
  }> {
    let totalSize = 0
    let totalChunks = 0

    for (const file of this.files.values()) {
      totalSize += file.size
      totalChunks += file.chunks.length
    }

    return {
      totalFiles: this.files.size,
      totalSize,
      totalChunks,
      replicationFactor: 3,
      chunkServers: this.chunkServers.size
    }
  }

  private generateChunkId(): string {
    return `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private calculateChecksum(data: Buffer): string {
    const crypto = require('crypto')
    return crypto.createHash('md5').update(data).digest('hex')
  }
}

class ColossusMaster {
  private files: Map<string, ColossusFile> = new Map()
  private chunks: Map<string, ColossusChunk> = new Map()
  private chunkServers: Map<string, ColossusChunkServer> = new Map()

  async registerFile(path: string, file: ColossusFile): Promise<void> {
    this.files.set(path, file)
  }

  async unregisterFile(path: string): Promise<void> {
    this.files.delete(path)
  }

  async registerChunk(chunkId: string, chunk: ColossusChunk): Promise<void> {
    this.chunks.set(chunkId, chunk)
  }

  async unregisterChunk(chunkId: string): Promise<void> {
    this.chunks.delete(chunkId)
  }

  async getChunkInfo(chunkId: string): Promise<ColossusChunk | null> {
    return this.chunks.get(chunkId) || null
  }

  registerChunkServer(serverId: string, server: ColossusChunkServer): void {
    this.chunkServers.set(serverId, server)
  }

  async selectChunkServers(count: number): Promise<ColossusChunkServer[]> {
    const servers = Array.from(this.chunkServers.values())
    
    // Simple selection - in production, consider load balancing, geography, etc.
    const selected: ColossusChunkServer[] = []
    const shuffled = servers.sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      selected.push(shuffled[i])
    }
    
    return selected
  }

  async performGarbageCollection(): Promise<void> {
    // Find orphaned chunks and clean them up
    const referencedChunks = new Set<string>()
    
    for (const file of this.files.values()) {
      for (const chunk of file.chunks) {
        referencedChunks.add(chunk.id)
      }
    }
    
    for (const chunkId of this.chunks.keys()) {
      if (!referencedChunks.has(chunkId)) {
        await this.unregisterChunk(chunkId)
        
        // Delete from chunk servers
        const chunk = this.chunks.get(chunkId)
        if (chunk) {
          for (const replica of chunk.replicas) {
            const server = this.chunkServers.get(replica.chunkServerId)
            if (server) {
              await server.deleteChunk(chunkId)
            }
          }
        }
      }
    }
  }
}

class ColossusChunkServer {
  private chunks: Map<string, Buffer> = new Map()
  private checksums: Map<string, string> = new Map()

  constructor(public serverId: string, public location: string) {}

  async writeChunk(chunkId: string, data: Buffer, checksum: string): Promise<void> {
    // Verify checksum
    const calculatedChecksum = require('crypto').createHash('md5').update(data).digest('hex')
    if (calculatedChecksum !== checksum) {
      throw new Error(`Checksum mismatch for chunk ${chunkId}`)
    }

    this.chunks.set(chunkId, data)
    this.checksums.set(chunkId, checksum)
  }

  async readChunk(chunkId: string): Promise<Buffer> {
    const data = this.chunks.get(chunkId)
    if (!data) {
      throw new Error(`Chunk ${chunkId} not found on server ${this.serverId}`)
    }

    // Verify integrity
    const storedChecksum = this.checksums.get(chunkId)
    const calculatedChecksum = require('crypto').createHash('md5').update(data).digest('hex')
    
    if (storedChecksum !== calculatedChecksum) {
      throw new Error(`Chunk ${chunkId} is corrupted on server ${this.serverId}`)
    }

    return data
  }

  async deleteChunk(chunkId: string): Promise<void> {
    this.chunks.delete(chunkId)
    this.checksums.delete(chunkId)
  }

  getStorageInfo(): { chunkCount: number; totalSize: number } {
    let totalSize = 0
    for (const chunk of this.chunks.values()) {
      totalSize += chunk.length
    }

    return {
      chunkCount: this.chunks.size,
      totalSize
    }
  }
}