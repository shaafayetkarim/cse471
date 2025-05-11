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

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password")
      }

     

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Failed to login")
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
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 md:px-8">
        <MotionDiv initial="hidden" animate="visible" variants={slideUp} className="w-full max-w-md">
          <Card className="border-none shadow-lg sm:border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl font-bold">Login</CardTitle>
              <CardDescription className="text-center">
                Enter your email and password to access your account
              </CardDescription>
              {error && <p className="text-center text-sm text-destructive">{error}</p>}
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <MotionDiv variants={fadeIn} transition={{ delay: 0.1 }} className="space-y-2">
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
                <MotionDiv variants={fadeIn} transition={{ delay: 0.2 }} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                </MotionDiv>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <MotionDiv variants={fadeIn} transition={{ delay: 0.3 }} className="w-full">
                  <Button
                    type="submit"
                    className="w-full transition-all duration-300 hover:shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </MotionDiv>
                <MotionDiv variants={fadeIn} transition={{ delay: 0.4 }} className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                  >
                    Sign up
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