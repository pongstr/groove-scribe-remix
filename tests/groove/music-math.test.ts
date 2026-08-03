import { describe, expect, it } from 'vitest'

import {
  calcNotesPerMeasure,
  isTripletDivision,
  isUpbeatSlot,
  noteGroupingSize,
  slotDurationMs,
  swingDelaySeconds,
  tempoMarkingForTimeSignature,
} from '$lib/utils/music-math'

describe('calcNotesPerMeasure', () => {
  it('computes 16 for 4/4 16th notes', () => {
    expect(calcNotesPerMeasure(16, { beats: 4, noteValue: 4 })).toBe(16)
  })
  it('computes 8 for 4/4 8th notes', () => {
    expect(calcNotesPerMeasure(8, { beats: 4, noteValue: 4 })).toBe(8)
  })
  it('computes 6 for 6/8 8th notes', () => {
    expect(calcNotesPerMeasure(8, { beats: 6, noteValue: 8 })).toBe(6)
  })
  it('computes 12 for 4/4 8th-note triplets', () => {
    expect(calcNotesPerMeasure(12, { beats: 4, noteValue: 4 })).toBe(12)
  })
})

describe('isTripletDivision', () => {
  it('flags 12 and 24 as triplet divisions', () => {
    expect(isTripletDivision(12)).toBe(true)
    expect(isTripletDivision(24)).toBe(true)
  })
  it('does not flag 8, 16, 32', () => {
    expect(isTripletDivision(8)).toBe(false)
    expect(isTripletDivision(16)).toBe(false)
    expect(isTripletDivision(32)).toBe(false)
  })
})

describe('noteGroupingSize', () => {
  it('groups 4/4 16th notes into groups of 4 (one per beat)', () => {
    expect(noteGroupingSize(16, { beats: 4, noteValue: 4 })).toBe(4)
  })
  it('groups 3/4 into groups of notesPerMeasure/3', () => {
    expect(noteGroupingSize(12, { beats: 3, noteValue: 4 })).toBe(4)
  })
  it('groups 6/8 into 2 groups', () => {
    expect(noteGroupingSize(6, { beats: 6, noteValue: 8 })).toBe(3)
  })
})

describe('slotDurationMs', () => {
  it('is independent of time signature - only tempo and division matter', () => {
    expect(slotDurationMs(16, 120)).toBeCloseTo(125, 5) // 16th note at 120bpm = 125ms
    expect(slotDurationMs(8, 120)).toBeCloseTo(250, 5) // 8th note at 120bpm = 250ms
    expect(slotDurationMs(32, 120)).toBeCloseTo(62.5, 5)
  })
  it('handles triplet divisions (3 slots per quarter note for division 12)', () => {
    expect(slotDurationMs(12, 120)).toBeCloseTo(500 / 3, 5)
    expect(slotDurationMs(24, 120)).toBeCloseTo(500 / 6, 5)
  })
})

describe('isUpbeatSlot', () => {
  it('flags odd indices as upbeats for straight divisions', () => {
    expect(isUpbeatSlot(16, 0)).toBe(false)
    expect(isUpbeatSlot(16, 1)).toBe(true)
    expect(isUpbeatSlot(16, 2)).toBe(false)
    expect(isUpbeatSlot(16, 3)).toBe(true)
    expect(isUpbeatSlot(8, 1)).toBe(true)
  })
  it('never flags triplet divisions', () => {
    expect(isUpbeatSlot(12, 1)).toBe(false)
    expect(isUpbeatSlot(24, 3)).toBe(false)
  })
})

describe('swingDelaySeconds', () => {
  it('is zero at 0% swing', () => {
    expect(swingDelaySeconds(0.25, 0)).toBe(0)
  })
  it('is one third of a slot at 100% swing (classic triplet shuffle)', () => {
    expect(swingDelaySeconds(0.25, 100)).toBeCloseTo(0.25 / 3, 5)
  })
  it('scales linearly with percent', () => {
    expect(swingDelaySeconds(0.3, 50)).toBeCloseTo(0.3 * 0.5 * (1 / 3), 5)
  })
})

describe('tempoMarkingForTimeSignature', () => {
  it('uses a quarter note for common */4 meters', () => {
    expect(tempoMarkingForTimeSignature({ beats: 4, noteValue: 4 })).toEqual({
      symbol: '\u2669',
      label: 'quarter',
    })
    expect(tempoMarkingForTimeSignature({ beats: 5, noteValue: 4 })).toEqual({
      symbol: '\u2669',
      label: 'quarter',
    })
  })

  it('uses a half note for */2 meters', () => {
    expect(tempoMarkingForTimeSignature({ beats: 2, noteValue: 2 })).toEqual({
      symbol: '\u{1D15E}',
      label: 'half',
    })
  })

  it('uses a dotted quarter for compound */8 meters', () => {
    for (const beats of [6, 9, 12]) {
      expect(tempoMarkingForTimeSignature({ beats, noteValue: 8 })).toEqual({
        symbol: '\u2669.',
        label: 'dotted quarter',
      })
    }
  })

  it('uses an eighth note for non-compound */8 meters', () => {
    expect(tempoMarkingForTimeSignature({ beats: 7, noteValue: 8 })).toEqual({
      symbol: '\u266A',
      label: 'eighth',
    })
  })

  it('uses a sixteenth note for */16 meters', () => {
    expect(tempoMarkingForTimeSignature({ beats: 4, noteValue: 16 })).toEqual({
      symbol: '\u266C',
      label: 'sixteenth',
    })
  })
})
