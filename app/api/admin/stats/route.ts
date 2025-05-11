// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count()
    
    // Get premium users count
    const premiumUsers = await prisma.user.count({
      where: { subscription: 'premium' }
    })
    
    // Get total posts count
    const totalPosts = await prisma.post.count()
    
    // Get posts created this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const postsThisMonth = await prisma.post.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })
    
    return NextResponse.json({
      totalUsers,
      premiumUsers,
      totalPosts,
      postsThisMonth
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}