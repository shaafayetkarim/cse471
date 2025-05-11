"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Folder, FolderPlus, MoreHorizontal, Edit, Trash2, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Collection {
  id: string
  name: string
  description: string | null
  _count: {
    posts: number
  }
  createdAt: string
  updatedAt: string
}

export default function CollectionsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCollections = async () => {
    try {
      const response = await fetch(`/api/collections?query=${searchQuery}`)
      if (!response.ok) throw new Error('Failed to fetch collections')
      const data = await response.json()
      setCollections(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch collections",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCollections()
    }, 300) // Debounce search

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Collection name required",
        description: "Please enter a name for your collection",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription,
        }),
      })

      if (!response.ok) throw new Error('Failed to create collection')

      toast({
        title: "Success",
        description: `Collection "${newCollectionName}" has been created`,
      })

      setNewCollectionName("")
      setNewCollectionDescription("")
      setIsDialogOpen(false)
      fetchCollections()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCollection = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/collections?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete collection')

      toast({
        title: "Success",
        description: `Collection "${name}" has been deleted`,
      })

      fetchCollections()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground">Organize your blog posts into collections</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="mr-2 h-4 w-4" /> New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Collections help you organize your blog posts by topic or theme.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Web Development, Marketing Tips"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this collection is about..."
                  className="min-h-[100px]"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCollection} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : collections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="mb-4 text-center text-muted-foreground">
              {searchQuery
                ? "No collections found matching your search"
                : "You haven't created any collections yet"}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>Create New Collection</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card key={collection.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <CardTitle>{collection.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/collections/${collection.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Collection
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteCollection(collection.id, collection.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Collection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{collection.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {collection._count.posts} {collection._count.posts === 1 ? "post" : "posts"}
                  </span>
                  <span>Updated {new Date(collection.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/collections/${collection.id}`}>
                    <FileText className="mr-2 h-4 w-4" /> View Posts
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}