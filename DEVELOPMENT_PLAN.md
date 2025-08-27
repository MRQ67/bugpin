BugPin - "Pin Your Pain" 📌🐛
Project Overview
Build BugPin, a social platform where developers can upload, share, and organize screenshots of coding errors. Users can share individual error posts, comment on solutions, and discover similar bugs experienced by others.
Tagline: "Pin Your Pain" Mission: Where bugs become beautiful and debugging becomes collaborative.
SIMPLIFIED TECH STACK - DO NOT DEVIATE
Frontend: Next.js 15.5 with App Router + TypeScript
Styling: Tailwind CSS + shadcn/ui components
Backend: Supabase (Database + Auth + Storage)
Authentication: Supabase Auth (Google + GitHub OAuth)
File Storage: Supabase Storage (for error screenshots)
Image Processing: Tesseract.js for OCR (client-side)
Animations: Framer Motion
Deployment: Vercel (frontend only)
IMPORTANT: SETUP ASSUMPTIONS
The developer will handle ALL initial setup:
Next.js 15.5 project initialization with TypeScript
Tailwind CSS installation and configuration
shadcn/ui components installation (ALREADY INSTALLED):
button, avatar, dropdown-menu, input, textarea, label, form
card, badge, separator, dialog, toast, skeleton, alert
DO NOT MODIFY these components without explicit approval
Supabase project creation (ALREADY CREATED): BugPin project is ready
All package installations (@supabase/supabase-js, etc.)
Environment variables setup
Database tables creation
Your job is to:
FIRST: Create a DEVELOPMENT_PLAN.md file in D:\bugpin\DEVELOPMENT_PLAN.md with this entire prompt content
THEN: Write the actual code files following the plan
ALWAYS: Reference the plan file and follow it strictly
NEVER: Deviate from the rules or stages outlined in the plan
CRITICAL: Only create/modify files within the D:\bugpin\ directory - DO NOT touch any files outside this project directory
Project Root Directory: D:\bugpin\
Do not provide setup commands or installation instructions - only write code files within the project directory.
Supabase Database Schema (SQL)
-- Users table (automatically created by Supabase Auth)
-- We'll extend with a profiles table

-- Profiles table to extend auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error posts table
CREATE TABLE error_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  language TEXT,
  error_type TEXT,
  tags TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  error_post_id UUID REFERENCES error_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  error_post_id UUID REFERENCES error_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, error_post_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Error posts policies
CREATE POLICY "Error posts are viewable by everyone" ON error_posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own error posts" ON error_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own error posts" ON error_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own error posts" ON error_posts FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() = user_id);

Project Structure (MANDATORY - All files within D:\bugpin)
D:\bugpin\
├── DEVELOPMENT_PLAN.md (THIS ENTIRE PROMPT - CREATE FIRST!)
├── app\
│   ├── (auth)\
│   │   └── sign-in\
│   │       └── page.tsx
│   ├── posts\
│   │   └── [id]\
│   │       └── page.tsx
│   ├── profile\
│   │   └── [username]\
│   │       └── page.tsx
│   ├── upload\
│   │   └── page.tsx
│   ├── page.tsx (homepage)
│   ├── layout.tsx
│   └── globals.css
/components
  /ui/ (shadcn components)
  /auth/
    /sign-in-form.tsx
    /auth-button.tsx
  /posts/
    /post-card.tsx
    /post-upload-form.tsx
    /post-grid.tsx
    /post-detail.tsx
  /comments/
    /comment-form.tsx
    /comment-list.tsx
  /common/
    /navbar.tsx

/lib
  /supabase/
    /client.ts - Browser client
    /server.ts - Server client
    /middleware.ts - Middleware client
  /utils.ts
  /ocr.ts (Tesseract.js wrapper)
  /types.ts (TypeScript types)

/middleware.ts (Route protection)

