import { cookies } from "next/headers"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Blog Generator",
  description: "Generate blog content with AI",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={defaultOpen}>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <div className="flex flex-1">
                <AppSidebar />
                <main className="flex-1 transition-all duration-300 ease-in-out">
                  <div className="mx-auto max-w-[2000px]">
                    {children}
                  </div>
                </main>
              </div>
              <Footer />
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

