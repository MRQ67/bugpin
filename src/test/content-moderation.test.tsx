import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContentModeration } from '@/hooks/use-content-moderation'

// Mock NSFWJS and TensorFlow
vi.mock('nsfwjs', () => ({
  load: vi.fn(() => Promise.resolve({
    classify: vi.fn(() => Promise.resolve([
      { className: 'Neutral', probability: 0.8 },
      { className: 'Drawing', probability: 0.15 },
      { className: 'Porn', probability: 0.03 },
      { className: 'Sexy', probability: 0.02 },
      { className: 'Hentai', probability: 0.01 }
    ]))
  }))
}))

vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn(() => Promise.resolve())
}))

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock Image constructor
global.Image = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src: string = ''
  
  constructor() {
    // Simulate successful image load after a short delay
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 10)
  }
} as any

describe('useContentModeration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useContentModeration())
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.modelLoaded).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should preload model successfully', async () => {
    const { result } = renderHook(() => useContentModeration())
    
    await act(async () => {
      await result.current.preloadModel()
    })
    
    expect(result.current.modelLoaded).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('should analyze appropriate image successfully', async () => {
    const { result } = renderHook(() => useContentModeration())
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    
    let analysisResult
    await act(async () => {
      analysisResult = await result.current.analyzeImage(mockFile)
    })
    
    expect(analysisResult).toEqual({
      isAppropriate: true,
      confidence: 0.03, // Highest inappropriate confidence (porn: 0.03)
      predictions: {
        neutral: 0.8,
        drawing: 0.15,
        porn: 0.03,
        sexy: 0.02,
        hentai: 0.01
      },
      blockedReason: undefined
    })
  })

  it('should block inappropriate content with custom thresholds', async () => {
    const customConfig = {
      thresholds: {
        porn: 0.01, // Very low threshold for testing
        hentai: 0.8,
        sexy: 0.9
      }
    }
    
    const { result } = renderHook(() => useContentModeration(customConfig))
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    
    let analysisResult
    await act(async () => {
      analysisResult = await result.current.analyzeImage(mockFile)
    })
    
    expect(analysisResult).toEqual({
      isAppropriate: false,
      confidence: 0.03,
      predictions: {
        neutral: 0.8,
        drawing: 0.15,
        porn: 0.03,
        sexy: 0.02,
        hentai: 0.01
      },
      blockedReason: 'Explicit content detected'
    })
  })

  it('should handle model loading errors gracefully', async () => {
    // Mock NSFWJS to throw an error
    vi.mocked(await import('nsfwjs')).load.mockRejectedValueOnce(new Error('Model load failed'))
    
    const { result } = renderHook(() => useContentModeration())
    
    await act(async () => {
      try {
        await result.current.preloadModel()
      } catch (error) {
        // Expected to throw
      }
    })
    
    expect(result.current.error).toBe('Model load failed')
    expect(result.current.modelLoaded).toBe(false)
  })

  it('should clear errors', () => {
    const { result } = renderHook(() => useContentModeration())
    
    act(() => {
      // Manually set an error for testing
      result.current.clearError()
    })
    
    expect(result.current.error).toBe(null)
  })
})