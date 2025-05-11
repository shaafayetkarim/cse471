import Link from "next/link"
import { PenTool, Github, Twitter, Linkedin } from 'lucide-react'
import { MotionDiv } from "@/components/ui/motion"

export function Footer() {
  // Get current year for copyright
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="mt-auto border-t bg-background py-8">
      <div className="mx-auto max-w-[2000px]">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2">
                <MotionDiv
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <PenTool className="h-6 w-6" />
                </MotionDiv>
                <span className="text-xl font-bold">BlogAI</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Create engaging blog content with AI in seconds. Save time and boost your content strategy.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-4 text-sm font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-4 text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {currentYear} BlogAI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

