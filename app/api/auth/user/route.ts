// app/api/auth/user/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || ''))
  if (!payload || typeof payload !== 'object' || !('id' in payload)) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: true,
        generationsLeft: true,
        generationsTotal: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}