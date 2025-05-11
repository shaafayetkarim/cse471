import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to verify admin role
async function verifyAdmin() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || '')
    );

    if (!payload || typeof payload !== 'object' || !('id' in payload)) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      return null;
    }

    return payload.id as string;
  } catch (error) {
    return null;
  }
}

// GET /api/admin/users - Get all users
export async function GET() {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: true,
        generationsLeft: true,
        generationsTotal: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Handle user updates and deletion
export async function PATCH(request: Request) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, role, subscription } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Don't allow admin to update their own role
    if (userId === adminId && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change your own admin role' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (role && ['admin', 'user'].includes(role)) {
      updateData.role = role;
    }
    if (subscription && ['free', 'premium'].includes(subscription)) {
      updateData.subscription = subscription;
      // Update generations if upgrading to premium
      if (subscription === 'premium') {
        updateData.generationsLeft = 100;
        updateData.generationsTotal = 100;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: true,
        generationsLeft: true,
        generationsTotal: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users
export async function DELETE(request: Request) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Don't allow admin to delete themselves
    if (userId === adminId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}