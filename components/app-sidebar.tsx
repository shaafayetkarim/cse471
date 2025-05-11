"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  PenTool,
  FileText,
  FolderOpen,
  Search,
  Settings,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { MotionDiv } from "@/components/ui/motion"

export function AppSidebar() {
  const pathname = usePathname()

  // Mock user data - in a real app, this would come from auth context
  const user = {
    name: "John Doe",
    email: "john@example.com",
    role: "admin", // Could be "free", "premium", or "admin"
    avatar: "/placeholder.svg?height=40&width=40",
  }

  const isAdmin = user.role === "admin"

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Generate Blog",
      href: "/generate",
      icon: PenTool,
    },
    {
      title: "Drafts",
      href: "/drafts",
      icon: FileText,
    },
    {
      title: "Collections",
      href: "/collections",
      icon: FolderOpen,
    },
    {
      title: "Search",
      href: "/search",
      icon: Search,
    },
  ]

  const accountNavItems = [
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  if (isAdmin) {
    accountNavItems.push({
      title: "Admin Panel",
      href: "/admin",
      icon: ShieldCheck,
    })
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col gap-2 px-3 py-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <MotionDiv initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ duration: 0.5, type: "spring" }}>
              <PenTool className="h-6 w-6" />
            </MotionDiv>
            <span className="text-xl font-bold">BlogAI</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item, index) => (
                <MotionDiv
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </MotionDiv>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map((item, index) => (
                <MotionDiv
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </MotionDiv>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <div className="ml-auto flex gap-1">
            <ModeToggle />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Link>
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

