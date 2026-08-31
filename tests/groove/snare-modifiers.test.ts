import { describe, expect, it } from 'vitest'

import { grooveDataToAbcArrays } from '$lib/utils/abc/tokens'
import {
  canTieSnareToNext,
  isSnareTieContinuation,
  migrateLegacySnareBuzz,
  snareHasAccent,
  snareSustainEndSlot,
  snareSustainSeconds,
} from '$lib/utils/snare-modifiers'
import { createEmptyGrooveData } from '$lib/utils/tab-notation'

describe('snare modifiers', () => {
  it('treats flam and accent articulations as inherently accented', () => {
    const data = createEmptyGrooveData()
    data.snare[0] = 'flam'
    data.snare[1] = 'accent'
    data.snare[2] = 'buzz2'
    expect(snareHasAccent(data, 0)).toBe(true)
    expect(snareHasAccent(data, 1)).toBe(true)
    expect(snareHasAccent(data, 2)).toBe(false)
    data.snareAccent = data.snare.map(() => false)
    data.snareAccent[2] = true
    expect(snareHasAccent(data, 2)).toBe(true)
  })

  it('ties forward to the next occupied snare slot, skipping rests', () => {
    const data = createEmptyGrooveData()
    data.snare[8] = 'buzz2'
    data.snare[10] = 'buzz2'
    data.snareTies = data.snare.map(() => false)
    data.snareTies[8] = true
    expect(canTieSnareToNext(data, 8)).toBe(true)
    expect(isSnareTieContinuation(data, 10)).toBe(true)
    expect(isSnareTieContinuation(data, 8)).toBe(false)
    expect(isSnareTieContinuation(data, 9)).toBe(false)
  })
})

describe('ABC tokens for snare rolls and ties', () => {
  it('emits 2-slash, stacked accent, and a tie sentinel', () => {
    const data = createEmptyGrooveData()
    data.snare[0] = 'buzz2'
    data.snare[2] = 'buzz2'
    data.snare[4] = 'buzz3'
    data.snare[6] = 'buzz'
    data.snareAccent = data.snare.map(() => false)
    data.snareTies = data.snare.map(() => false)
    data.snareAccent[0] = true
    data.snareTies[0] = true

    const { snare } = grooveDataToAbcArrays(data)
    expect(snare[0]).toBe('!accent!!//!c~')
    expect(snare[2]).toBe('!//!c')
    expect(snare[4]).toBe('!///!c')
    expect(snare[6]).toBe('!/!c')
  })
})

describe('legacy buzz migration and sustain', () => {
  it('maps unversioned buzz to the 3-slash roll', () => {
    const data = createEmptyGrooveData({ schemaVersion: 0 })
    data.schemaVersion = undefined
    data.snare[0] = 'buzz'
    data.snare[2] = 'buzz2'
    migrateLegacySnareBuzz(data)
    expect(data.snare[0]).toBe('buzz3')
    expect(data.snare[2]).toBe('buzz2')
    expect(data.schemaVersion).toBe(1)
  })

  it('leaves current-schema 1-slash buzz alone', () => {
    const data = createEmptyGrooveData()
    data.snare[0] = 'buzz'
    migrateLegacySnareBuzz(data)
    expect(data.snare[0]).toBe('buzz')
  })

  it('extends a tied buzz through the continuation note', () => {
    const data = createEmptyGrooveData()
    data.snare[8] = 'buzz2'
    data.snare[10] = 'buzz2'
    data.snare[12] = 'buzz2'
    data.snareTies = data.snare.map(() => false)
    data.snareTies[8] = true
    expect(snareSustainEndSlot(data, 8)).toBe(11)
    expect(snareSustainSeconds(data, 8, () => 0.1)).toBeCloseTo(0.4)
  })
})
