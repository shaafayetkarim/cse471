"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeIn, slideUp, staggerContainer } from "@/components/ui/motion"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background py-6">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <MotionDiv initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ duration: 0.5, type: "spring" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
              </svg>
            </MotionDiv>
            <span className="text-xl font-bold">BlogAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Log in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <MotionSection
        className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center md:px-8 md:py-24"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-4xl space-y-8">
          <MotionDiv variants={slideUp} className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Generate Amazing Blog Content with AI
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Create engaging blog posts, articles, and content in seconds with our advanced AI blog generator.
            </p>
          </MotionDiv>

          <MotionDiv variants={fadeIn} className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="group transition-all duration-300">
              <Link href="/login" className="flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
          </MotionDiv>

          <MotionDiv variants={fadeIn} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[
              { title: "AI-Powered", description: "Generate high-quality content with advanced AI technology" },
              { title: "Time-Saving", description: "Create blog posts in minutes instead of hours" },
              { title: "Customizable", description: "Tailor content to your specific needs and audience" },
            ].map((feature, index) => (
              <MotionDiv
                key={index}
                className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </MotionDiv>
            ))}
          </MotionDiv>
        </div>
      </MotionSection>

      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center md:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BlogAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

