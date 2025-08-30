import { notFound } from 'next/navigation'
import PostDetail from '@/components/posts/post-detail'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params
  const { data } = await supabase.from('error_posts').select('title').eq('id', id).single()
  return { title: data?.title ? `${data.title} • BugPin` : 'Post • BugPin' }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params
  const { data: post, error } = await supabase.from('error_posts').select('*').eq('id', id).single()

  if (error || !post) return notFound()

  // Fetch author profile and current likes count
  const [{ data: author }, { count: likesCount }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, username, avatar_url')
      .eq('id', (post as any).user_id)
      .single(),
    supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('error_post_id', id)
  ])

  // Update the post with the current likes count
  const postWithLikes = { ...(post as any), likes_count: likesCount ?? 0, author }

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={postWithLikes} />
    </div>
  )
}
