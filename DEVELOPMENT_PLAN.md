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

#### J. Simplify Upload Page - Image & Caption Only
**Goal:** Streamline the upload experience by removing complex form fields and focusing on just image upload and a simple caption with emotional context.

**Current State Analysis:**
- The current upload form likely includes fields for language selection, error type, detailed descriptions, and other metadata
- Users may find the current form overwhelming or time-consuming
- The goal is to make sharing error screenshots as frictionless as possible, similar to social media posting

**New Simplified Design:**
- **Image Upload Area**: Large, prominent drag-and-drop zone or file picker
- **Caption Field**: Single textarea with placeholder "How does this error make you feel? huh!"
- **Upload Button**: Simple, prominent call-to-action button
- **Clean UI**: Minimal, distraction-free interface focusing on the essentials

- [ ] **To-Do:**
    - [ ] **Database Schema Updates:**
        - [ ] Review current `error_posts` table structure
        - [ ] Make language, error_type, and other detailed fields optional or remove them
        - [ ] Ensure the table can handle posts with just image_url and caption
        - [ ] Update any database constraints that might require the removed fields
    
    - [ ] **Backend API Changes:**
        - [ ] Modify `/api/upload/route.ts` to accept simplified payload (image + caption only)
        - [ ] Remove validation for language and error type fields
        - [ ] Update the database insertion logic to work with minimal data
        - [ ] Ensure OCR processing still works with the simplified approach
        - [ ] Add default values or null handling for removed fields
    
    - [ ] **Frontend Component Refactor:**
        - [ ] Simplify `src/components/posts/post-upload-form.tsx` or create new simplified version
        - [ ] Remove language selector, error type dropdown, and detailed description fields
        - [ ] Create a large, prominent image upload area (drag-and-drop + file picker)
        - [ ] Add single caption textarea with placeholder "How does this error makes you feel? huh!"
        - [ ] Style the form to be clean and minimal
        - [ ] Ensure proper image preview functionality
        - [ ] Add loading states for upload process
    
    - [ ] **Upload Page UI/UX:**
        - [ ] Update `/src/app/upload/page.tsx` to use the simplified form
        - [ ] Design a clean, focused layout with minimal distractions
        - [ ] Add visual hierarchy: Image upload → Caption → Upload button
        - [ ] Ensure mobile responsiveness for the simplified design
        - [ ] Add helpful micro-interactions and feedback
    
    - [ ] **Form Validation Updates:**
        - [ ] Update Zod schema to only validate image and caption
        - [ ] Ensure caption is optional or has minimal length requirements
        - [ ] Add proper image file type and size validation
        - [ ] Remove validation for language and error type fields
    
    - [ ] **Type Definitions:**
        - [ ] Update TypeScript interfaces to reflect simplified data structure
        - [ ] Modify `ErrorPost` type to make removed fields optional
        - [ ] Update any components that consume post data to handle missing fields gracefully
    
    - [ ] **Backward Compatibility:**
        - [ ] Ensure existing posts with detailed metadata still display correctly
        - [ ] Add migration strategy for existing data if needed
        - [ ] Update post display components to handle both old and new post formats
    
    - [ ] **Testing & Quality Assurance:**
        - [ ] Test the simplified upload flow end-to-end
        - [ ] Verify image upload and OCR processing still works
        - [ ] Ensure posts display correctly in the masonry layout
        - [ ] Test mobile upload experience
        - [ ] Validate that existing posts aren't broken by the changes

**Expected Benefits:**
- **Faster Upload Process**: Users can share errors quickly without filling complex forms
- **Lower Barrier to Entry**: New users won't be intimidated by detailed form fields
- **Better Mobile Experience**: Simplified interface works better on mobile devices
- **Increased Engagement**: Easier sharing should lead to more posts
- **Focus on Community**: Emotional caption encourages community interaction and support

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
- [x] **Enhance Search Bar UI**
- [x] **Migrate from `@next/font` to `next/font`**
- [x] **Implement Pinterest-Style Masonry Layout for Homepage**
