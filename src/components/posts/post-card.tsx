import Link from 'next/link'
import { type ErrorPost } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export default function PostCard({ post }: { post: ErrorPost }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group block overflow-hidden rounded-lg border bg-card hover:shadow-md transition-shadow"
    >
      <div className="w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image_url}
          alt={post.title}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <div className="text-sm font-medium line-clamp-2">{post.title}</div>
        <div className="flex items-center gap-2 mt-2">
          {post.language && <Badge variant="secondary">{post.language}</Badge>}
          {post.error_type && <Badge variant="outline">{post.error_type}</Badge>}
        </div>
      </div>
    </Link>
  )
}
