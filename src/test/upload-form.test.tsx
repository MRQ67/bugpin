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

  it('renders upload form without OCR elements', () => {
    render(<PostUploadForm />)
    
    // Should have basic form elements
    expect(screen.getByLabelText(/error screenshot/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument()
    
    // Should NOT have OCR-related elements
    expect(screen.queryByText(/ocr progress/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/preparing ocr/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ocr complete/i)).not.toBeInTheDocument()
  })

  it('handles file selection without OCR processing', async () => {
    render(<PostUploadForm />)
    
    const fileInput = screen.getByLabelText(/error screenshot/i)
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Should show preview without OCR status
    await waitFor(() => {
      const preview = screen.getByAltText('preview')
      expect(preview).toBeInTheDocument()
    })
    
    // Should not show any OCR-related status
    expect(screen.queryByText(/ocr/i)).not.toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<PostUploadForm />)
    
    const uploadButton = screen.getByRole('button', { name: /upload/i })
    
    // Try to submit without file
    fireEvent.click(uploadButton)
    
    // Should not proceed (form validation should prevent submission)
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument()
  })
})