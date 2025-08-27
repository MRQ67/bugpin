import { notFound } from 'next/navigation'
import PostDetail from '@/components/posts/post-detail'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const revalidate = 0

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data } = await supabase.from('error_posts').select('title').eq('id', params.id).single()
  return { title: data?.title ? `${data.title} • BugPin` : 'Post • BugPin' }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: post, error } = await supabase
    .from('error_posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !post) return notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post as any} />
    </div>
  )
}
