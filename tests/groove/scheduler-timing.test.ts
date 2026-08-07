import { describe, expect, it } from 'vitest'

import {
  slotAbsoluteMs,
  upsertTupletAt,
} from '../../src/lib/utils/tuplet-timing'

describe('scheduler slot durations', () => {
  it('compresses triplet slot steps relative to straight grid', () => {
    const groups = upsertTupletAt([], 4, 'triplet', 16)
    const slotMs = 100
    const straight =
      slotAbsoluteMs(5, slotMs, []) - slotAbsoluteMs(4, slotMs, [])
    const inTriplet =
      slotAbsoluteMs(5, slotMs, groups) - slotAbsoluteMs(4, slotMs, groups)
    expect(inTriplet).toBeLessThan(straight)
  })

  it('returns full groove duration at totalSlots', () => {
    const groups = upsertTupletAt([], 4, 'triplet', 16)
    const slotMs = 100
    const straightTotal = 16 * slotMs
    const tupletTotal = slotAbsoluteMs(16, slotMs, groups)
    expect(tupletTotal).toBeLessThan(straightTotal)
  })
})
