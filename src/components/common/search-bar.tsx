'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [q, setQ] = useState('')

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

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search errors, text, tags…"
        className="w-full"
      />
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  )
}
