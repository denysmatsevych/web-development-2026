import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Кожен тест починає як гість, без квитків і без «Мого списку».
beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
