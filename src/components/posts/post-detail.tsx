import { Badge } from '@/components/ui/badge'
import { type ErrorPost } from '@/lib/types'
import LikeButton from '@/components/posts/like-button'
import OptimisticComments from '@/components/comments/optimistic-comments'
import { RelativeTime } from '@/components/ui/relative-time'

type Author = { id: string; name: string | null; username: string | null; avatar_url: string | null } | null

export default function PostDetail({ post }: { post: ErrorPost & { author?: Author } }) {
  return (
    <article className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <div className="space-y-4">
        <div className="w-full overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt={post.title} className="w-full h-auto object-contain" />
        </div>
        {/* Author info under the image */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.author?.avatar_url || '/next.svg'}
              alt={(post.author?.name || post.author?.username || 'Author') as string}
              className="h-8 w-8 rounded-full border object-cover bg-card"
            />
            <div className="text-sm">
              <div className="font-medium leading-tight">
                {post.author?.name || post.author?.username || 'Unknown user'}
              </div>
              {post.author?.username && (
                <div className="text-xs text-muted-foreground">@{post.author.username}</div>
              )}
            </div>
          </div>
          <RelativeTime 
            date={post.created_at} 
            className="text-sm text-muted-foreground"
          />
        </div>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {post.language && <Badge variant="secondary">{post.language}</Badge>}
          {post.error_type && <Badge variant="outline">{post.error_type}</Badge>}
          {Array.isArray(post.tags) &&
            post.tags.slice(0, 5).map((t) => (
              <Badge key={t} variant="default">#{t}</Badge>
            ))}
        </div>
        <div className="pt-1">
          <LikeButton postId={post.id} initialCount={post.likes_count ?? 0} />
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Comments</h2>
          <OptimisticComments postId={post.id} />
        </section>
      </div>
    </article>
  )
}
