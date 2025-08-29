import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/upload/route'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
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
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

describe('/api/upload', () => {
  it('handles upload without extracted_text field', async () => {
    const formData = new FormData()
    formData.append('file', new File(['test'], 'test.png', { type: 'image/png' }))
    formData.append('title', 'Test Error Post')
    formData.append('language', 'JavaScript')
    formData.append('error_type', 'Runtime Error')
    formData.append('tags', 'test,error')

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.image_url).toBeDefined()
  })

  it('rejects upload without file', async () => {
    const formData = new FormData()
    formData.append('title', 'Test Error Post')

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing file')
  })

  it('rejects upload without title', async () => {
    const formData = new FormData()
    formData.append('file', new File(['test'], 'test.png', { type: 'image/png' }))

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing title')
  })
})