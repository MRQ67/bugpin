'use client'

import { FloatingDock } from '@/components/ui/floating-dock'
import { Home, Plus, User } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

export default function DynamicFloatingDock() {
  const { profile } = useAuth()
  
  const items = [
    {
      title: 'Home',
      icon: <Home className="h-5 w-5" />,
      href: '/'
    },
    {
      title: 'Upload',
      icon: <Plus className="h-5 w-5" />,
      href: '/upload'
    },
    {
      title: 'Profile',
      icon: <User className="h-5 w-5" />,
      href: profile?.username ? `/profile/${profile.username}` : '/sign-in'
    }
  ]

  return (
    <FloatingDock
      items={items}
      desktopClassName="hidden md:flex"
      mobileClassName="md:hidden"
    />
  )
}
