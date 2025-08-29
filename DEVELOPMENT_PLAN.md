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
- **Image Processing:** Tesseract.js for OCR

## 3. Database Schema

The database uses Supabase and consists of the following tables with Row Level Security (RLS) enabled:
- `profiles`: Extends `auth.users` with public user data.
- `error_posts`: The core table for storing uploaded errors, images, and OCR text.
- `comments`: For comments on error posts.
- `likes`: To track user likes on posts.

---

## 4. Development Roadmap & Tasks

### Suggested Improvements (Next Steps)

Here are the next tasks to improve the project's robustness, performance, and user experience.

#### A. Refactor OCR to Backend
**Goal:** Move the resource-intensive OCR process from the user's browser to the server to improve reliability and performance.

- [ ] **To-Do:**
    - [ ] Modify `/api/upload/route.ts` to accept an image file directly.
    - [ ] Implement server-side OCR logic within the API route using a library like `tesseract.js`.
    - [ ] Remove the client-side `runOCR` call and related logic from `src/components/posts/post-upload-form.tsx`.
    - [ ] Update the form to show a loading state while the backend processes the image.

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

### Completed Tasks

- [x] **Initial project setup and dependency installation.**
- [x] **Core Supabase schema and RLS policies defined.**
- [x] **Basic UI components and layout structure in place.**
- [x] **Client-side OCR and post upload functionality implemented.**
- [x] **Enhance Search Bar UI**
- [x] **Migrate from `@next/font` to `next/font`**
- [x] **Implement Pinterest-Style Masonry Layout for Homepage**
