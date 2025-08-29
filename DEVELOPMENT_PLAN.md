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

### Current Status
- [x] Initial project setup and dependency installation.
- [x] Core Supabase schema and RLS policies defined.
- [x] Basic UI components and layout structure in place.
- [x] Client-side OCR and post upload functionality implemented.

### Suggested Improvements (Next Steps)

Here are the next tasks to improve the project's robustness, performance, and user experience.

#### A. Refactor OCR to Backend
**Goal:** Move the resource-intensive OCR process from the user's browser to the server to improve reliability and performance.

- [ ] **To-Do:**
    - [ ] Modify `/api/upload/route.ts` to accept an image file directly.
    - [ ] Implement server-side OCR logic within the API route using a library like `tesseract.js`.
    - [ ] Remove the client-side `runOCR` call and related logic from `src/components/posts/post-upload-form.tsx`.
    - [ ] Update the form to show a loading state while the backend processes the image.

#### B. Implement Automated Testing
**Goal:** Add a testing framework to ensure code quality and prevent regressions.

- [ ] **To-Do:**
    - [ ] Add `vitest` and `@testing-library/react` to `devDependencies`.
    - [ ] Create a `vitest.config.ts` file for configuration.
    - [ ] Add a `"test": "vitest"` script to `package.json`.
    - [ ] Write an initial unit test for a utility function (e.g., in `src/lib/utils.ts`).
    - [ ] Write a simple component test to ensure a UI component renders (e.g., `src/components/ui/button.tsx`).
    - [ ] Write an API test for the `/api/upload` route to check error handling.

#### C. Enhance Form Validation & UX
**Goal:** Replace `alert()` with modern notifications and add robust, user-friendly form validation.

- [ ] **To-Do:**
    - [ ] Replace all `alert()` calls in `post-upload-form.tsx` with `toast()` from the `sonner` library.
    - [ ] Create a Zod schema for the upload form's data to define validation rules.
    - [ ] Integrate `react-hook-form` with the Zod schema using `@hookform/resolvers`.
    - [ ] Refactor the `post-upload-form.tsx` to use `react-hook-form` for state management and validation.
    - [ ] Display inline error messages for each form field upon validation failure.

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

#### F. Enhance Search Bar UI
**Goal:** Improve the search bar design to provide a better user experience.

- [x] **Done:**
    - [x] Replaced the default search bar with a new design inspired by the provided reference image.
    - [x] Ensured the new search bar is responsive and functional, adapting to different screen sizes.
    - [x] Integrated the new design with the existing search functionality.

#### G. Migrate from `@next/font` to `next/font`
**Goal:** Update the project to use the built-in `next/font` and remove the deprecated `@next/font` package to align with Next.js 14 standards.

- [x] **Done:**
    - [x] Run the `built-in-next-font` codemod to automatically update import paths.
    - [x] Verify the changes made by the codemod in the codebase.
    - [x] Uninstall the `@next/font` package.
    - [x] Run `npm install` to update the lockfile.