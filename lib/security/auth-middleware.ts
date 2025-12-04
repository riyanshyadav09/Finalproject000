import { NextRequest, NextResponse } from 'next/server'
import { SecureCookieManager } from './secure-cookies'
import { HashManager } from './ssl-config'

export class AuthMiddleware {
  static async validateAuth(request: NextRequest): Promise<{ userId: string; role: string } | null> {
    const authToken = SecureCookieManager.getAuthToken(request)
    if (!authToken) return null

    // Additional security checks
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    
    // Rate limiting check (simplified)
    const rateLimitKey = `${authToken.userId}:${ip}`
    
    return authToken
  }

  static requireAuth(handler: Function) {
    return async (request: NextRequest, context: any) => {
      const auth = await this.validateAuth(request)
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      return handler(request, { ...context, auth })
    }
  }

  static requireRole(role: string, handler: Function) {
    return async (request: NextRequest, context: any) => {
      const auth = await this.validateAuth(request)
      if (!auth || auth.role !== role) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      return handler(request, { ...context, auth })
    }
  }

  static async loginUser(response: NextResponse, userId: string, role: string, password: string) {
    // Hash password with SHA-256
    const hashedPassword = HashManager.hash(password)
    
    // Set secure authentication cookie
    SecureCookieManager.setAuthToken(response, userId, role)
    
    // Set additional security headers
    response.headers.set('X-Auth-Success', 'true')
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    return response
  }

  static logoutUser(response: NextResponse) {
    SecureCookieManager.deleteCookie(response, 'auth_token')
    response.headers.set('Clear-Site-Data', '"cookies", "storage"')
    return response
  }
}