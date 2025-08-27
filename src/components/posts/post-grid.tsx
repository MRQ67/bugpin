import PostCard from '@/components/posts/post-card'
import { type ErrorPost } from '@/lib/types'

export default function PostGrid({ posts }: { posts: ErrorPost[] }) {
  if (!posts.length) {
    return (
      <div className="text-center text-sm text-muted-foreground py-12">
        No posts yet. Be the first to upload!
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  )
}
