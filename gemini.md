# Project: bugpin

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend & Auth:** Supabase
- **Image Processing:** Tesseract.js for OCR

## Core Features
- **User Authentication:** Sign-in, sign-up, and user profile management via Supabase Auth.
- **Posts:**
    - Create, view, and list posts.
    - Like posts.
- **Image Upload & OCR:**
    - Users can upload images.
    - The backend processes these images using OCR (Tesseract.js) to extract text.
- **Comments:** Users can comment on posts.
- **User Profiles:** Public-facing user profiles displaying their posts.

## API Structure (Implicit)
- `/api/upload`: Handles image uploads and OCR processing.
- Supabase is used as the primary data API for posts, comments, likes, and user profiles.

## Development Notes
- Follow existing code structure and conventions.
- Use Supabase client for all database interactions.
- UI should remain consistent with the existing `shadcn/ui` implementation.
- Always check the DEVELOPMENT_PLAN.md file before doing any task to if the task asked is available if not add it and after finishing it mark it as complete
- Only use the gemini.md file located in the current project directory, not the global C:\Users\kasab\.gemini\GEMINI.md file.
