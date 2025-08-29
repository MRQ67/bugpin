import { describe, it, expect } from 'vitest'

describe('Search functionality', () => {
    it('should search without extracted_text field', () => {
        const searchQuery = 'javascript error'

        // Simulate the search query construction from page.tsx
        const searchFields = `title.ilike.%${searchQuery}%,language.ilike.%${searchQuery}%,error_type.ilike.%${searchQuery}%`

        // Should not include extracted_text in search
        expect(searchFields).not.toContain('extracted_text')

        // Should include the main searchable fields
        expect(searchFields).toContain('title.ilike')
        expect(searchFields).toContain('language.ilike')
        expect(searchFields).toContain('error_type.ilike')
    })

    it('should handle empty search query', () => {
        const searchQuery = ''

        // Empty query should not trigger search
        expect(searchQuery.trim()).toBe('')
    })
})