// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {SignJWT, jwtVerify, type JWTPayload} from 'jose';

// Define which paths require authentication
const protectedPaths = [ null]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path is protected
  const isPathProtected = protectedPaths.some((path) => 
    pathname === path || pathname.startsWith(`${path}/`)
  )
  
  if (isPathProtected) {
    // Get the token from cookies
    const token = request.cookies.get('auth-token')?.value
    
    // For debugging
    console.log("Path:", pathname, "Token:", token ? "exists" : "missing")
    
    // Verify the token
    const userData = token ? jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key')) : null
    
    // If no valid token, redirect to login
    if (!userData) {
      const url = new URL('/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

// Ensure this covers the dashboard path exactly
export const config = {
  matcher: [
    '/dashboard', 
    '/dashboard/:path*', 
    '/profile/:path*', 
    '/posts/:path*'
  ],
}