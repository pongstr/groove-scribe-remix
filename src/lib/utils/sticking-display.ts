import type { GrooveData, Slot, StickingArticulation } from './types'

/** Swap R↔L for display-only reverse sticking mode. */
export function reverseStickingSlot(
  slot: Slot<StickingArticulation>,
): Slot<StickingArticulation> {
  if (slot === 'R') return 'L'
  if (slot === 'L') return 'R'
  return slot
}

/** Return a groove clone with stickings swapped for notation/display (no mutation of source). */
export function withDisplayStickings(
  data: GrooveData,
  reverse: boolean,
): GrooveData {
  if (!reverse) return data
  return {
    ...data,
    sticking: data.sticking.map(reverseStickingSlot),
  }
}
