"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PenTool, FileText, FolderOpen, ArrowRight, Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MotionDiv, MotionCard, cardHover, staggerContainer, slideUp } from "@/components/ui/motion"
import { useUser } from '@/hooks/useUser'

// Define types for our data
interface RecentPost {
  id: string
  title: string
  date: string
}

interface Draft {
  id: string
  title: string
  status: string
  date: string
}

interface Stats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  generations: string
}

interface DashboardData {
  stats: Stats
  recentPosts: RecentPost[]
  drafts: Draft[]
}

interface User {
  id: string
  name: string
  email: string
  generationsLeft: number
  generationsTotal: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading } = useUser()

  useEffect(() => {
    if (loading) return;

    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/dashboard')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch dashboard data')
        }

        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [loading])

  // Create stats array from data
  const stats = data ? [
    { title: "Total Blogs", value: data.stats.totalPosts.toString() },
    { title: "Published", value: data.stats.publishedPosts.toString() },
    { title: "Drafts", value: data.stats.draftPosts.toString() },
    { title: "Generations Left", value: data.stats.generations },
  ] : []

  // Show loading state during user loading or data loading
  if (loading || (isLoading && !error)) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show login message if user is not found after loading is complete
  if (!user) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <p className="text-lg">Please log in to view the dashboard</p>
          <Button className="mt-4" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Show error message if there was an error loading data
  if (error) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <p className="text-lg text-red-500">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <MotionDiv
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="container py-8 md:py-12"
    >
      <MotionDiv variants={slideUp} className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}! Here's an overview of your blog content.</p>
        </div>
        <Button asChild className="group transition-all duration-300 hover:shadow-md">
          <Link href="/generate" className="flex items-center">
            <PenTool className="mr-2 h-4 w-4" />
            <span>Generate New Blog</span>
          </Link>
        </Button>
      </MotionDiv>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <MotionCard
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="overflow-hidden border-none bg-card shadow transition-all duration-300 hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </MotionCard>
        ))}
      </div>

      <MotionDiv
        variants={slideUp}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="mb-6 w-full justify-start sm:w-auto">
            <TabsTrigger value="recent" className="transition-all duration-300">Recent Ideas</TabsTrigger>
            <TabsTrigger value="drafts" className="transition-all duration-300">Saved Drafts</TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="mt-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data && data.recentPosts.map((post, index) => (
                <MotionDiv
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover="hover"
                  variants={cardHover}
                >
                  <Card className="h-full border-none shadow transition-all duration-300 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
                      <CardDescription>{post.date}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button variant="outline" className="group w-full" asChild>
                        <Link href={`/generate?idea=${post.id}`} className="flex items-center justify-center">
                          Expand Idea
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </MotionDiv>
              ))}
              {data && data.recentPosts.length === 0 && (
                <div className="col-span-3 flex justify-center py-10 text-center text-muted-foreground">
                  <p>No recent ideas yet. Generate your first blog!</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="drafts" className="mt-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data && data.drafts.map((draft, index) => (
                <MotionDiv
                  key={draft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover="hover"
                  variants={cardHover}
                >
                  <Card className="h-full border-none shadow transition-all duration-300 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-lg">{draft.title}</CardTitle>
                      <CardDescription className="flex items-center justify-between">
                        <span>{draft.date}</span>
                        <span className={`rounded-full px-2 py-1 text-xs ${draft.status === "Ready to Publish"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                          }`}>
                          {draft.status}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="w-full transition-all duration-300 hover:bg-primary/10" asChild>
                        <Link href={`/editor/${draft.id}`}>
                          <FileText className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full transition-all duration-300 hover:bg-primary/10" asChild>
                        <Link href={`/collections?draft=${draft.id}`}>
                          <FolderOpen className="mr-2 h-4 w-4" /> Add to Collection
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </MotionDiv>
              ))}
              {data && data.drafts.length === 0 && (
                <div className="col-span-3 flex justify-center py-10 text-center text-muted-foreground">
                  <p>No draft posts yet. Start creating!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </MotionDiv>
    </MotionDiv>
  )
}

//user handled by fahim
// user hook to get user data