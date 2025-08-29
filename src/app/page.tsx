import { createClient } from '@/lib/supabase/server'
import PostGrid from '@/components/posts/post-grid'
import SearchBar from '@/components/common/search-bar'
import TagBar from '@/components/common/tag-bar'

export const revalidate = 0

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  let posts: any[] = []
  let error: any = null

  try {
    const supabase = await createClient()
    const sp = (await searchParams) ?? {}
    const q = (sp.q || '').trim()

    let query = supabase.from('error_posts').select('*')
    if (q) {
      // Basic search across title, language, and error type
      query = query.or(
        `title.ilike.%${q}%,language.ilike.%${q}%,error_type.ilike.%${q}%`
      )
    }
    const result = await query.order('created_at', { ascending: false }).limit(60)
    posts = result.data ?? []
    error = result.error
  } catch (err) {
    console.error('Failed to load posts', err)
    error = err
  }

  if (error) {
    console.error('Failed to load posts', error)
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <TagBar />
      <PostGrid posts={posts} />
    </div>
  )
}
