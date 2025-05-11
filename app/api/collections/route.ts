// app/api/collections/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    
    // Get token from cookies
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
    
    const result = await verifyJWT(token);
    if (!result?.payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = result.payload.id as string;

    const collections = await prisma.collection.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    
    const result = await verifyJWT(token);
    if (!result?.payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = result.payload.id as string;
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        userId,
      }
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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
    
    const result = await verifyJWT(token);
    if (!result?.payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = result.payload.id as string;

    // Verify ownership
    const collection = await prisma.collection.findUnique({
      where: { id }
    });

    if (!collection || collection.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.collection.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}