'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Heart, ImageIcon, Calendar, TrendingUp } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface ProfileStatsProps {
  stats: {
    postsCount: number
    totalLikes: number
    joinedAt: string
  }
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const joinedDate = format(new Date(stats.joinedAt), 'MMMM yyyy')
  const timeActive = formatDistanceToNow(new Date(stats.joinedAt))

  const statsItems = [
    {
      icon: ImageIcon,
      label: 'Posts Shared',
      value: stats.postsCount,
      description: 'Total errors posted',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Heart,
      label: 'Total Likes',
      value: stats.totalLikes,
      description: 'Community appreciation',
      color: 'text-primary',
      bgColor: 'bg-secondary/20',
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: joinedDate,
      description: `Active for ${timeActive}`,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      isDate: true,
    },
    {
      icon: TrendingUp,
      label: 'Engagement',
      value: stats.postsCount > 0 ? Math.round(stats.totalLikes / stats.postsCount * 10) / 10 : 0,
      description: 'Average likes per post',
      color: 'text-accent-foreground',
      bgColor: 'bg-accent/30',
      suffix: '/post',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsItems.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border border-border hover:border-primary/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-foreground">
                      {stat.isDate ? stat.value : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                    {stat.suffix && (
                      <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
