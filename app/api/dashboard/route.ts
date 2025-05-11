// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || '')
    );

    if (!payload || typeof payload !== 'object' || !('id' in payload)) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.id as string;
    console.log("User ID from token:", userId);
    
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        generationsLeft: true,
        generationsTotal: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Count total posts
    const totalPosts = await prisma.post.count({
      where: { authorId: userId },
    });
    
    // Count published posts
    const publishedPosts = await prisma.post.count({
      where: { 
        authorId: userId,
        status: "published" 
      },
    });
    
    // Count draft posts
    const draftPosts = await prisma.post.count({
      where: { 
        authorId: userId,
        status: "draft" 
      },
    });
    
    // Fetch recent posts (ideas)
    const recentPosts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });
    
    // Fetch draft posts
    const drafts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: "draft" 
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        generations: `${user.generationsLeft}/${user.generationsTotal}`,
      },
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        date: formatDate(post.createdAt),
      })),
      drafts: drafts.map(draft => ({
        id: draft.id,
        title: draft.title,
        status: draft.status === "draft" ? "Needs Editing" : "Ready to Publish",
        date: formatDate(draft.updatedAt),
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

// Helper function to format dates
function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const day = 24 * 60 * 60 * 1000;
  const week = 7 * day;
  
  if (diff < day) {
    return "Today";
  } else if (diff < 2 * day) {
    return "Yesterday";
  } else if (diff < week) {
    return `${Math.floor(diff / day)} days ago`;
  } else {
    return `${Math.floor(diff / week)} week${Math.floor(diff / week) > 1 ? 's' : ''} ago`;
  }
}