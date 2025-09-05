import { createClient } from '@/lib/supabase/server'
import RealtimePostGrid from '@/components/posts/realtime-post-grid'
import SearchBar from '@/components/common/search-bar'
import TagBar from '@/components/common/tag-bar'

export const revalidate = 0
export const dynamic = 'force-dynamic' // Prevent Next.js caching
export const fetchCache = 'force-no-store' // Force fresh data

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

    // Get current session and user safely
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    // First get posts
    let query = supabase.from('error_posts').select('*')
    if (q) {
      // Basic search across title, language, and error type
      query = query.or(
        `title.ilike.%${q}%,language.ilike.%${q}%,error_type.ilike.%${q}%`
      )
    }
    
    const result = await query.order('created_at', { ascending: false }).limit(60)
    const postsData = result.data ?? []
    
    if (postsData.length > 0) {
      const postIds = postsData.map(p => p.id)
      
      // Get like counts for all posts
      const { data: likeCounts } = await supabase
        .from('likes')
        .select('error_post_id')
        .in('error_post_id', postIds)
      
      // Get user's likes if authenticated
      let userLikes: any[] = []
      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('error_post_id')
          .eq('user_id', user.id)
          .in('error_post_id', postIds)
        userLikes = data ?? []
      }
      
      // Count likes per post
      const likeCountMap: Record<string, number> = {}
      likeCounts?.forEach(like => {
        likeCountMap[like.error_post_id] = (likeCountMap[like.error_post_id] || 0) + 1
      })
      
      // Create user likes set for quick lookup
      const userLikeSet = new Set(userLikes.map(like => like.error_post_id))
      
      // Transform posts with like information
      posts = postsData.map(post => ({
        ...post,
        likes_count: likeCountMap[post.id] || 0,
        user_liked: userLikeSet.has(post.id),
      }))
    }
    
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
      <RealtimePostGrid initialPosts={posts} />
    </div>
  )
}
