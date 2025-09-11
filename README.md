# BugPin 📌🐛

A social platform where developers can upload, share, and organize screenshots of coding errors. The mission is to make debugging collaborative and to help users find solutions to similar bugs.

> **Tagline:** "Pin Your Pain"

## About

BugPin is a developer-focused social platform that allows users to share screenshots of their coding errors, creating a community-driven knowledge base for debugging. Instead of hiding our mistakes, we embrace them and turn them into learning opportunities for the entire developer community.

## Features

### Completed Features ✅

1. **User Authentication**
   - Secure sign-up and login with Supabase Auth
   - Protected routes and session management

2. **Post Management**
   - Upload error screenshots with emotional captions
   - Browse posts in a Pinterest-style masonry grid
   - Real-time post updates with Supabase subscriptions
   - Like functionality with optimistic UI

3. **Content Moderation**
   - Client-side NSFW content filtering using NSFWJS and TensorFlow.js
   - Automatic image analysis before upload
   - Configurable confidence thresholds for different content types

4. **Social Features**
   - User profile pages with statistics
   - Comment system with real-time updates
   - Like functionality with instant feedback

5. **User Experience**
   - Dark/light mode toggle with smooth animations
   - Responsive design for all device sizes
   - Relative time display for posts and comments
   - Optimistic UI for all user interactions
   - Smooth navigation transitions between fixed and floating navbars

6. **Technical Implementation**
   - Real-time updates with Supabase subscriptions
   - Optimistic UI patterns for instant feedback
   - Comprehensive automated testing suite
   - TypeScript type safety throughout
   - Performance optimized with efficient caching strategies

## Technology Stack

- **Frontend**: Next.js 15.5 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Authentication, Storage, Real-time)
- **AI/ML**: TensorFlow.js, NSFWJS for content moderation
- **UI Libraries**: Lucide React, Radix UI, Framer Motion
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - learn about TypeScript

## Remaining Features Before Release 🚧

Before BugPin is ready for full release, the following features need to be implemented:

### 1. Image Zoom/Lightbox Feature (P)
Enhance error screenshot viewing with a lightbox overlay for better detail inspection.
- [ ] Install a lightbox library like `yet-another-react-lightbox`
- [ ] Create a zoomable image component for post images
- [ ] Add zoom controls and keyboard navigation (ESC, arrows)
- [ ] Implement touch gestures for mobile zoom and pan
- [ ] Add loading states for high-resolution image loading
- [ ] Ensure accessibility with proper ARIA labels and focus management

### 2. Loading Skeletons (Q)
Replace loading spinners with modern skeleton UI for better perceived performance.
- [ ] Create skeleton components for PostCard, CommentList, and Profile
- [ ] Design skeleton layouts that match actual content structure
- [ ] Add shimmer animations for polished loading experience
- [ ] Replace all loading spinners with appropriate skeleton components
- [ ] Implement progressive loading for image placeholders
- [ ] Test skeleton performance on slow network connections

### 3. Beautiful Empty States (R)
Create engaging empty state designs for when users have no content to display.
- [ ] Design empty states for: no posts, no comments, no search results, new user profile
- [ ] Create illustrations or icons for each empty state scenario
- [ ] Add encouraging call-to-action messages and buttons
- [ ] Implement empty state components with proper spacing and typography
- [ ] Test empty states across different screen sizes
- [ ] Consider animations to make empty states more engaging

### 4. Image Lazy Loading & Optimization (S)
Improve homepage performance with efficient image loading and Next.js optimization.
- [ ] Replace all `<img>` tags with Next.js `Image` components
- [ ] Configure image optimization settings in `next.config.js`
- [ ] Implement lazy loading for homepage post images
- [ ] Add blur placeholders for smooth image loading experience
- [ ] Optimize image sizes and formats (WebP, AVIF support)
- [ ] Test performance improvements with Lighthouse audits

### 5. Infinite Scroll for Homepage (T)
Replace pagination with smooth infinite scroll for better user engagement.
- [ ] Install intersection observer library or use native API
- [ ] Implement infinite scroll hook with loading states
- [ ] Update homepage to load posts incrementally
- [ ] Add "Load More" fallback button for accessibility
- [ ] Handle loading states and error scenarios gracefully
- [ ] Optimize performance to prevent memory leaks with many posts

### 6. Advanced Search Filters (U)
Enhance search functionality with filters for better content discovery.
- [ ] Create filter UI with date range, tags, and user filters
- [ ] Add sort options (newest, oldest, most liked, most commented)
- [ ] Implement client-side filtering for better responsiveness
- [ ] Add search history and saved searches functionality
- [ ] Create filter chips to show active filters
- [ ] Ensure filters work well on mobile devices

## Testing

Run the test suite:

```bash
npm run test
# or
npm run test:ui
```

The project includes comprehensive tests for:
- Utility functions
- UI components
- API routes
- Custom hooks
- Content moderation
- Form validation

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.