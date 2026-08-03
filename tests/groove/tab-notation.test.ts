import { describe, expect, it } from 'vitest'

import { calcNotesPerMeasure } from '$lib/utils/music-math'
import { PRESETS } from '$lib/utils/presets'
import {
  createEmptyGrooveData,
  grooveDataToTabString,
  parseGrooveTabString,
} from '$lib/utils/tab-notation'

describe('parseGrooveTabString', () => {
  it('parses a basic 16th note rock groove', () => {
    const data = parseGrooveTabString(
      'TimeSig=4/4&Div=16&Tempo=80&Measures=1&H=|xxxxxxxxxxxxxxxx|&S=|----O-------O---|&K=|o-------o-------|',
    )
    expect(data.timeSignature).toEqual({ beats: 4, noteValue: 4 })
    expect(data.division).toBe(16)
    expect(data.measures).toBe(1)
    expect(data.tempo).toBe(80)
    expect(data.hiHat).toHaveLength(16)
    expect(data.hiHat.every((s) => s === 'normal')).toBe(true)
    expect(data.snare[4]).toBe('accent')
    expect(data.snare[12]).toBe('accent')
    expect(data.snare.filter((s) => s !== null)).toHaveLength(2)
    expect(data.kick[0]).toBe('normal')
    expect(data.kick[8]).toBe('normal')
  })

  it('handles multi-measure grooves (Bossa Nova)', () => {
    const bossa = PRESETS.find((p) => p.name === 'Bossa Nova')!
    expect(bossa.data.measures).toBe(2)
    expect(
      calcNotesPerMeasure(bossa.data.division, bossa.data.timeSignature),
    ).toBe(8)
    expect(bossa.data.hiHat).toHaveLength(16)
    expect(bossa.data.kick[0]).toBe('normal')
    expect(bossa.data.kick[2]).toBe('splash')
  })

  it('parses kick+splash (uppercase X) distinctly from splash-only (lowercase x)', () => {
    const jazzShuffle = PRESETS.find((p) => p.name === 'Jazz Shuffle')!
    expect(jazzShuffle.data.kick[0]).toBe('normal')
    expect(jazzShuffle.data.kick[3]).toBe('kickAndSplash')
  })

  it('is case-insensitive for scalar keys like measures/Measures', () => {
    const data = parseGrooveTabString(
      'TimeSig=4/4&Div=8&measures=2&H=|x-x-x-x-|-x-x-x-x|&S=|--------|--------|&K=|--------|--------|',
    )
    expect(data.measures).toBe(2)
  })
})

describe('grooveDataToTabString / parseGrooveTabString round-trip', () => {
  it('round-trips an empty groove', () => {
    const original = createEmptyGrooveData()
    original.hiHat[0] = 'normal'
    original.snare[4] = 'accent'
    original.kick[0] = 'normal'
    const tab = grooveDataToTabString(original)
    const parsed = parseGrooveTabString(tab)
    expect(parsed.hiHat).toEqual(original.hiHat)
    expect(parsed.snare).toEqual(original.snare)
    expect(parsed.kick).toEqual(original.kick)
    expect(parsed.tempo).toBe(original.tempo)
    expect(parsed.division).toBe(original.division)
  })

  it('round-trips every preset groove', () => {
    for (const preset of PRESETS) {
      const tab = grooveDataToTabString(preset.data)
      const parsed = parseGrooveTabString(tab)
      expect(parsed.hiHat).toEqual(preset.data.hiHat)
      expect(parsed.snare).toEqual(preset.data.snare)
      expect(parsed.kick).toEqual(preset.data.kick)
    }
  })
})

describe('createEmptyGrooveData', () => {
  it('creates correctly-sized empty lanes for the default 4/4 16th groove', () => {
    const data = createEmptyGrooveData()
    expect(data.hiHat).toHaveLength(16)
    expect(data.snare).toHaveLength(16)
    expect(data.kick).toHaveLength(16)
    expect(data.toms).toHaveLength(4)
    expect(data.toms[0]).toHaveLength(16)
    expect(data.sticking).toHaveLength(16)
  })
})

describe('presets', () => {
  it('loads all presets without throwing and with non-empty categories', () => {
    expect(PRESETS.length).toBeGreaterThan(10)
    for (const preset of PRESETS) {
      expect(preset.data.hiHat.length).toBeGreaterThan(0)
    }
  })
})
