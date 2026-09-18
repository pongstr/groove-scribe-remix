import { describe, expect, it } from 'vitest'

import { slotDurationMs } from '../../src/lib/utils/music-math'
import {
  metronomeClickOffsetMs,
  slotAbsoluteMs,
  upsertTupletAt,
} from '../../src/lib/utils/tuplet-timing'

const TEMPO = 120
const DIVISION = 16
const TOTAL_SLOTS = 16
const SLOT_MS = slotDurationMs(DIVISION, TEMPO)

function clickOffset(
  tick: number,
  subdivision: number,
  groups: App.Groove.TupletGroup[] = [],
  originSlot = 0,
) {
  return metronomeClickOffsetMs(tick, {
    division: DIVISION,
    subdivision,
    slotMs: SLOT_MS,
    totalSlots: TOTAL_SLOTS,
    groups,
    originSlot,
  })
}

describe('metronomeClickOffsetMs', () => {
  it('matches straight-grid BPM intervals for 16th, 8th, and quarter clicks', () => {
    const sixteenth = (60 / TEMPO) * (4 / 16) * 1000
    const eighth = (60 / TEMPO) * (4 / 8) * 1000
    const quarter = (60 / TEMPO) * (4 / 4) * 1000

    expect(clickOffset(0, 16)).toBe(0)
    expect(clickOffset(1, 16)).toBeCloseTo(sixteenth)
    expect(clickOffset(2, 16)).toBeCloseTo(sixteenth * 2)

    expect(clickOffset(1, 8)).toBeCloseTo(eighth)
    expect(clickOffset(2, 8)).toBeCloseTo(eighth * 2)

    expect(clickOffset(1, 4)).toBeCloseTo(quarter)
    expect(clickOffset(2, 4)).toBeCloseTo(quarter * 2)
  })

  it('aligns the click after a triplet with slotAbsoluteMs, not straight n * slotMs', () => {
    const groups = upsertTupletAt([], 4, 'triplet', TOTAL_SLOTS)
    const afterTriplet = clickOffset(7, 16, groups)
    expect(afterTriplet).toBeCloseTo(slotAbsoluteMs(7, SLOT_MS, groups))
    expect(afterTriplet).toBeLessThan(7 * SLOT_MS)
  })

  it('aligns the click after a sixtuplet with two slots of saved time', () => {
    const groups = upsertTupletAt([], 4, 'sixtuplet', TOTAL_SLOTS)
    const afterSixtuplet = clickOffset(10, 16, groups)
    expect(afterSixtuplet).toBeCloseTo(slotAbsoluteMs(10, SLOT_MS, groups))
    expect(afterSixtuplet).toBeCloseTo(10 * SLOT_MS - 2 * SLOT_MS)
  })

  it('uses the compressed loop duration at totalSlots', () => {
    const groups = upsertTupletAt([], 4, 'triplet', TOTAL_SLOTS)
    const loopMs = slotAbsoluteMs(TOTAL_SLOTS, SLOT_MS, groups)
    expect(clickOffset(TOTAL_SLOTS, 16, groups)).toBeCloseTo(loopMs)
    expect(loopMs).toBeLessThan(TOTAL_SLOTS * SLOT_MS)
  })

  it('interpolates a 16th click on an 8th-note grid inside and outside a tuplet', () => {
    const eighthDivision = 8
    const eighthSlotMs = slotDurationMs(eighthDivision, TEMPO)
    const groups = upsertTupletAt([], 0, 'triplet', 8)

    const outside = metronomeClickOffsetMs(3, {
      division: eighthDivision,
      subdivision: 16,
      slotMs: eighthSlotMs,
      totalSlots: 8,
      groups: [],
    })
    expect(outside).toBeCloseTo(1.5 * eighthSlotMs)

    const inside = metronomeClickOffsetMs(1, {
      division: eighthDivision,
      subdivision: 16,
      slotMs: eighthSlotMs,
      totalSlots: 8,
      groups,
    })
    expect(inside).toBeCloseTo(slotAbsoluteMs(0.5, eighthSlotMs, groups))
    expect(inside).toBeLessThan(0.5 * eighthSlotMs)
  })

  it('subtracts originSlot so resume starts at t=0', () => {
    const groups = upsertTupletAt([], 4, 'triplet', TOTAL_SLOTS)
    expect(clickOffset(5, 16, groups, 5)).toBeCloseTo(0)
    expect(clickOffset(7, 16, groups, 5)).toBeCloseTo(
      slotAbsoluteMs(7, SLOT_MS, groups) - slotAbsoluteMs(5, SLOT_MS, groups),
    )
  })
})
