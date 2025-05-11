// app/api/auth/send-confirmation/route.ts

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Send email using Resend's default template with onboarding@resend.dev
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend's default domain
      to: email,
      subject: 'Welcome to BlogAI!',
      text: `Hello ${name},\n\nThank you for joining BlogAI! We're excited to have you on board.\n\nWith BlogAI, you can create engaging blog posts with AI assistance, manage your writing projects in one place, and get inspiration when you need it.\n\nReady to start your writing journey? Log in to your account now.\n\nIf you have any questions or need assistance, feel free to reach out to our support team.\n\nHappy writing!\nThe BlogAI Team`,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      data 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}


