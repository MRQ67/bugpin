// Minimal TypeScript types for BugPin database
// If you generate Supabase types later, you can replace these.

export type UUID = string

export type Profile = {
  id: UUID
  email: string | null
  name: string | null
  avatar_url: string | null
  username: string | null
  created_at: string
  updated_at: string
}

export type ErrorPost = {
  id: UUID
  title: string
  image_url: string
  language: string | null
  error_type: string | null
  tags: string[] | null
  user_id: UUID
  likes_count: number
  created_at: string
  updated_at: string
}

export type Comment = {
  id: UUID
  content: string
  user_id: UUID
  error_post_id: UUID
  created_at: string
  updated_at: string
}

export type Like = {
  id: UUID
  user_id: UUID
  error_post_id: UUID
  created_at: string
}

export type Tables = {
  profiles: Profile
  error_posts: ErrorPost
  comments: Comment
  likes: Like
}
