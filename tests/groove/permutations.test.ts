import { describe, expect, it } from 'vitest'

import {
  buildPermutationVariants,
  generatePracticeGroove,
} from '$lib/utils/permutations'
import { createEmptyGrooveData } from '$lib/utils/tab-notation'

describe('buildPermutationVariants', () => {
  it('builds singles/doubles/triples/all for a 4/4 16th-note groove (groupSize=4)', () => {
    const variants = buildPermutationVariants(4)
    const byCategory = (c: string) => variants.filter((v) => v.category === c)
    expect(byCategory('Ostinato')).toHaveLength(1)
    expect(byCategory('Singles')).toHaveLength(4)
    expect(byCategory('Doubles')).toHaveLength(3)
    expect(byCategory('Triples')).toHaveLength(2)
    expect(byCategory('All')).toHaveLength(1)
  })

  it('scales down variants for a smaller group size (8th notes, groupSize=2)', () => {
    const variants = buildPermutationVariants(2)
    expect(variants.filter((v) => v.category === 'Singles')).toHaveLength(2)
    expect(variants.filter((v) => v.category === 'Doubles')).toHaveLength(1)
    expect(variants.filter((v) => v.category === 'Triples')).toHaveLength(0)
  })
})

describe('generatePracticeGroove', () => {
  it('appends one measure per selected variant, preserving the ostinato in measure 1', () => {
    const base = createEmptyGrooveData({ name: 'My Beat' })
    base.hiHat = base.hiHat.map(() => 'normal')
    base.kick[0] = 'normal'

    const variants = buildPermutationVariants(4).filter(
      (v) => v.id === 'single-1' || v.id === 'single-2',
    )
    const practice = generatePracticeGroove(base, 4, variants)

    expect(practice.measures).toBe(3) // ostinato + 2 variants
    expect(practice.hiHat).toHaveLength(16 * 3)
    // ostinato measure unchanged
    expect(practice.kick.slice(0, 16)).toEqual(base.kick)
    // "singles on e" (position 1) measure: position 1,5,9,13 get a splash added
    const singleE = practice.kick.slice(16, 32)
    expect(singleE[0]).toBe('normal') // original kick hit preserved
    expect(singleE[1]).toBe('splash')
    expect(singleE[5]).toBe('splash')
    expect(singleE[9]).toBe('splash')
    expect(singleE[13]).toBe('splash')
    expect(singleE[2]).toBe(null)
  })

  it('merges a splash onto an existing kick hit as kickAndSplash', () => {
    const base = createEmptyGrooveData()
    base.kick[1] = 'normal' // already a kick hit on the "e"
    const variants = buildPermutationVariants(4).filter(
      (v) => v.id === 'single-1',
    )
    const practice = generatePracticeGroove(base, 4, variants)
    expect(practice.kick[16 + 1]).toBe('kickAndSplash')
  })

  it('produces a valid groove for a groupSize that does not evenly divide notesPerMeasure', () => {
    const base = createEmptyGrooveData({
      division: 12,
      timeSignature: { beats: 4, noteValue: 4 },
    })
    const variants = buildPermutationVariants(3)
    const practice = generatePracticeGroove(base, 3, variants)
    expect(practice.kick.length).toBe(12 * (1 + variants.length))
  })
})
