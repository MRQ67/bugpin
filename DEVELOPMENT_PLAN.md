# Development Plan: BugPin 📌🐛

This document outlines the development plan, feature list, and suggested improvements for the "BugPin" project.

## 1. Project Overview

A social platform where developers can upload, share, and organize screenshots of coding errors. The mission is to make debugging collaborative and to help users find solutions to similar bugs.

- **Tagline:** "Pin Your Pain"
- **Mission:** Where bugs become beautiful and debugging becomes collaborative.

## 2. Core Technology Stack

- **Framework:** Next.js 15.5 with App Router + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Database, Auth, Storage)
- **Image Processing:** Direct image upload and storage

## 3. Database Schema

The database uses Supabase and consists of the following tables with Row Level Security (RLS) enabled:
- `profiles`: Extends `auth.users` with public user data.
- `error_posts`: The core table for storing uploaded errors and images.
- `comments`: For comments on error posts.
- `likes`: To track user likes on posts.

---

## 4. Development Roadmap & Tasks

### Suggested Improvements (Next Steps)

Here are the next tasks to improve the project's robustness, performance, and user experience.

#### L. Implement Client-Side Image Filtering with NSFWJS
**Goal:** Protect the platform from explicit/inappropriate content using client-side AI moderation that's perfect for a portfolio project - free, fast, and demonstrates ML integration skills.

**Why NSFWJS for Portfolio Projects:**
- **Zero Cost**: No API fees or usage limits - perfect for portfolio traffic
- **No External Dependencies**: Runs entirely client-side, no API key management
- **Fast & Responsive**: Instant feedback to users, no network latency
- **Privacy-Friendly**: Images never leave the user's browser for moderation
- **Portfolio Value**: Shows TensorFlow.js and client-side AI skills
- **Easy to Demo**: Reviewers can test immediately without API concerns

**Technical Approach:**
NSFWJS uses TensorFlow.js to run a pre-trained neural network in the browser that classifies images into 5 categories:
- **Drawing**: Hand-drawn or illustrated content
- **Hentai**: Animated explicit content
- **Neutral**: Safe, appropriate content
- **Porn**: Explicit photographic content
- **Sexy**: Suggestive but not explicit content

**Implementation Strategy:**
- Integrate NSFWJS into the upload form component
- Analyze images before upload and block high-confidence explicit content
- Provide clear user feedback and content policy information
- Add configurable confidence thresholds for different categories

- [ ] **To-Do:**
    - [ ] **Setup & Dependencies:**
        - [ ] Install NSFWJS and TensorFlow.js dependencies (`npm install nsfwjs @tensorflow/tfjs`)
        - [ ] Configure TensorFlow.js for optimal browser performance
        - [ ] Test model loading and basic functionality
    
    - [ ] **Integration with Upload Form:**
        - [ ] Add NSFWJS model loading to upload form component
        - [ ] Implement image analysis before file upload
        - [ ] Add loading states during image analysis ("Checking image...")
        - [ ] Handle model loading errors gracefully
        - [ ] Optimize for mobile device performance
    
    - [ ] **Content Filtering Logic:**
        - [ ] Define confidence thresholds for each category:
          - Porn: Block if confidence > 0.7
          - Hentai: Block if confidence > 0.8
          - Sexy: Block if confidence > 0.9 (more lenient for coding errors)
        - [ ] Implement filtering logic with clear decision rules
        - [ ] Add bypass for false positives (with user confirmation)
        - [ ] Log moderation decisions for analysis (client-side only)
    
    - [ ] **User Experience:**
        - [ ] Design clear error messages for blocked content
        - [ ] Create content policy page explaining guidelines
        - [ ] Add progress indicator during image analysis
        - [ ] Implement "This seems like a mistake?" feedback option
        - [ ] Provide examples of acceptable vs unacceptable content
        - [ ] Add helpful tips for avoiding false positives
    
    - [ ] **Performance Optimization:**
        - [ ] Implement model caching to avoid re-downloading
        - [ ] Add image resizing before analysis to improve speed
        - [ ] Use web workers for analysis to avoid UI blocking
        - [ ] Optimize bundle size and loading performance
        - [ ] Add fallback for browsers without TensorFlow.js support
    
    - [ ] **Configuration & Settings:**
        - [ ] Create configurable confidence thresholds
        - [ ] Add environment variables for model settings
        - [ ] Implement admin override for testing
        - [ ] Add debug mode for development
        - [ ] Create A/B testing capability for thresholds
    
    - [ ] **Testing & Quality Assurance:**
        - [ ] Test with various image types and formats
        - [ ] Validate accuracy with known test images
        - [ ] Test performance on different devices and browsers
        - [ ] Ensure graceful degradation if model fails to load
        - [ ] Test user experience flows for blocked content
        - [ ] Verify no impact on existing upload functionality
    
    - [ ] **Documentation & Policies:**
        - [ ] Create clear content policy and community guidelines
        - [ ] Document moderation approach for portfolio reviewers
        - [ ] Add FAQ section for common questions
        - [ ] Update terms of service with content guidelines
        - [ ] Create transparency about automated moderation

