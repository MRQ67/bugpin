import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostUploadForm from '@/components/posts/post-upload-form'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
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
    
    // Should have simplified form elements
    expect(screen.getByLabelText(/error screenshot/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/caption/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /share your pain/i })).toBeInTheDocument()
    
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
    
    const fileInput = screen.getByLabelText(/error screenshot/i)
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Should show preview
    await waitFor(() => {
      const preview = screen.getByAltText('Preview')
      expect(preview).toBeInTheDocument()
    })
    
    // Should show remove and change buttons
    expect(screen.getByText('Remove')).toBeInTheDocument()
    expect(screen.getByText('Change Image')).toBeInTheDocument()
    
    // Should not show any OCR-related status
    expect(screen.queryByText(/ocr/i)).not.toBeInTheDocument()
  })

  it('validates that image is required', async () => {
    render(<PostUploadForm />)
    
    const uploadButton = screen.getByRole('button', { name: /share your pain/i })
    
    // Button should be disabled without file
    expect(uploadButton).toBeDisabled()
    
    // Add a file
    const fileInput = screen.getByLabelText(/error screenshot/i)
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Button should now be enabled
    await waitFor(() => {
      expect(uploadButton).not.toBeDisabled()
    })
  })
})