// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create a JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // Set cookie - FIX: Use cookieStore directly, not cookies().set
    const response = NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      success: true 
    });
    
    // Set the cookie on the response object
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}