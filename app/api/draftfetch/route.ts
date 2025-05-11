import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const writingPhase = searchParams.get('writingPhase') || 'all';
    
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

    // Prepare writing phase filter
    let phaseCondition = {};
    if (writingPhase !== 'all') {
      phaseCondition = {
        writingPhase: writingPhase
      };
    }
    
    // Query the database
    const drafts = await prisma.post.findMany({
      where: {
        authorId: userId,
        status: "draft",
        ...phaseCondition,
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
      select: {
        id: true,
        title: true,
        excerpt: true,
        writingPhase: true,
        createdAt: true,
        wordCount: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format the results
    const formattedDrafts = drafts.map(draft => ({
      id: draft.id,
      title: draft.title,
      excerpt: draft.excerpt || '',
      writingPhase: draft.writingPhase,
      date: draft.updatedAt.toISOString(),
      wordCount: draft.wordCount || 0
    }));
    
    return NextResponse.json(formattedDrafts);
    
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
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

    // Get the post ID from the URL
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Verify the post belongs to the user
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.authorId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this post" },
        { status: 403 }
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: {
        id: postId
      }
    });

    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}