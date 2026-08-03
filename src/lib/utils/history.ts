import type { GrooveData } from './types'

export const HISTORY_MAX = 50

export interface HistoryStacks {
  past: GrooveData[]
  future: GrooveData[]
}

export function emptyHistory(): HistoryStacks {
  return { past: [], future: [] }
}

export function cloneGroove(data: GrooveData): GrooveData {
  return JSON.parse(JSON.stringify(data)) as GrooveData
}

/** Push current groove onto past, clear future, trim to cap. */
export function pushHistory(
  stacks: HistoryStacks,
  current: GrooveData,
): HistoryStacks {
  const past = [...stacks.past, cloneGroove(current)]
  while (past.length > HISTORY_MAX) past.shift()
  return { past, future: [] }
}

export function undoHistory(
  stacks: HistoryStacks,
  current: GrooveData,
): { stacks: HistoryStacks; groove: GrooveData } | null {
  if (stacks.past.length === 0) return null
  const past = stacks.past.slice()
  const previous = past.pop()!
  const future = [cloneGroove(current), ...stacks.future]
  while (future.length > HISTORY_MAX) future.pop()
  return { stacks: { past, future }, groove: previous }
}

export function redoHistory(
  stacks: HistoryStacks,
  current: GrooveData,
): { stacks: HistoryStacks; groove: GrooveData } | null {
  if (stacks.future.length === 0) return null
  const future = stacks.future.slice()
  const next = future.shift()!
  const past = [...stacks.past, cloneGroove(current)]
  while (past.length > HISTORY_MAX) past.shift()
  return { stacks: { past, future }, groove: next }
}
