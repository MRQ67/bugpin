"use client"

import Link from 'next/link'
import { Pin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthButton } from '@/components/auth/auth-button'
import SearchBar from './search-bar'
import { FloatingNav } from '@/components/ui/floating-navbar'
import { AnimatedThemeToggler } from '@/components/magicui/animated-theme-toggler'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const pill =
    'rounded-full border border-border bg-background/80 backdrop-blur px-3 h-10 flex items-center shadow-sm'

  return (
    <header className={`sticky top-0 z-40 w-full border-b ${scrolled ? 'bg-transparent backdrop-blur-0 border-transparent' : 'bg-background/80 backdrop-blur'}`}>
      <div className={`container mx-auto px-4 h-14 flex items-center justify-between gap-4 ${scrolled ? 'opacity-0 pointer-events-none' : ''}`}>
        <Link href="/" className="font-semibold shrink-0 inline-flex items-center gap-1.5">
          <Pin className="h-4 w-4" />
          <span>BugPin</span>
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <SearchBar size="sm" />
          <AnimatedThemeToggler />
          <AuthButton variant="avatar" />
        </div>
      </div>

      {/* Floating groups handled by FloatingNav */}
      <FloatingNav side="left">
        <Link href="/" className="font-semibold shrink-0 inline-flex items-center gap-1.5">
          <Pin className="h-4 w-4" />
          <span>BugPin</span>
        </Link>
      </FloatingNav>
      <FloatingNav side="right">
        <div className="flex items-center gap-2">
          <SearchBar size="sm" />
          <AnimatedThemeToggler />
          <AuthButton variant="avatar" />
        </div>
      </FloatingNav>
    </header>
  )
}
