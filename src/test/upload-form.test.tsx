import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostUploadForm from '@/components/posts/post-upload-form'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock content moderation hook to avoid NSFWJS issues in tests
vi.mock('@/hooks/use-content-moderation', () => ({
  useContentModeration: () => ({
    analyzeImage: vi.fn().mockResolvedValue({
      isAppropriate: true,
      confidence: 0,
      predictions: { neutral: 0.9, porn: 0.05, sexy: 0.03, hentai: 0.01, drawing: 0.01 },
      blockedReason: undefined,
    }),
    modelLoaded: true,
    loading: false,
    error: null,
    clearError: vi.fn(),
    preloadModel: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test-image.jpg' },
        }),
      }),
    },
    from: () => ({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-post-id' },
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

describe('PostUploadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders simplified upload form with only image and caption', () => {
    render(<PostUploadForm />)
    
    // Should have simplified form elements - use the actual file input
    expect(screen.getByRole('textbox')).toBeInTheDocument() // Caption textarea
    expect(screen.getByRole('button', { name: /share your pain/i })).toBeInTheDocument()
    expect(screen.getByText(/error screenshot/i)).toBeInTheDocument() // Label text
    
    // Should have the emotional placeholder text
    expect(screen.getByPlaceholderText(/how does this error make you feel/i)).toBeInTheDocument()
    
    // Should NOT have complex form fields
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/language/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/error type/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/tags/i)).not.toBeInTheDocument()
    
    // Should NOT have OCR-related elements
    expect(screen.queryByText(/ocr progress/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/preparing ocr/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ocr complete/i)).not.toBeInTheDocument()
  })

  it('handles file selection with drag and drop support', async () => {
    render(<PostUploadForm />)
    
    // Find the actual file input element
    const actualFileInput = document.getElementById('file-input') as HTMLInputElement
    expect(actualFileInput).toBeInTheDocument()
    expect(actualFileInput).toHaveAttribute('type', 'file')
    expect(actualFileInput).toHaveAttribute('accept', 'image/*')
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    fireEvent.change(actualFileInput, { target: { files: [file] } })
    
    // File input should have the file
    expect(actualFileInput.files).toHaveLength(1)
    expect(actualFileInput.files?.[0]).toBe(file)
    
    // Should not show any OCR-related status
    expect(screen.queryByText(/ocr/i)).not.toBeInTheDocument()
  })

  it('validates that image is required', async () => {
    render(<PostUploadForm />)
    
    const uploadButton = screen.getByRole('button', { name: /share your pain/i })
    
    // Button should be disabled without file
    expect(uploadButton).toBeDisabled()
    
    // Add a file
    const actualFileInput = document.getElementById('file-input') as HTMLInputElement
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    fireEvent.change(actualFileInput, { target: { files: [file] } })
    
    // Button should now be enabled
    await waitFor(() => {
      expect(uploadButton).not.toBeDisabled()
    })
  })
})