**Expected Benefits:**
- **Platform Safety**: Effective protection from explicit content
- **Zero Operational Cost**: No ongoing API fees or service management
- **Fast User Experience**: Instant feedback without server round-trips
- **Privacy Protection**: Images analyzed locally, never sent to third parties
- **Portfolio Demonstration**: Shows practical AI/ML integration skills
- **Scalability**: Client-side processing scales with users automatically

**Technical Considerations:**
- **Accuracy**: ~90%+ for basic NSFW detection (sufficient for portfolio)
- **Performance**: ~1-3 seconds analysis time on modern devices
- **Bundle Size**: ~2-3MB additional JavaScript (acceptable for modern web)
- **Browser Support**: Works in all modern browsers with JavaScript enabled
- **Fallback Strategy**: Allow uploads if moderation fails (with warning)

**Future Scaling Notes:**
For production scale-up, this approach could be enhanced with:
- Server-side validation using Hive AI or similar professional APIs
- Human review workflow for edge cases
- More sophisticated content categories (violence, hate speech, etc.)
- Database logging and analytics for moderation decisions

This demonstrates both practical implementation skills and architectural thinking about scaling considerations - perfect for portfolio discussions!

#### A. ~~Refactor OCR to Backend~~ (OBSOLETE - OCR Removed)
**Status:** This task is no longer relevant as OCR functionality has been completely removed from the project to improve simplicity and reliability.

#### B. Enhance Form Validation & UX
**Goal:** Replace `alert()` with modern notifications and add robust, user-friendly form validation.

- [ ] **To-Do:**
    - [ ] Replace all `alert()` calls in `post-upload-form.tsx` with `toast()` from the `sonner` library.
    - [ ] Create a Zod schema for the upload form's data to define validation rules.
    - [ ] Integrate `react-hook-form` with the Zod schema using `@hookform/resolvers`.
    - [ ] Refactor the `post-upload-form.tsx` to use `react-hook-form` for state management and validation.
    - [ ] Display inline error messages for each form field upon validation failure.

#### C. Implement Automated Testing
**Goal:** Add a testing framework to ensure code quality and prevent regressions.

- [ ] **To-Do:**
    - [ ] Add `vitest` and `@testing-library/react` to `devDependencies`.
    - [ ] Create a `vitest.config.ts` file for configuration.
    - [ ] Add a `"test": "vitest"` script to `package.json`.
    - [ ] Write an initial unit test for a utility function (e.g., in `src/lib/utils.ts`).
    - [ ] Write a simple component test to ensure a UI component renders (e.g., `src/components/ui/button.tsx`).
    - [ ] Write an API test for the `/api/upload` route to check error handling.

#### D. Secure Environment Variables
**Goal:** Securely manage Supabase credentials and other secrets, ensuring they are not committed to version control.

