"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, PenTool } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MotionDiv, fadeIn, slideUp } from "@/components/ui/motion"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
    
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  const sendWelcomeEmail = async (name: string, email: string) => {
    try {
      const response = await fetch("/api/auth/send-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email })
      })

      if (!response.ok) {
        console.error("Failed to send welcome email")
      } else {
        console.log("Welcome email sent successfully")
      }
    } catch (error) {
      console.error("Email sending error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error creating account")
      }

      // Store the user data in localStorage for simplicity
      localStorage.setItem("userId", data.user.id)
      localStorage.setItem("userEmail", data.user.email)
      localStorage.setItem("userName", data.user.name || "")

      // Send welcome email
      await sendWelcomeEmail(formData.name, formData.email)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup error:", error)
      setError(error instanceof Error ? error.message : "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background py-6">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <PenTool className="h-6 w-6" />
            <span className="text-xl font-bold">BlogAI</span>
          </Link>
          <div>
            <span className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Log in
              </Link>
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 md:px-8">
        <MotionDiv initial="hidden" animate="visible" variants={slideUp} className="w-full max-w-md">
          <Card className="border-none shadow-lg sm:border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl font-bold">Create an account</CardTitle>
              <CardDescription className="text-center">Enter your information to create an account</CardDescription>
              {error && <p className="text-center text-sm text-destructive">{error}</p>}
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <MotionDiv variants={fadeIn} transition={{ delay: 0.1 }} className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </MotionDiv>
                <MotionDiv variants={fadeIn} transition={{ delay: 0.2 }} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </MotionDiv>
                <MotionDiv variants={fadeIn} transition={{ delay: 0.3 }} className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                </MotionDiv>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <MotionDiv variants={fadeIn} transition={{ delay: 0.4 }} className="w-full">
                  <Button
                    type="submit"
                    className="w-full transition-all duration-300 hover:shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </MotionDiv>
                <MotionDiv variants={fadeIn} transition={{ delay: 0.5 }} className="text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                  >
                    Login
                  </Link>
                </MotionDiv>
                <MotionDiv
                  variants={fadeIn}
                  transition={{ delay: 0.6 }}
                  className="text-center text-xs text-muted-foreground"
                >
                  By creating an account, you agree to our{" "}
                  <Link href="#" className="underline underline-offset-4 hover:text-muted-foreground/80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="underline underline-offset-4 hover:text-muted-foreground/80">
                    Privacy Policy
                  </Link>
                </MotionDiv>
              </CardFooter>
            </form>
          </Card>
        </MotionDiv>
      </div>

      <footer className="border-t bg-background py-6">
        <div className="container mx-auto px-4 text-center md:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BlogAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}