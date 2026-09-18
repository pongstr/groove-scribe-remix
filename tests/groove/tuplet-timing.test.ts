import { describe, expect, it } from 'vitest'

import {
  clampTupletGroups,
  slotAbsoluteMs,
  upsertTupletAt,
} from '../../src/lib/utils/tuplet-timing'

describe('tuplet-timing', () => {
  it('compresses triplet columns into two straight slots of time', () => {
    const groups = upsertTupletAt([], 4, 'triplet', 16)
    expect(slotAbsoluteMs(4, 100, groups)).toBe(400)
    expect(slotAbsoluteMs(5, 100, groups)).toBeCloseTo(466.67, 1)
    expect(slotAbsoluteMs(6, 100, groups)).toBeCloseTo(533.33, 1)
    expect(slotAbsoluteMs(7, 100, groups)).toBe(600)
  })

  it('interpolates fractional indices on a straight grid', () => {
    expect(slotAbsoluteMs(5.5, 100, [])).toBe(550)
    expect(slotAbsoluteMs(0.25, 100, [])).toBe(25)
  })

  it('interpolates fractional indices inside a triplet', () => {
    const groups = upsertTupletAt([], 4, 'triplet', 16)
    expect(slotAbsoluteMs(5.5, 100, groups)).toBeCloseTo(500, 5)
  })

  it('drops overlapping groups', () => {
    const groups = clampTupletGroups(
      [
        { id: 'a', kind: 'triplet', startSlot: 0 },
        { id: 'b', kind: 'triplet', startSlot: 2 },
      ],
      16,
    )
    expect(groups).toHaveLength(1)
  })
})
