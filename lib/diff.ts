import { diffLines } from 'diff'

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  value: string
  lineNumber?: number
}

export interface DiffResult {
  lines: DiffLine[]
  addedCount: number
  removedCount: number
}

export function computeDiff(previousCode: string, currentCode: string): DiffResult {
  const changes = diffLines(previousCode || '', currentCode || '')
  const lines: DiffLine[] = []
  let addedCount = 0
  let removedCount = 0
  let lineNumber = 1

  for (const change of changes) {
    const changeLines = change.value.split('\n')
    // Remove the last empty line if it exists (from split)
    if (changeLines[changeLines.length - 1] === '') {
      changeLines.pop()
    }

    for (const line of changeLines) {
      if (change.added) {
        lines.push({ type: 'added', value: line, lineNumber })
        addedCount++
        lineNumber++
      } else if (change.removed) {
        lines.push({ type: 'removed', value: line, lineNumber: undefined })
        removedCount++
      } else {
        lines.push({ type: 'unchanged', value: line, lineNumber })
        lineNumber++
      }
    }
  }

  return { lines, addedCount, removedCount }
}

export function formatDiffForDisplay(diff: DiffResult): {
  added: string[]
  removed: string[]
  unchanged: string[]
} {
  const added: string[] = []
  const removed: string[] = []
  const unchanged: string[] = []

  for (const line of diff.lines) {
    if (line.type === 'added') {
      added.push(line.value)
    } else if (line.type === 'removed') {
      removed.push(line.value)
    } else {
      unchanged.push(line.value)
    }
  }

  return { added, removed, unchanged }
}

