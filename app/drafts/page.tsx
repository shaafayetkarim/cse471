"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MotionDiv, MotionCard, cardHover, fadeIn, slideUp, staggerContainer } from "@/components/ui/motion"

interface Draft {
  id: string
  title: string
  excerpt: string
  writingPhase: string
  date: string
  wordCount: number
}

export default function DraftsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [writingPhase, setWritingPhase] = useState("all")
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrafts()
  }, [searchQuery, writingPhase])

  const fetchDrafts = async () => {
    try {
      const queryParams = new URLSearchParams({
        query: searchQuery,
        writingPhase: writingPhase
      })
      
      const response = await fetch(`/api/draftfetch?${queryParams}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch drafts')
      }
      
      const data = await response.json()
      setDrafts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load drafts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDraft = async (id: string) => {
    try {
      const response = await fetch(`/api/draftfetch?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete draft')
      }
      
      setDrafts(drafts.filter(draft => draft.id !== id))
      toast({
        title: "Success",
        description: "Draft deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete draft",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading drafts...</div>
      </div>
    )
  }

  return (
    <MotionDiv
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="container mx-auto p-4 sm:p-6 md:p-8"
    >
      <MotionDiv variants={slideUp} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Blog Drafts</h1>
        <p className="text-muted-foreground">Manage your saved blog drafts</p>
      </MotionDiv>

      <MotionDiv variants={fadeIn} transition={{ delay: 0.1 }} className="mb-6 flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search drafts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs transition-all duration-200 focus:ring-2 focus:ring-primary/50"
        />
        <Select value={writingPhase} onValueChange={setWritingPhase}>
          <SelectTrigger className="sm:max-w-xs transition-all duration-200 focus:ring-2 focus:ring-primary/50">
            <SelectValue placeholder="Filter by phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            <SelectItem value="Ready to Publish">Ready to Publish</SelectItem>
            <SelectItem value="Needs Editing">Needs Editing</SelectItem>
            <SelectItem value="Incomplete">Incomplete</SelectItem>
          </SelectContent>
        </Select>
      </MotionDiv>

      {drafts.length === 0 ? (
        <MotionDiv variants={fadeIn} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="mb-4 text-center text-muted-foreground">No drafts found matching your criteria</p>
              <Button asChild className="transition-all duration-300 hover:shadow-md">
                <Link href="/generate">Create New Blog</Link>
              </Button>
            </CardContent>
          </Card>
        </MotionDiv>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft, index) => (
            <MotionCard
              key={draft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover="hover"
              variants={cardHover}
              className="border-none shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-2">{draft.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(draft.date).toLocaleDateString()} • {draft.wordCount} words
                    </CardDescription>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      draft.writingPhase === "Ready to Publish"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                        : draft.writingPhase === "Needs Editing"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {draft.writingPhase}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{draft.excerpt}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 transition-all duration-300 hover:bg-primary/10"
                    asChild
                  >
                    <Link href={`/editor/${draft.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 transition-all duration-300 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-none shadow-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the draft.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="transition-all duration-300">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="bg-destructive text-destructive-foreground transition-all duration-300 hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </MotionCard>
          ))}
        </div>
      )}
    </MotionDiv>
  )
}