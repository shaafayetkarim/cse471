"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Link2,
  ListOrdered,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  X,
  Upload,
  FileText,
  Paperclip
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MotionDiv, MotionButton, fadeIn, slideUp } from "@/components/ui/motion"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function EditorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState("Needs Editing")
  const [isSaving, setIsSaving] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // File attachment states
  const [attachments, setAttachments] = useState<File[]>([])
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Get title from URL query parameter
  useEffect(() => {
    const titleFromQuery = searchParams.get('title')
    
    if (titleFromQuery) {
      const decodedTitle = decodeURIComponent(titleFromQuery)
      setTitle(decodedTitle)
      // Generate initial content based on the title
      generateInitialContent(decodedTitle)
    } else {
      // Default title and content if no query parameter is provided
      setTitle("Getting Started with Next.js")
      setContent(
        "Next.js is a React framework that enables server-side rendering and static site generation for React applications. It's designed to make it easier to build production-ready React applications by providing a set of features that are commonly needed in web applications.\n\nIn this blog post, we'll explore the key features of Next.js and how to get started with it."
      )
    }
  }, [searchParams])

  // Function to generate initial content based on the title
  const generateInitialContent = async (title: string) => {
    setIsGenerating(true)
    toast({
      title: "Generating content",
      description: "Gemini AI is generating initial content based on your selected idea...",
    })

    try {
      // Call the Gemini API to generate initial content based on the title
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'generate',
          title: title 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate initial content');
      }

      const data = await response.json();
      setContent(data.generatedContent || "Start writing your blog post here...");
      
      toast({
        title: "Content generated",
        description: "Gemini AI has created initial content for your blog",
      })
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate initial content. You can start writing from scratch.",
        variant: "destructive",
      })
      setContent("Start writing your blog post here...");
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your blog post",
        variant: "destructive",
      })
      return
    }
  
    setIsSaving(true)
  
    try {
      // Create FormData and append the post data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('status', status); // Current writing phase from dropdown
      
      // Append all attachments
      attachments.forEach((file) => {
        formData.append('files', file);
      });
  
      // Send the request to save draft
      const response = await fetch('/api/posts/draft', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save draft');
      }
  
      const data = await response.json();
  
      toast({
        title: "Draft saved",
        description: `Your draft has been saved in "${status}" phase`,
      });
  
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  const handlePublish = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your blog post",
        variant: "destructive",
      })
      return
    }
  
    // Only allow publishing if writing phase is "Ready to Publish"
    if (status !== "Ready to Publish") {
      toast({
        title: "Cannot publish",
        description: "Post must be in 'Ready to Publish' phase before publishing",
        variant: "destructive",
      })
      return
    }
  
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      
      // Append all attachments
      attachments.forEach((file) => {
        formData.append('files', file);
      });
  
      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish post');
      }
  
      const data = await response.json();
      
      // Send notification email when post is published
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: `New Blog Published: ${title}`,
            blogTitle: title,
            blogExcerpt: content.slice(0, 150) + (content.length > 150 ? '...' : ''),
            postId: data.postId, // Assuming the API returns the post ID
          }),
        });
        
        console.log('Publication notification email sent');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't block the publish process if email fails
      }
  
      toast({
        title: "Blog published",
        description: "Your blog post has been published successfully",
      });
  
      // Navigate to dashboard
      router.push("/dashboard");
  
    } catch (error) {
      console.error('Error publishing:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to publish post",
        variant: "destructive",
      });
    }
  }

  const handleAIImprove = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to improve",
        variant: "destructive",
      })
      return
    }

    setIsImproving(true)
    toast({
      title: "AI Improvement",
      description: "Gemini AI is analyzing and improving your content...",
    })

    try {
      console.log("Improving content with Gemini AI...")
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to improve content');
      }

      const data = await response.json();
      setContent(data.improvedContent);
      
      toast({
        title: "Content improved",
        description: "Gemini AI has enhanced your blog content",
      })
    } catch (error) {
      console.error('Error improving content:', error);
      toast({
        title: "Error",
        description: "Failed to improve content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsImproving(false)
    }
  }

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadError(null);
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size exceeds the 10MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }
    
    // Simulate upload process
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create file preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
    
    // Simulated upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setAttachments(prev => [...prev, file]);
        toast({
          title: "File uploaded",
          description: `${file.name} has been attached to your blog post`,
        });
      }
    }, 200);
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    if (attachments.length === 1) {
      setFilePreview(null);
    }
    toast({
      title: "File removed",
      description: "The attachment has been removed from your blog post",
    });
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <MotionDiv initial="hidden" animate="visible" variants={slideUp} className="container mx-auto p-4 sm:p-6 md:p-8">
      <MotionDiv
        variants={fadeIn}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="transition-all duration-300 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Blog</h1>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px] transition-all duration-200 focus:ring-2 focus:ring-primary/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Needs Editing">Needs Editing</SelectItem>
              <SelectItem value="Ready to Publish">Ready to Publish</SelectItem>
              <SelectItem value="Incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>
          
        </div>
      </MotionDiv>

      <MotionDiv variants={fadeIn} transition={{ delay: 0.2 }} className="mb-4 space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter blog title"
          className="text-lg transition-all duration-200 focus:ring-2 focus:ring-primary/50"
        />
      </MotionDiv>

      <MotionDiv
        variants={fadeIn}
        transition={{ delay: 0.3 }}
        className="mb-4 overflow-hidden rounded-md border shadow-sm transition-all duration-300 hover:shadow-md"
      >
        <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
          <MotionButton
            variant="ghost"
            size="sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Bold className="h-4 w-4" />
          </MotionButton>
          <MotionButton
            variant="ghost"
            size="sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Italic className="h-4 w-4" />
          </MotionButton>
          <MotionButton
            variant="ghost"
            size="sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Underline className="h-4 w-4" />
          </MotionButton>
          <Separator orientation="vertical" className="mx-1 h-8" />
          <MotionButton
            variant="ghost"
            size="sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <AlignLeft className="h-4 w-4" />
          </MotionButton>
          <MotionButton
            variant="ghost"
            size="sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <AlignCenter className="h-4 w-4" />
          </MotionButton>
          <MotionButton
            variant="ghost"
            size="sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <AlignRight className="h-4 w-4" />
          </MotionButton>
          <Separator orientation="vertical" className="mx-1 h-8" />
          <MotionButton
            variant="ghost"
            size="sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ListOrdered className="h-4 w-4" />
          </MotionButton>
          <MotionButton
            variant="ghost"
            size="sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link2 className="h-4 w-4" />
          </MotionButton>
          <MotionButton
            variant="ghost"
            size="sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={handleFileClick}
          >
            <Paperclip className="h-4 w-4" />
          </MotionButton>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <div className="ml-auto">
            <MotionButton
              variant="ghost"
              size="sm"
              onClick={handleAIImprove}
              disabled={isImproving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <Sparkles className="mr-2 h-4 w-4 transition-all duration-300 group-hover:text-amber-500" />
              {isImproving ? "Improving..." : "AI Improve"}
            </MotionButton>
          </div>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your blog content here..."
          className="min-h-[500px] resize-none rounded-none border-0 p-4 focus-visible:ring-0"
        />
      </MotionDiv>

      {/* File Upload Progress and Error Display */}
      {isUploading && (
        <MotionDiv 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        </MotionDiv>
      )}

      {uploadError && (
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert variant="destructive">
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        </MotionDiv>
      )}

      {/* Attachments Display */}
      {attachments.length > 0 && (
        <MotionDiv 
          variants={fadeIn} 
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="mb-2 font-medium">Attachments ({attachments.length})</h3>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between rounded-md border p-3 transition-all hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-orange-500" />
                  )}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeAttachment(index)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Image Preview */}
          {filePreview && attachments.some(file => file.type.startsWith('image/')) && (
            <div className="mt-4 overflow-hidden rounded-md border">
              <div className="bg-muted p-2 text-xs font-medium">Image Preview</div>
              <div className="p-2">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="max-h-60 rounded object-contain" 
                />
              </div>
            </div>
          )}
        </MotionDiv>
      )}

      <MotionDiv variants={fadeIn} transition={{ delay: 0.4 }} className="flex flex-col justify-end gap-2 sm:flex-row">
        <Button
          variant="outline"
          onClick={handleFileClick}
          disabled={isUploading}
          className="transition-all duration-300 hover:bg-primary/10"
        >
          <Upload className="mr-2 h-4 w-4" />
          Attach File
        </Button>
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isSaving || isImproving || isUploading}
          className="transition-all duration-300 hover:bg-primary/10"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        <Button 
          onClick={handlePublish} 
          disabled={isImproving || isUploading}
          className="transition-all duration-300 hover:shadow-md"
        >
          Publish
        </Button>
      </MotionDiv>
    </MotionDiv>
  )
}