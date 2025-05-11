"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SearchIcon, Filter, FileText, Calendar, Tag, Edit, FolderPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { AddToCollectionDialog } from "@/components/add-to-collection"

interface Post {
  id: string
  title: string
  excerpt: string
  status: string
  date: string
  tags: string[]
  collections?: string[]
}

export default function SearchPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  // Function to fetch posts
  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("query", searchQuery)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (dateFilter !== "all") params.append("dateFilter", dateFilter)
      if (selectedTags.length > 0) params.append("tags", selectedTags.join(","))
      
      const response = await fetch(`/api/posts?${params.toString()}`)
      
      if (response.status === 401) {
        toast({
          title: "Session expired",
          description: "Please login again to continue",
          variant: "destructive"
        })
        router.push('/login')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const data = await response.json()
      setPosts(data)
      
      // Extract all unique tags
      const tags = Array.from(new Set(data.flatMap((post: Post) => post.tags)))
      setAllTags(tags)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch on component mount
  useEffect(() => {
    fetchPosts()
  }, [])

  // Fetch when filters change - with debounce for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPosts()
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery, statusFilter, dateFilter, selectedTags])

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    )
  }

  // Filter posts by selected tags
  const filteredPosts = selectedTags.length > 0
    ? posts.filter(post => selectedTags.some(tag => post.tags.includes(tag)))
    : posts

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPosts()
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setDateFilter("all")
    setSelectedTags([])
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find your blog posts and ideas</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search blogs, ideas, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> More Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Refine your search results with additional filters</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <h3 className="mb-2 text-sm font-medium">Tags</h3>
                {allTags.length > 0 ? (
                  <div className="space-y-2">
                    {allTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`tag-${tag}`} 
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <Label htmlFor={`tag-${tag}`}>{tag}</Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags available</p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={resetFilters}>Reset</Button>
                  <SheetTrigger asChild>
                    <Button>Apply Filters</Button>
                  </SheetTrigger>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="mb-4 text-center text-muted-foreground">No results found matching your criteria</p>
            <Button asChild>
              <Link href="/generate">Create New Blog</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString()}
                      <FileText className="ml-2 h-3 w-3" />
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {post.status === "published" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedPostId(post.id)}
                      >
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Add to Collection
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/editor/${post.id}`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <div 
                        key={`${post.id}-${tag}`} 
                        className="flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs"
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={post.status === "published" ? `/preview/${post.id}` : `/editor/${post.id}`}>
                    {post.status === "published" ? "View Post" : "Continue Editing"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AddToCollectionDialog
        postId={selectedPostId!}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  )
}