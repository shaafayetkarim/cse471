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

    // Verify token
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
    
    // Get the form data from request
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const files = formData.getAll('files') as File[];

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        status: "published",
        authorId: userId,
      },
    });

    // Handle file attachments if any
    const attachmentPromises = files.map(async (file) => {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Here you would typically upload the buffer to your storage service
      // For this example, we'll store the file data in MongoDB directly
      // In production, you should use a proper file storage service
      
      return prisma.attachment.create({
        data: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: 'mongodb-file-url', // In production, this would be your storage service URL
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
      postId: post.id 
    });

  } catch (error) {
    console.error('Error publishing post:', error);
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    );
  }
}