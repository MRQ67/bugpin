import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PostGrid from '@/components/posts/post-grid'

export const revalidate = 0

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, username')
    .eq('username', params.username)
    .maybeSingle()
  const title = profile?.username ? `${profile.username} • BugPin` : 'Profile • BugPin'
  return { title }
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url')
    .eq('username', params.username)
    .maybeSingle()

  if (!profile) return notFound()

  const supabase2 = await createClient()
  const { data: posts } = await supabase2
    .from('error_posts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">@{profile.username}</h1>
        {profile.name && <p className="text-muted-foreground">{profile.name}</p>}
      </div>
      <PostGrid posts={(posts ?? []) as any} />
    </div>
  )
}
