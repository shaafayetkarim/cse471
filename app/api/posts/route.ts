// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const status = searchParams.get('status') || 'all';
    const dateFilter = searchParams.get('dateFilter') || 'all';
    
    // Get the token from cookies
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>) || {};
    
    const token = cookies['auth-token'];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify and decode the JWT
    const result = await verifyJWT(token);
    
    if (!result || !result.payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = result.payload.id as string;
    
    // Prepare date filter
    let dateCondition = {};
    if (dateFilter === 'last-week') {
      dateCondition = {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      };
    } else if (dateFilter === 'last-month') {
      dateCondition = {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      };
    }
    
    // Prepare status filter
    let statusCondition = {};
    if (status !== 'all') {
      statusCondition = {
        status: status
      };
    }
    
    // Query the database
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
        ...statusCondition,
        ...dateCondition,
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            excerpt: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        collections: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Format the results to include tags (from collections)
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || post.content.substring(0, 150) + '...',
      status: post.status,
      date: post.createdAt.toISOString(),
      tags: post.collections.map(collection => collection.name)
    }));
    
    return NextResponse.json(formattedPosts);
    
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}