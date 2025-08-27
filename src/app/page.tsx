import { createClient } from '@/lib/supabase/server'
import PostGrid from '@/components/posts/post-grid'
import SearchBar from '@/components/common/search-bar'

export const revalidate = 0

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const sp = (await searchParams) ?? {}
  const q = (sp.q || '').trim()

  let query = supabase.from('error_posts').select('*')
  if (q) {
    // Basic search across a few text fields
    query = query.or(
      `title.ilike.%${q}%,extracted_text.ilike.%${q}%,language.ilike.%${q}%,error_type.ilike.%${q}%`
    )
  }
  const { data: posts, error } = await query.order('created_at', { ascending: false }).limit(60)

  if (error) {
    // Non-blocking: render empty state on error
    console.error('Failed to load posts', error)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-xl font-semibold">Latest errors</h1>
      </div>
      <div className="mb-6">
        <SearchBar />
      </div>
      <PostGrid posts={(posts ?? []) as any} />
    </div>
  )
}
