import { describe, it, expect } from 'vitest'
import { computeDiff } from '@/lib/diff'

describe('computeDiff', () => {
  it('should compute diff for added lines', () => {
    const previous = 'line1\nline2'
    const current = 'line1\nline2\nline3'
    const result = computeDiff(previous, current)

    expect(result.addedCount).toBe(1)
    expect(result.removedCount).toBe(0)
    expect(result.lines.some(line => line.type === 'added' && line.value === 'line3')).toBe(true)
  })

  it('should compute diff for removed lines', () => {
    const previous = 'line1\nline2\nline3'
    const current = 'line1\nline2'
    const result = computeDiff(previous, current)

    expect(result.addedCount).toBe(0)
    expect(result.removedCount).toBe(1)
    expect(result.lines.some(line => line.type === 'removed' && line.value === 'line3')).toBe(true)
  })

  it('should handle identical code', () => {
    const code = 'line1\nline2'
    const result = computeDiff(code, code)

    expect(result.addedCount).toBe(0)
    expect(result.removedCount).toBe(0)
    expect(result.lines.every(line => line.type === 'unchanged')).toBe(true)
  })

  it('should handle empty code', () => {
    const result = computeDiff('', '')

    expect(result.addedCount).toBe(0)
    expect(result.removedCount).toBe(0)
  })

  it('should handle code with only additions', () => {
    const result = computeDiff('', 'line1\nline2')

    expect(result.addedCount).toBe(2)
    expect(result.removedCount).toBe(0)
  })

  it('should handle code with only removals', () => {
    const result = computeDiff('line1\nline2', '')

    expect(result.addedCount).toBe(0)
    expect(result.removedCount).toBe(2)
  })
})

