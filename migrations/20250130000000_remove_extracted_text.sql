-- Remove extracted_text column from error_posts table
-- This migration removes OCR functionality to simplify the platform

-- Drop the extracted_text column if it exists
ALTER TABLE IF EXISTS public.error_posts 
DROP COLUMN IF EXISTS extracted_text;

-- Update any indexes that might reference extracted_text
-- (Add specific index drops here if they exist)

-- Note: This migration is safe to run multiple times
-- The IF EXISTS clauses ensure no errors if the column is already removed