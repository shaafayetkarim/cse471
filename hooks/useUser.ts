// hooks/useUser.ts
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth/user')
        if (!response.ok) {
          throw new Error('Not authenticated')
        }
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  return { user, loading }
}