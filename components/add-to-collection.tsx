// components/add-to-collection-dialog.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Collection {
  id: string
  name: string
  description: string | null
}

interface AddToCollectionDialogProps {
  postId: string
  isOpen: boolean
  onClose: () => void
}

export function AddToCollectionDialog({ postId, isOpen, onClose }: AddToCollectionDialogProps) {
  const { toast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCollections()
    }
  }, [isOpen])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (!response.ok) throw new Error('Failed to fetch collections')
      const data = await response.json()
      setCollections(data)
      
      // Fetch current collections for this post
      const postCollections = await fetch(`/api/posts/${postId}/collections`)
      if (postCollections.ok) {
        const currentCollections = await postCollections.json()
        setSelectedCollections(currentCollections.map((c: Collection) => c.id))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/posts/${postId}/collections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionIds: selectedCollections }),
      })

      if (!response.ok) throw new Error('Failed to update collections')

      toast({
        title: "Success",
        description: "Post collections updated successfully",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update collections",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collections</DialogTitle>
          <DialogDescription>
            Choose the collections you want to add this post to
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No collections found. Create a collection first.
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {collections.map((collection) => (
              <div key={collection.id} className="flex items-start space-x-3">
                <Checkbox
                  id={collection.id}
                  checked={selectedCollections.includes(collection.id)}
                  onCheckedChange={(checked) => {
                    setSelectedCollections(prev =>
                      checked
                        ? [...prev, collection.id]
                        : prev.filter(id => id !== collection.id)
                    )
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={collection.id}>{collection.name}</Label>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}