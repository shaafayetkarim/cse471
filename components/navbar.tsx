"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { PenTool, Menu, X, LogOut } from 'lucide-react'
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { MotionDiv } from "@/components/ui/motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  subscription?: string;
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserData>({
    name: "User",
    email: "",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
    subscription: "free"
  })
  const [loading, setLoading] = useState(true)

  // Determine if we should show the navbar
  const shouldShowNavbar = !['/', '/login', '/signup'].includes(pathname);

  useEffect(() => {
    let mounted = true;

    if (!shouldShowNavbar) {
      setLoading(false);
      return;
    }
    
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile...');
        
        const response = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Response not OK:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          
          if (response.status === 401) {
            console.log('Unauthorized, redirecting to login...');
            router.push('/login');
            return;
          }
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User data received:', data);
        
        if (mounted) {
          setUser({
            name: data.user?.name || "User",
            email: data.user?.email || "",
            avatar: data.user?.avatar || "/placeholder.svg?height=40&width=40",
            role: data.user?.role || "user",
            subscription: data.user?.subscription || "free"
          });
        }
      } catch (error) {
        console.error('Fetch error details:', error);
        
        // Show error toast
        toast({
          title: "Error loading profile",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
        
        // Only redirect on auth errors
        if (error instanceof Error && error.message.includes('401')) {
          router.push('/login');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      mounted = false;
    };
  }, [router, pathname, shouldShowNavbar, toast]);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Create a response to clear the cookie
      document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      
      // Redirect to login page
      router.push('/login')
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Logout failed",
        description: "There was a problem logging out",
        variant: "destructive"
      })
    }
  }
  if (!shouldShowNavbar) {
    return null;
  }

  const baseNavItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Generate", href: "/generate" },
    { name: "Drafts", href: "/drafts" },
    { name: "Search", href: "/search" },
  ];
  
  const navItems = [...baseNavItems];
  if (user.role === "admin" || user.subscription === "premium") {
    navItems.splice(navItems.length - 1, 0, { name: "Collections", href: "/collections" });
  }

  if (loading) {
    return <div className="h-16 border-b bg-background/95"></div>;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Rest of the JSX remains the same */}
      <div className="mx-auto max-w-[2000px]">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <MotionDiv initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ duration: 0.5, type: "spring" }}>
                <PenTool className="h-6 w-6" />
              </MotionDiv>
              <span className="hidden text-xl font-bold md:inline-block">BlogAI</span>
            </Link>

            <div className="hidden md:flex md:items-center md:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <div className="hidden md:flex md:items-center md:gap-2">
              <Link href="/profile">
                <div className="flex items-center gap-2 pl-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:inline-block">{user.name}</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>

            <div className="md:hidden">
              <SidebarTrigger />
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="container border-t md:hidden"
        >
          <div className="flex flex-col space-y-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            </div>
          </div>
        </MotionDiv>
      )}
    </header>
  );
}