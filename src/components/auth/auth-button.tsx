'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

export function AuthButton({ variant = 'default' }: { variant?: 'default' | 'avatar' }) {
  const [loading, setLoading] = useState(false)
  const { user, profile, loading: userLoading, signOut } = useAuth()

  const handleSignOut = async () => {
    if (loading) return // Prevent multiple clicks
    
    try {
      setLoading(true)
      await signOut()
      // Let the auth provider handle the redirect to /home
    } catch (error) {
      console.error('Sign out error:', error)
      // Error handling - user will see they're still logged in if it fails
    } finally {
      setLoading(false)
    }
  }

  if (userLoading) {
    if (variant === 'avatar') {
      return (
        <Avatar className="h-7 w-7 animate-pulse">
          <AvatarFallback className="bg-muted">•••</AvatarFallback>
        </Avatar>
      )
    }
    return (
      <Button size="sm" variant="ghost" disabled>
        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
      </Button>
    )
  }

  if (!user) {
    if (variant === 'avatar') {
      return (
        <Link href="/sign-in" className="inline-flex">
          <Avatar className="h-7 w-7">
            <AvatarFallback>IN</AvatarFallback>
          </Avatar>
        </Link>
      )
    }
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
    )
  }

  const avatarUrl = (user.user_metadata?.avatar_url as string) || profile?.avatar_url || ''
  const displayName = profile?.name || (user.user_metadata?.name as string) || user.email || 'User'
  const username = profile?.username || 'user'
  const initials = displayName.slice(0, 2).toUpperCase()
  const profileHref = `/profile/${username}`

  if (variant === 'avatar') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20">
            <Avatar className="h-7 w-7 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                @{username}
              </p>
              {user.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={profileHref} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut}
            disabled={loading}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{displayName}</span>
      </div>
      <Button
        size="sm"
        variant="destructive"
        disabled={loading}
        onClick={handleSignOut}
      >
        Sign out
      </Button>
    </div>
  )
}
