import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from "@prisma/client";
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Get the user's email from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get email content from the request body
    const { subject, blogTitle, blogExcerpt, postId } = await request.json();

    // Generate HTML for the email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .container { padding: 20px; border: 1px solid #eaeaea; border-radius: 5px; }
          .header { background-color: #f5f5f5; padding: 10px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px 0; }
          .footer { font-size: 12px; color: #666; padding-top: 20px; border-top: 1px solid #eaeaea; }
          .button { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Blog Published Successfully</h2>
          </div>
          <div class="content">
            <p>Hello ${user.name || 'there'},</p>
            <p>Your blog post <strong>${blogTitle}</strong> has been published successfully!</p>
            <p>Here's a preview:</p>
            <blockquote>${blogExcerpt}</blockquote>
            
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email
    const emailResult = await resend.emails.send({
      from: 'onboarding@resend.dev' ,
      to: user.email,
      subject: subject,
      html: htmlContent,
    });

    if (emailResult.error) {
      throw new Error(emailResult.error.message);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}