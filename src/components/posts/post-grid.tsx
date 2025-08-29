'use client'

import dynamic from 'next/dynamic'
import PostCard from '@/components/posts/post-card'
import { type ErrorPost } from '@/lib/types'

const Masonry = dynamic(() => import('react-masonry-css'), { ssr: false })

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
}

export default function PostGrid({ posts }: { posts: ErrorPost[] }) {
  if (!posts.length) {
    return (
      <div className="text-center text-sm text-muted-foreground py-12">
        No posts yet. Be the first to upload!
      </div>
    )
  }
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-full gap-4"
      columnClassName="masonry-grid_column"
    >
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </Masonry>
  )
}
