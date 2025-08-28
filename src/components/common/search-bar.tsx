'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function SearchBar({ size = 'md' }: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setQ(params.get('q') || '')
  }, [params])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const usp = new URLSearchParams(params.toString())
    if (q.trim()) usp.set('q', q.trim())
    else usp.delete('q')
    router.push(`${pathname}?${usp.toString()}`)
  }

  const sizeClasses = {
    sm: { input: 'h-8 text-sm', baseW: 'w-28 md:w-40', focusW: 'w-60 md:w-80' },
    md: { input: 'h-10', baseW: 'w-32 md:w-48', focusW: 'w-72 md:w-[28rem]' },
    lg: { input: 'h-12 text-lg', baseW: 'w-40 md:w-56', focusW: 'w-80 md:w-[32rem]' },
  } as const;

  const widthClass = focused ? sizeClasses[size].focusW : sizeClasses[size].baseW

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div
        className={`relative flex items-center transition-all duration-200 ${widthClass}`}
      >
        <svg
          className="absolute left-3 h-4 w-4 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          type="search"
          placeholder="Search errors..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full pl-9 pr-9 ${sizeClasses[size].input} rounded-full border-transparent bg-background/60 backdrop-blur placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-transparent`}
        />
      </div>
    </form>
  )
}
