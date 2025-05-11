"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // User data state
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "/placeholder.svg?height=100&width=100",
    subscription: "Free",
    generationsLeft: 0,
    generationsTotal: 0,
  })

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Password validation state
  const [passwordError, setPasswordError] = useState("")

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        setUser({
          name: data.name || "",
          email: data.email || "",
          avatar: data.avatar || "/placeholder.svg?height=100&width=100",
          subscription: data.subscription || "Free",
          generationsLeft: data.generationsLeft || 0,
          generationsTotal: data.generationsTotal || 0,
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [toast])

  const handleSaveProfile = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      // Update user state with the returned data
      if (data.user) {
        setUser(prev => ({
          ...prev,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar || prev.avatar,
          subscription: data.user.subscription || prev.subscription,
          generationsLeft: data.user.generationsLeft || prev.generationsLeft,
          generationsTotal: data.user.generationsTotal || prev.generationsTotal,
        }))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    // Reset error
    setPasswordError("")

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setIsUpdatingPassword(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleUpgradeSubscription = () => {
    // Simulate upgrading - replace with actual payment flow
    toast({
      title: "Redirecting to payment",
      description: "You'll be redirected to complete your subscription upgrade",
    })

    // In a real app, redirect to payment page
  }

  if (isLoading) {
    return <div className="container mx-auto p-6 flex justify-center">Loading profile...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="w-full">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Subscription</span>
                <span className="text-sm">{user.subscription}</span>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Generations Left</span>
                <span className="text-sm">
                  {user.generationsLeft}/{user.generationsTotal}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(user.generationsLeft / user.generationsTotal) * 100}%` }}
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleUpgradeSubscription}>
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal">
          <TabsList className="mb-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-muted-foreground">
                      <User className="h-4 w-4" />
                    </span>
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New Picture
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input 
                      id="current-password" 
                      type="password" 
                      className="rounded-l-none"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input 
                      id="new-password" 
                      type="password" 
                      className="rounded-l-none"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      className="rounded-l-none"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handlePasswordChange} disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}