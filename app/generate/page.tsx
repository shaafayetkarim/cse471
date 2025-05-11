"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Save, Loader2, RefreshCw } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { MotionDiv, fadeIn, slideUp } from "@/components/ui/motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function GeneratePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([])
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [partialSuccess, setPartialSuccess] = useState(false)
  
  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate blog ideas",
        variant: "destructive",
      })
      return
    }
    
    setIsGenerating(true)
    setGenerationError(null)
    setPartialSuccess(false)
    
    try {
      // Call the Gemini API endpoint to generate topics
      const response = await fetch('/api/gemini-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, keywords }),
      });

      const data = await response.json();
      
      if (data.success && data.topics) {
        setGeneratedIdeas(data.topics);
        
        if (data.partialSuccess) {
          setPartialSuccess(true);
          toast({
            title: "Partial success",
            description: data.message,
          });
        }
      } else {
        throw new Error(data.error || 'Failed to generate topics');
      }
    } catch (error: any) {
      console.error('Error generating topics:', error);
      setGenerationError(error.message || "Failed to generate blog topics. Please try again.");
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate blog topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }
  
  const handleSaveIdea = () => {
    if (!selectedIdea) {
      toast({
        title: "No idea selected",
        description: "Please select an idea to save",
        variant: "destructive",
      })
      return
    }
    
    // Simulate saving - replace with actual API call
    toast({
      title: "Idea saved",
      description: "Your blog idea has been saved to drafts",
    })
    
    // Navigate to drafts page
    router.push("/drafts")
  }
  
  const handleExpandIdea = () => {
    if (!selectedIdea) {
      toast({
        title: "No idea selected",
        description: "Please select an idea to expand",
        variant: "destructive",
      })
      return
    }
    
    // Navigate to editor page with the selected idea as the title
    toast({
      title: "Generating full blog",
      description: "Your full blog post is being generated",
    })
    
  const encodedTitle = encodeURIComponent(selectedIdea);
    router.push(`/editor/new?title=${encodedTitle}`);
  }

  return (
    <MotionDiv
      initial="hidden"
      animate="visible"
      variants={slideUp}
      className="container py-8 md:py-12"
    >
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Generate Blog Content</h1>
      
      <Tabs defaultValue="ideas" className="w-full">
        
        
        <TabsContent value="ideas" className="mt-6">
          <MotionDiv variants={fadeIn} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Blog Idea Generator</CardTitle>
                <CardDescription>
                  Enter a topic and optional keywords to generate blog ideas using Gemini AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input 
                    id="topic" 
                    placeholder="e.g., Digital Marketing, Web Development, AI" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (optional)</Label>
                  <Input 
                    id="keywords" 
                    placeholder="e.g., beginner, tutorial, trends" 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>
                
                {generationError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription className="flex items-center justify-between">
                      <span>{generationError}</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="ml-2 transition-all duration-300"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                {partialSuccess && (
                  <Alert className="mt-4 border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    <AlertDescription className="flex items-center justify-between">
                      <span>Only generated {generatedIdeas.length} topics instead of 5.</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="ml-2 transition-all duration-300"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate Again
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !topic}
                  className="w-full transition-all duration-300 hover:shadow-md"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Ideas with Gemini
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </MotionDiv>
          
          {generatedIdeas.length > 0 && (
            <MotionDiv 
              variants={fadeIn} 
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Card className="border-none shadow-md transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Generated Ideas</CardTitle>
                  <CardDescription>
                    Select an idea to save or expand into a full blog post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedIdeas.map((idea, index) => (
                      <MotionDiv
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-accent ${
                          selectedIdea === idea ? "border-primary bg-accent" : ""
                        }`}
                        onClick={() => setSelectedIdea(idea)}
                      >
                        {idea}
                      </MotionDiv>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:flex-row">
                  <Button 
                    variant="outline" 
                    onClick={handleSaveIdea}
                    disabled={!selectedIdea}
                    className="w-full transition-all duration-300 hover:bg-primary/10"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save to Drafts
                  </Button>
                  <Button 
                    onClick={handleExpandIdea}
                    disabled={!selectedIdea}
                    className="w-full transition-all duration-300 hover:shadow-md"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Expand to Full Blog
                  </Button>
                </CardFooter>
              </Card>
            </MotionDiv>
          )}
        </TabsContent>
        
       
      </Tabs>
    </MotionDiv>
  )
}