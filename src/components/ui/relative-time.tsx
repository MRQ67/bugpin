'use client'

import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns'
import { useState, useEffect } from 'react'

interface RelativeTimeProps {
  date: string | Date
  className?: string
  showTooltip?: boolean
  updateInterval?: number // in milliseconds, default 60000 (1 minute)
}

export function RelativeTime({ 
  date, 
  className = '', 
  showTooltip = true,
  updateInterval = 60000 
}: RelativeTimeProps) {
  const [relativeTime, setRelativeTime] = useState<string>('')
  const [absoluteTime, setAbsoluteTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      try {
        // Parse the date if it's a string
        const parsedDate = typeof date === 'string' ? parseISO(date) : date
        
        if (!isValid(parsedDate)) {
          setRelativeTime('Invalid date')
          setAbsoluteTime('Invalid date')
          return
        }

        // Calculate relative time
        const now = new Date()
        const diffInMs = now.getTime() - parsedDate.getTime()
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

        // For very old content (>1 year), show absolute date
        if (diffInDays > 365) {
          const formatted = format(parsedDate, 'MMM d, yyyy')
          setRelativeTime(formatted)
          setAbsoluteTime(format(parsedDate, 'MMMM d, yyyy \'at\' h:mm a'))
        } else {
          // Show relative time
          const relative = formatDistanceToNow(parsedDate, { addSuffix: true })
          setRelativeTime(relative)
          setAbsoluteTime(format(parsedDate, 'MMMM d, yyyy \'at\' h:mm a'))
        }
      } catch (error) {
        console.error('Error formatting date:', error)
        setRelativeTime('Invalid date')
        setAbsoluteTime('Invalid date')
      }
    }

    // Initial update
    updateTime()

    // Set up interval for updates (only for recent content)
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    if (isValid(parsedDate)) {
      const diffInHours = (new Date().getTime() - parsedDate.getTime()) / (1000 * 60 * 60)
      
      // Only auto-update for content less than 24 hours old
      if (diffInHours < 24) {
        const interval = setInterval(updateTime, updateInterval)
        return () => clearInterval(interval)
      }
    }
  }, [date, updateInterval])

  if (showTooltip) {
    return (
      <time 
        dateTime={typeof date === 'string' ? date : date.toISOString()}
        title={absoluteTime}
        className={`cursor-help ${className}`}
      >
        {relativeTime}
      </time>
    )
  }

  return (
    <time 
      dateTime={typeof date === 'string' ? date : date.toISOString()}
      className={className}
    >
      {relativeTime}
    </time>
  )
}