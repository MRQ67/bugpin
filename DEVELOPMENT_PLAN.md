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

#### H. Change the Date and Time on the Comments to Elapsed Period of Time from the Current Time
**Goal:** Display the time of a comment as a relative time (e.g., "2 hours ago") instead of a static date and time.

- [ ] **To-Do:**
    - [ ] Use a library like `date-fns` or `dayjs` to calculate the relative time.
    - [ ] Create a new component to display the relative time.
    - [ ] Replace the existing date and time display with the new relative time component in the `CommentList` component.

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

#### K. Remove OCR Functionality - Simplify and Improve Reliability
**Goal:** Remove OCR (Optical Character Recognition) functionality to simplify the codebase, improve reliability, and reduce complexity for users.

**Rationale:**
- OCR often fails with blurry or low-quality error screenshots
- Adds unnecessary complexity to the upload process
- Resource-intensive processing that can slow down uploads
- Users can provide context through captions instead
- Simplifies the overall user experience

- [ ] **To-Do:**
    - [ ] **Remove OCR Dependencies:**
        - [ ] Remove `tesseract.js` from package.json dependencies
        - [ ] Delete `src/lib/ocr.ts` file
        - [ ] Delete `src/types/tesseract-js.d.ts` type definitions
    
    - [ ] **Update Database Schema:**
        - [ ] Remove `extracted_text` field from ErrorPost type in `src/lib/types.ts`
        - [ ] Create migration to drop `extracted_text` column from `error_posts` table
        - [ ] Update any database queries that reference `extracted_text`
    
    - [ ] **Refactor Upload Form:**
        - [ ] Remove all OCR-related state from `src/components/posts/post-upload-form.tsx`
        - [ ] Remove OCR progress indicators and status displays
        - [ ] Remove `runOCR` function calls and related logic
        - [ ] Simplify upload flow to just handle image and form data
        - [ ] Remove OCR-related loading states and error handling
    
    - [ ] **Update API Route:**
        - [ ] Remove `extracted_text` parameter from `/api/upload/route.ts`
        - [ ] Remove `extracted_text` from database insertion
        - [ ] Simplify error handling by removing OCR-related errors
    
    - [ ] **Update Search Functionality:**
        - [ ] Remove text-based search that relied on `extracted_text`
        - [ ] Focus search on titles, tags, and other metadata
        - [ ] Update search queries in `src/app/page.tsx`
    
    - [ ] **Clean Up UI Components:**
        - [ ] Remove any OCR status displays from upload forms
        - [ ] Remove OCR progress bars and related UI elements
        - [ ] Update loading states to focus on image upload only
    
    - [ ] **Add Comprehensive Tests:**
        - [ ] Test image upload without OCR processing
        - [ ] Test post creation with simplified data structure
        - [ ] Test search functionality without extracted text
        - [ ] Test existing posts display correctly after OCR removal
        - [ ] Test mobile upload experience
        - [ ] Test error handling for upload failures
    
    - [ ] **Documentation Updates:**
        - [ ] Update README to reflect OCR removal
        - [ ] Update development plan to remove OCR references
        - [ ] Update any API documentation

**Expected Benefits:**
- **Faster Uploads**: No waiting for OCR processing
- **Better Reliability**: Eliminates OCR failure points
- **Simpler Codebase**: Less complexity to maintain
- **Better Mobile Experience**: Reduced processing on mobile devices
- **Lower Server Costs**: No OCR processing overhead

### Completed Tasks

- [x] **Initial project setup and dependency installation.**
- [x] **Core Supabase schema and RLS policies defined.**
- [x] **Basic UI components and layout structure in place.**
- [x] **Post upload functionality implemented.**
- [x] **OCR functionality removed for simplicity and reliability.**
- [x] **Fixed Supabase cookie modification errors in Next.js 15.**
- [x] **Simplified upload page to image + caption only with emotional focus.**
- [x] **Enhance Search Bar UI**
- [x] **Migrate from `@next/font` to `next/font`**
- [x] **Implement Pinterest-Style Masonry Layout for Homepage**
