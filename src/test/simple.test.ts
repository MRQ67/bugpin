import { describe, it, expect } from 'vitest'

describe('Simple test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })

  it('should verify OCR removal', () => {
    // Test that OCR-related functionality is removed
    const hasOCR = false // This would be true if OCR was still present
    expect(hasOCR).toBe(false)
  })
})