- [ ] **To-Do:**
    - [ ] Verify that `.env.local` is included in the `.gitignore` file.
    - [ ] Create a `.env.local.example` file to document the required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
    - [ ] Ensure the Supabase clients (`src/lib/supabase/*.ts`) correctly read variables from `process.env`.

#### E. Centralize Type Definitions
**Goal:** Create a single source of truth for data structures to ensure type safety across the application.

- [ ] **To-Do:**
    - [ ] Define a central `ErrorPost` type in `src/lib/types.ts` based on the database schema.
    - [ ] Import and use this type in `post-upload-form.tsx` and any other components that handle post data.
    - [ ] Use the `ErrorPost` type in the `/api/upload/route.ts` to typecheck the data being inserted.

#### F. Make a Profile Page for Users
**Goal:** Create a public profile page for each user that displays their posts and other information.

- [ ] **To-Do:**
    - [ ] Create a new page at `src/app/profile/[username]/page.tsx`.
    - [ ] Fetch the user's profile information and posts from Supabase based on the `username` parameter.
    - [ ] Create a new `Profile` component to display the user's information, including their avatar, username, and bio.
    - [ ] Display the user's posts in a grid on their profile page.

#### G. Optimize the Connection Between the Front End and Supabase
**Goal:** Improve the performance and efficiency of data fetching from Supabase.

- [ ] **To-Do:**
    - [ ] Analyze the existing Supabase queries and identify any bottlenecks.
    - [ ] Implement caching strategies to reduce the number of requests to the database.
    - [ ] Use `react-query` or a similar library to manage data fetching, caching, and synchronization.
    - [ ] Optimize the database schema and queries for better performance.

#### H. ✅ Implement Relative Time Display for Posts and Comments (COMPLETED)
**Goal:** Display the time of posts and comments as relative time (e.g., "2 hours ago", "3 days ago") instead of static date and time, improving readability and user experience.

**✅ Implementation Completed:**
Successfully implemented relative time display across all post and comment components using date-fns library.

**✅ Features Implemented:**
- **RelativeTime Component**: Created reusable component with proper TypeScript types
- **Smart Time Display**: Shows relative time for recent content, absolute dates for old content (>1 year)
- **Hover Tooltips**: Full date/time shown on hover for precise information
- **Auto-Updates**: Recent content (<24 hours) automatically updates every minute
- **Error Handling**: Graceful handling of invalid dates and edge cases
- **Performance Optimized**: Efficient updates and memory management

**✅ Components Updated:**
- **PostCard**: Added relative time display to homepage post cards
- **PostDetail**: Added creation time to individual post pages
- **CommentList**: Updated comment timestamps to use relative time
- **Consistent Styling**: Uniform appearance across all components

**✅ Technical Implementation:**
- **Dependencies**: Installed date-fns library for robust date calculations
- **Component Location**: `src/components/ui/relative-time.tsx`
- **Features**: Tooltips, auto-refresh, fallback handling, accessibility support
- **Integration**: Seamlessly integrated into existing post and comment components

**✅ Benefits Achieved:**
- **Better UX**: More intuitive time understanding ("2 hours ago" vs "2024-01-15 14:30:00")
- **Social Media Feel**: Matches user expectations from other platforms
- **Cleaner UI**: Shorter, more readable time stamps
- **Dynamic Updates**: Time automatically updates as content ages
- **Accessibility**: Proper semantic HTML with time elements and ARIA labels
- **Performance**: Efficient rendering with minimal re-renders

**✅ User Experience Improvements:**
- **Homepage**: Post cards now show when each error was shared
- **Post Details**: Clear indication of when posts were created
- **Comments**: Easy to see comment recency and conversation flow
- **Tooltips**: Hover for exact timestamps when precision is needed

#### I. Add Smooth Transition Between Floating Nav & a Nav Bar
**Goal:** Create a seamless transition between the floating navigation bar and a standard, fixed navigation bar when the user scrolls.

- [ ] **To-Do:**
    - [ ] Create a new state to track the scroll position of the page.
    - [ ] Conditionally render either the `FloatingNavbar` or a standard `Navbar` component based on the scroll position.
    - [ ] Use a library like `framer-motion` to animate the transition between the two navigation bars.
    - [ ] Ensure the transition is smooth and performant.

