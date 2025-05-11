// app/api/posts/[postId]/collections/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>) || {}
    
    const token = cookies['auth-token']
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const result = await verifyJWT(token)
    if (!result?.payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      include: { collections: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post.collections)
  } catch (error) {
    console.error('Error fetching post collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>) || {}
    
    const token = cookies['auth-token']
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const result = await verifyJWT(token)
    if (!result?.payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { collectionIds } = await request.json()

    const updatedPost = await prisma.post.update({
      where: { id: params.postId },
      data: {
        collections: {
          set: collectionIds.map((id: string) => ({ id }))
        }
      },
      include: { collections: true }
    })

    return NextResponse.json(updatedPost.collections)
  } catch (error) {
    console.error('Error updating post collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


