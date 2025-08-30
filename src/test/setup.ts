import '@testing-library/jest-dom'

// Mock URL.createObjectURL for file upload tests
global.URL.createObjectURL = vi.fn(() => 'mocked-object-url')
global.URL.revokeObjectURL = vi.fn()

// Import vi from vitest
import { vi } from 'vitest'