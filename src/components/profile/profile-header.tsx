'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { type Profile } from '@/lib/types'

interface ProfileHeaderProps {
  profile: Pick<Profile, 'id' | 'name' | 'username' | 'avatar_url' | 'created_at'>
  stats?: {
    postsCount: number
    totalLikes: number
    joinedAt: string
  }
}

export default function ProfileHeader({ profile, stats }: ProfileHeaderProps) {
  const joinedDate = formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
  const displayName = profile.name || profile.username || 'Anonymous User'
  const initials = displayName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  // Format stats for display
  const engagementRate = stats && stats.postsCount > 0 
    ? Math.round(stats.totalLikes / stats.postsCount * 10) / 10 
    : 0

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-background shadow-lg">
            <AvatarImage 
              src={profile.avatar_url || undefined} 
              alt={`${profile.username}'s profile picture`}
            />
            <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full w-6 h-6 border-4 border-background" title="Active user" />
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {displayName}
            </h1>
            <p className="text-lg text-muted-foreground">
              @{profile.username}
            </p>
          </div>

          {/* User Badges and Info */}
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Developer
            </Badge>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>

          {/* Bio or Description */}
          <div className="text-sm text-muted-foreground max-w-2xl">
            <p>
              Sharing coding errors and debugging experiences. 
              Part of the BugPin community where bugs become beautiful and debugging becomes collaborative.
            </p>
          </div>

          {/* Inline Stats */}
          {stats && (
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-2">
              <span>
                <strong className="text-foreground font-semibold">{stats.postsCount}</strong> posts shared
              </span>
              <span>
                <strong className="text-foreground font-semibold">{stats.totalLikes}</strong> total likes
              </span>
              <span>
                <strong className="text-foreground font-semibold">{engagementRate}</strong> average likes per post
              </span>
              <span>
                Active for <strong className="text-foreground font-semibold">{formatDistanceToNow(new Date(stats.joinedAt))}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
