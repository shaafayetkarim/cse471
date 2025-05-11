import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      // Verify token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
      
      // Added better error handling for the JWT verification
      let payload;
      try {
        const verified = await jwtVerify(token, secret);
        payload = verified.payload;
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        return NextResponse.json(
          { error: 'Invalid or expired authentication token' },
          { status: 401 }
        );
      }

      if (!payload || !payload.id) {
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 401 }
        );
      }

      const userId = payload.id as string;
      
      // Get the form data from request
      const formData = await request.formData();
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const writingPhase = formData.get('status') as string;
      const files = formData.getAll('files') as File[];

      // Create the post
      const post = await prisma.post.create({
        data: {
          title,
          content,
          status: "draft",
          writingPhase,
          excerpt: content.slice(0, 150) + "...",
          authorId: userId,
          wordCount: content.split(/\s+/).length,
        },
      });

      // Handle file attachments if any
      const attachmentPromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        return prisma.attachment.create({
          data: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileUrl: 'mongodb-file-url', // In production, use proper file storage
            postId: post.id,
          },
        });
      });

      // Save all attachments
      if (attachmentPromises.length > 0) {
        await Promise.all(attachmentPromises);
      }

      return NextResponse.json({ 
        success: true, 
        postId: post.id,
        writingPhase: writingPhase
      });

    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}