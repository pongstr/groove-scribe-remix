/** Helpers for in-bar tuplet groups when engraving straight-division grooves. */

export const TUPLET_SLOT_COUNT = {
  triplet: 3,
  sixtuplet: 6,
}

/** Straight grid slots of time each tuplet compresses into (matches playback). */
export const TUPLET_TIME_SLOTS = {
  triplet: 2,
  sixtuplet: 4,
}

/**
 * @param {Array<{ kind: 'triplet' | 'sixtuplet'; startSlot: number }> | undefined} groups
 * @param {number} fullIndex  Index in the scaled (32nd) ABC arrays
 * @param {number} scaler     Grid slots → full-size slots multiplier
 */
export function findTupletAtFullIndex(groups, fullIndex, scaler) {
  if (!groups?.length || scaler < 1) return null

  for (const group of groups) {
    const start = group.startSlot * scaler
    const span = TUPLET_SLOT_COUNT[group.kind] * scaler
    if (fullIndex >= start && fullIndex < start + span) {
      return {
        kind: group.kind,
        start,
        span,
        noteCount: TUPLET_SLOT_COUNT[group.kind],
        isStart: fullIndex === start,
      }
    }
  }

  return null
}

/**
 * abc2svg 1.3.2 tuplet prefix (p:q:r).
 * - Triplet: (3 → 3 notes in the time of 2 (default q=2, r=3)
 * - Sixtuplet: (6:4:6 → 6 notes in the time of 4
 *
 * Do NOT use (3:3:3) or (6:6:6); q=p makes tuplet_fact=1 and breaks grouping.
 */
export function abcTupletMarker(kind) {
  if (kind === 'triplet') return '(3'
  return '(6:4:6'
}
