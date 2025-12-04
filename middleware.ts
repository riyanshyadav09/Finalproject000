import { NextRequest, NextResponse } from 'next/server'
import { SSL_CONFIG } from './lib/security/ssl-config'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`, 301)
  }

  // Apply security headers
  Object.entries(SSL_CONFIG.headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Secure cookies
  const cookieHeader = response.headers.get('set-cookie')
  if (cookieHeader) {
    const secureCookie = cookieHeader
      .replace(/; secure/gi, '')
      .replace(/; httponly/gi, '')
      + '; Secure; HttpOnly; SameSite=Strict'
    response.headers.set('set-cookie', secureCookie)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}