"use client"

import Link from 'next/link'
import { Pin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AuthButton } from '@/components/auth/auth-button'
import SearchBar from './search-bar'
import { AnimatedThemeToggler } from '@/components/magicui/animated-theme-toggler'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [showFloating, setShowFloating] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      setScrolled(scrollY > 50)
      setShowFloating(scrollY > 100)
    }
    
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Fixed Navbar */}
      <motion.header 
        className="sticky top-0 z-40 w-full border-b border-border/50"
        animate={{
          backgroundColor: scrolled ? 'transparent' : 'hsl(var(--background) / 0.8)',
          backdropFilter: scrolled ? 'blur(0px)' : 'blur(8px)',
          opacity: showFloating ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold shrink-0 inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors">
              <Pin className="h-4 w-4" />
              <span>BugPin</span>
            </Link>
            <SearchBar size="sm" />
            <AnimatedThemeToggler className="shrink-0" />
            <AuthButton variant="avatar" />
          </div>
        </div>
      </motion.header>

      {/* Floating Navbar */}
      <AnimatePresence>
        {showFloating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-border/20 bg-card/90 backdrop-blur-md shadow-lg">
              <Link href="/" className="font-semibold shrink-0 inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors">
                <Pin className="h-4 w-4" />
                <span className="hidden sm:block">BugPin</span>
              </Link>
              
              <div className="w-px h-6 bg-border/50 hidden sm:block" />
              
              <div className="flex items-center gap-2">
                <SearchBar size="sm" />
                <AnimatedThemeToggler className="shrink-0" />
                <AuthButton variant="avatar" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