#### J. ✅ Simplify Upload Page - Image & Caption Only (COMPLETED)
**Goal:** Streamline the upload experience by removing complex form fields and focusing on just image upload and a simple caption with emotional context.

**✅ Implementation Completed:**
- **Simplified Upload Form**: Completely refactored to show only image upload and caption
- **Drag & Drop Support**: Large, intuitive drag-and-drop zone with file picker fallback
- **Emotional Caption**: Single textarea with placeholder "How does this error make you feel? huh!"
- **Visual Upload Button**: Prominent "Share Your Pain" button with loading states
- **Clean UI**: Minimal, distraction-free interface focusing on essentials
- **Mobile Optimized**: Responsive design that works great on mobile devices
- **Optional Caption**: Users can upload with or without caption (defaults to "Untitled Error")
- **Image Preview**: Shows preview with remove/change options
- **Character Counter**: 500 character limit with live counter
- **Updated Tests**: Comprehensive tests for the simplified upload flow

**✅ Technical Changes:**
- **Database**: Leveraged existing nullable fields (language, error_type, tags)
- **API Route**: Updated to handle simplified payload and remove title requirement
- **Form Validation**: Simplified to only require image file
- **Upload Page**: Updated copy to "Share your coding pain" theme
- **Backward Compatibility**: Existing posts continue to work perfectly

**✅ Benefits Achieved:**
- **Faster Upload Process**: Users can share errors in seconds
- **Lower Barrier to Entry**: No intimidating form fields
- **Better Mobile Experience**: Touch-friendly drag-and-drop interface
- **Increased Engagement**: Emotional captions encourage community interaction
- **Focus on Community**: Emphasizes sharing feelings rather than technical details

#### K. ✅ Remove OCR Functionality - Simplify and Improve Reliability (COMPLETED)
**Goal:** Remove OCR (Optical Character Recognition) functionality to simplify the codebase, improve reliability, and reduce complexity for users.

**✅ Implementation Completed:**
OCR functionality has been successfully removed from the project to improve simplicity and reliability.

**✅ Benefits Achieved:**
- **Faster Uploads**: No waiting for OCR processing
- **Better Reliability**: Eliminated OCR failure points
- **Simpler Codebase**: Reduced complexity and maintenance overhead
- **Better Mobile Experience**: No resource-intensive processing on mobile devices
- **Improved User Experience**: Streamlined upload process without OCR delays
- **Focus on Simplicity**: Users provide context through captions instead of relying on automated text extraction

**✅ Technical Changes:**
- **Dependencies**: Removed OCR-related packages and dependencies
- **Upload Form**: Simplified to focus on image upload and caption only
- **API Routes**: Streamlined without OCR processing logic
- **Database**: No extracted_text field dependencies
- **Search**: Focuses on titles, captions, and metadata instead of extracted text
- **UI Components**: Clean interface without OCR progress indicators

**Rationale for Removal:**
- OCR often failed with blurry or low-quality error screenshots
- Added unnecessary complexity to the upload process
- Resource-intensive processing that slowed down uploads
- Users can provide better context through captions
- Simplified the overall user experience significantly

### Completed Tasks

- [x] **Initial project setup and dependency installation.**
- [x] **Core Supabase schema and RLS policies defined.**
- [x] **Basic UI components and layout structure in place.**
- [x] **Post upload functionality implemented.**
- [x] **OCR functionality removed for simplicity and reliability.**
- [x] **Fixed Supabase cookie modification errors in Next.js 15.**
- [x] **Simplified upload page to image + caption only with emotional focus.**
- [x] **Removed OCR functionality to improve reliability and simplicity.**
- [x] **Implemented relative time display for posts and comments.**
- [x] **Enhance Search Bar UI**
- [x] **Migrate from `@next/font` to `next/font`**
- [x] **Implement Pinterest-Style Masonry Layout for Homepage**
