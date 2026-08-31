/** Swap R↔L for display-only reverse sticking mode. */
export function reverseStickingSlot(
  slot: App.Groove.Slot<App.Groove.StickingArticulation>,
): App.Groove.Slot<App.Groove.StickingArticulation> {
  if (slot === 'R') return 'L'
  if (slot === 'L') return 'R'
  return slot
}

/** Return a groove clone with stickings swapped for notation/display (no mutation of source). */
export function withDisplayStickings(
  data: App.Groove.Data,
  reverse: boolean,
): App.Groove.Data {
  if (!reverse) return data
  return {
    ...data,
    sticking: data.sticking.map(reverseStickingSlot),
  }
}
