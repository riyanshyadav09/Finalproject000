import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_CONFIG, DataEncryption } from './ssl-config'
import crypto from 'crypto'

export class SecureCookieManager {
  private static encryptionKey = process.env.COOKIE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')

  static setCookie(response: NextResponse, name: string, value: string, options?: Partial<typeof COOKIE_CONFIG>) {
    const encrypted = DataEncryption.encrypt(value, this.encryptionKey)
    const cookieValue = Buffer.from(JSON.stringify(encrypted)).toString('base64')
    
    const cookieOptions = {
      ...COOKIE_CONFIG,
      ...options
    }

    const cookieString = `${name}=${cookieValue}; Path=${cookieOptions.path}; Max-Age=${cookieOptions.maxAge}; ${cookieOptions.httpOnly ? 'HttpOnly; ' : ''}${cookieOptions.secure ? 'Secure; ' : ''}SameSite=${cookieOptions.sameSite}`
    
    response.headers.append('Set-Cookie', cookieString)
  }

  static getCookie(request: NextRequest, name: string): string | null {
    try {
      const cookieValue = request.cookies.get(name)?.value
      if (!cookieValue) return null

      const encryptedData = JSON.parse(Buffer.from(cookieValue, 'base64').toString('utf8'))
      return DataEncryption.decrypt(encryptedData, this.encryptionKey)
    } catch {
      return null
    }
  }

  static deleteCookie(response: NextResponse, name: string) {
    response.headers.append('Set-Cookie', `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`)
  }

  static setAuthToken(response: NextResponse, userId: string, role: string) {
    const tokenData = {
      userId,
      role,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    }
    
    this.setCookie(response, 'auth_token', JSON.stringify(tokenData), {
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
  }

  static getAuthToken(request: NextRequest): { userId: string; role: string } | null {
    try {
      const tokenString = this.getCookie(request, 'auth_token')
      if (!tokenString) return null

      const tokenData = JSON.parse(tokenString)
      
      // Check if token is expired
      if (Date.now() - tokenData.timestamp > 7 * 24 * 60 * 60 * 1000) {
        return null
      }

      return { userId: tokenData.userId, role: tokenData.role }
    } catch {
      return null
    }
  }
}