Development Stages - Write Code Only
Stage 1: Development Plan & Supabase Setup
YOU WRITE THESE FILES IN D:\bugpin:
D:\bugpin\DEVELOPMENT_PLAN.md - CREATE THIS FIRST - Copy this entire prompt content
D:\bugpin\lib\supabase\client.ts - Browser Supabase client
D:\bugpin\lib\supabase\server.ts - Server Supabase client
D:\bugpin\lib\supabase\middleware.ts - Middleware Supabase client
D:\bugpin\lib\types.ts - TypeScript types for database
D:\bugpin\app\(auth)\sign-in\page.tsx - Sign in page
D:\bugpin\components\auth\sign-in-form.tsx - Sign in form with Google/GitHub
D:\bugpin\components\auth\auth-button.tsx - Sign in/out button
D:\bugpin\middleware.ts - Route protection middleware
D:\bugpin\components\common\navbar.tsx - Navigation with auth
Stage 2: File Upload & OCR
YOU WRITE THESE FILES:
/lib/ocr.ts - Tesseract.js OCR wrapper
/ components/posts/post-upload-form.tsx - Upload form with Supabase Storage
/app/upload/page.tsx - Upload page
/app/api/upload/route.ts - Optional: server-side upload handling
Stage 3: Posts Display & Individual Pages
YOU WRITE THESE FILES:
/ components/posts/post-card.tsx - Individual error post card
/ components/posts/post-grid.tsx - Grid layout for posts
/ components/posts/post-detail.tsx - Full post view with comments
/app/posts/[id]/page.tsx - Individual error post page
/app/page.tsx - Homepage with all posts feed
/lib/utils.ts - Utility functions
Stage 4: Social Features & Profiles
YOU WRITE THESE FILES:
/ components/comments/comment-form.tsx - Add comment form
/ components/comments/comment-list.tsx - Display comments with real-time updates
/app/profile/[username]/page.tsx - User profile page
/ components/common/search-bar.tsx - Search functionality
Like/unlike functionality in post components
Key Implementation Rules
Supabase Configuration
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

Authentication Flow
// Sign in with GitHub/Google
const supabase = createClient()

const signInWithGitHub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${location.origin}/auth/callback`
    }
  })
}

File Upload to Supabase Storage
// Upload to Supabase Storage
const uploadImage = async (file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `error-images/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath)

  return publicUrl
}

Code Writing Rules
For Each Stage:
Write complete, functional code files
Use Supabase TypeScript types (generated from database)
Implement proper error handling for all Supabase calls
Add loading states and optimistic updates
Follow Next.js 15.5 App Router patterns
Use shadcn/ui components consistently
Make responsive design mobile-first
Use Supabase real-time for comments and likes
BugPin Design Guidelines
Grid layout for error cards (like Instagram/Twitter)
Dark mode friendly color scheme (developers love dark mode)
Red accents for error theme (#ef4444 or #dc2626)
Smooth animations with Framer Motion
Mobile-first responsive design
Clean, minimal UI focusing on content
Use shadcn/ui components for consistency
Code syntax highlighting in error displays
Environment Variables Required
# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

Success Metrics
Users can sign in with Google/GitHub via Supabase Auth
Users can upload error screenshots to Supabase Storage
OCR extracts readable text from images
Posts display in clean grid layout
Individual post pages work with comments
Real-time comments and likes
User profiles show their error posts
Search finds relevant errors
Mobile experience is smooth
Critical Notes
PROJECT DIRECTORY: D:\bugpin\ - ALL files must be created within this directory
NEVER create or modify files outside of D:\bugpin\ directory
shadcn/ui components: Already installed - DO NOT modify or recreate them
Supabase project: Already created for BugPin - ready to use
FIRST TASK: Create D:\bugpin\DEVELOPMENT_PLAN.md with this complete prompt content
ALWAYS reference the development plan file before writing code
NEVER deviate from Supabase for backend
Always use TypeScript for type safety
Follow the exact project structure within D:\bugpin\
Use Supabase real-time for social features
Implement proper RLS policies for security
Focus on developer UX and aesthetics
Test on mobile devices regularly
Use Supabase Storage for all file uploads
Stay within the defined stages and don't skip ahead
