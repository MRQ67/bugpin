import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProfileHeader from '@/components/profile/profile-header'
import PostGrid from '@/components/posts/post-grid'

export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, username')
    .eq('username', username)
    .maybeSingle()
  
  const title = profile?.username ? `${profile.username} • BugPin` : 'Profile • BugPin'
  const description = profile?.name 
    ? `Check out ${profile.name}'s coding errors and debugging journey on BugPin` 
    : 'Developer profile on BugPin - Pin Your Pain'
  
  return { 
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  
  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, created_at')
    .eq('username', username)
    .maybeSingle()

  if (!profile) return notFound()

  // Fetch user's posts
  const { data: posts } = await supabase
    .from('error_posts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  // Fetch user statistics
  const [{ count: postsCount }, { count: totalLikes }] = await Promise.all([
    supabase
      .from('error_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id),
    supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .in('error_post_id', (posts || []).map(p => p.id))
  ])

  const stats = {
    postsCount: postsCount || 0,
    totalLikes: totalLikes || 0,
    joinedAt: profile.created_at,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header with Stats */}
        <div className="mb-8">
          <ProfileHeader profile={profile} stats={stats} />
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Posts {stats.postsCount > 0 && <span className="text-muted-foreground">({stats.postsCount})</span>}
            </h2>
          </div>
          
          {posts && posts.length > 0 ? (
            <PostGrid posts={posts as any} />
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {profile.username === 'your-username' 
                  ? "Share your first coding error to get started on your debugging journey!" 
                  : `${profile.username} hasn't shared any coding errors yet.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
