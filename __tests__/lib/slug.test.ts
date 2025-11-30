import { describe, it, expect } from 'vitest'
import { generateSlug } from '@/lib/slug'

describe('generateSlug', () => {
  it('should convert name to lowercase', () => {
    expect(generateSlug('My Project')).toBe('my-project')
  })

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('My Awesome Project')).toBe('my-awesome-project')
  })

  it('should remove special characters', () => {
    expect(generateSlug('My Project!@#')).toBe('my-project')
  })

  it('should handle underscores', () => {
    expect(generateSlug('my_project_name')).toBe('my-project-name')
  })

  it('should remove leading and trailing hyphens', () => {
    expect(generateSlug('  My Project  ')).toBe('my-project')
  })

  it('should handle multiple consecutive spaces', () => {
    expect(generateSlug('My    Project')).toBe('my-project')
  })

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('')
  })
})

