import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager } from '@/lib/database/distributed/database-manager'

const dbManager = new DatabaseManager({
  bigtable: {
    projectId: 'streamflix-prod',
    instanceId: 'streamflix-instance',
    tables: ['user_watch_history', 'video_metrics', 'user_recommendations', 'search_index']
  },
  spanner: {
    projectId: 'streamflix-prod',
    instanceId: 'streamflix-spanner',
    databaseId: 'streamflix-db'
  },
  colossus: {
    replicationFactor: 3,
    chunkSize: 67108864
  }
})

export async function GET(request: NextRequest) {
  try {
    const health = await dbManager.getSystemHealth()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      systems: health,
      overall: 'healthy'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}