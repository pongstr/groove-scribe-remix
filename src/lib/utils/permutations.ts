// Permutation "practice mode": generates a longer practice groove that
// appends one extra measure per selected variant, each adding kick hits at a
// specific subdivision (or combination of subdivisions) within every beat,
// layered on top of the user's existing pattern - the same practice idea as
// the reference app's `js/permutations.js` (singles/doubles/triples/all on
// each 16th-note position), but re-implemented generically against our
// `groupSize` (works for any division/time signature) instead of a
// hardcoded 32-slot canonical array, and produces a normal `GrooveData` that
// plays back through the exact same transport/notation/grid the rest of the
// app already has.

import { calcNotesPerMeasure } from './music-math'
import type { GrooveData, KickArticulation, Slot } from './types'

export interface PermutationVariant {
  id: string
  label: string
  category: 'Ostinato' | 'Singles' | 'Doubles' | 'Triples' | 'All'
  /** 0-based subdivision positions (within a single beat) that get an extra kick. */
  positions: number[]
}

const NAMED_POSITIONS: Record<number, string[]> = {
  1: ['1'],
  2: ['1', '&'],
  3: ['1', '&', 'a'],
  4: ['1', 'e', '&', 'a'],
  6: ['1', 'ta', 'ke', '&', 'ta', 'ke'],
  8: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
}

function positionName(groupSize: number, index: number): string {
  return NAMED_POSITIONS[groupSize]?.[index] ?? `#${index + 1}`
}

function positionsLabel(groupSize: number, positions: number[]): string {
  return positions.map((p) => `"${positionName(groupSize, p)}"`).join(' + ')
}

/** Build the list of practice variants available for the given beat-grouping size. */
export function buildPermutationVariants(
  groupSize: number,
): PermutationVariant[] {
  const variants: PermutationVariant[] = [
    {
      id: 'ostinato',
      label: 'Ostinato only (no fills)',
      category: 'Ostinato',
      positions: [],
    },
  ]

  for (let k = 0; k < groupSize; k++) {
    variants.push({
      id: `single-${k}`,
      label: `Singles on ${positionsLabel(groupSize, [k])}`,
      category: 'Singles',
      positions: [k],
    })
  }
  for (let k = 0; k < groupSize - 1; k++) {
    variants.push({
      id: `double-${k}`,
      label: `Doubles on ${positionsLabel(groupSize, [k, k + 1])}`,
      category: 'Doubles',
      positions: [k, k + 1],
    })
  }
  for (let k = 0; k < groupSize - 2; k++) {
    variants.push({
      id: `triple-${k}`,
      label: `Triples on ${positionsLabel(groupSize, [k, k + 1, k + 2])}`,
      category: 'Triples',
      positions: [k, k + 1, k + 2],
    })
  }
  if (groupSize > 1) {
    variants.push({
      id: 'all',
      label: 'All subdivisions',
      category: 'All',
      positions: Array.from({ length: groupSize }, (_, i) => i),
    })
  }
  return variants
}

function sliceLane<A extends string>(
  lane: Slot<A>[],
  length: number,
): Slot<A>[] {
  const out = lane.slice(0, length)
  while (out.length < length) out.push(null)
  return out
}

function addSplashToKick(
  existing: Slot<KickArticulation>,
): Slot<KickArticulation> {
  return existing === 'normal' || existing === 'kickAndSplash'
    ? 'kickAndSplash'
    : 'splash'
}

/**
 * Build a practice groove: the base pattern's first measure as an "ostinato",
 * followed by one measure per selected variant with extra kick hits added at
 * that variant's beat positions.
 */
export function generatePracticeGroove(
  base: GrooveData,
  groupSize: number,
  variants: PermutationVariant[],
): GrooveData {
  const notesPerMeasure = calcNotesPerMeasure(base.division, base.timeSignature)
  const beatsPerMeasure = Math.max(1, Math.round(notesPerMeasure / groupSize))

  const baseHiHat = sliceLane(base.hiHat, notesPerMeasure)
  const baseSnare = sliceLane(base.snare, notesPerMeasure)
  const baseKick = sliceLane(base.kick, notesPerMeasure)
  const baseToms = base.toms.map((t) =>
    sliceLane(t, notesPerMeasure),
  ) as GrooveData['toms']
  const baseSticking = sliceLane(base.sticking, notesPerMeasure)

  const hiHat = [...baseHiHat]
  const snare = [...baseSnare]
  const kick = [...baseKick]
  const toms = baseToms.map((t) => [...t]) as GrooveData['toms']
  const sticking = [...baseSticking]

  for (const variant of variants) {
    hiHat.push(...baseHiHat)
    snare.push(...baseSnare)
    toms.forEach((t, i) => t.push(...baseToms[i]))
    sticking.push(...baseSticking)

    const variantKick = [...baseKick]
    if (variant.positions.length > 0) {
      for (let beat = 0; beat < beatsPerMeasure; beat++) {
        for (const pos of variant.positions) {
          const idx = beat * groupSize + pos
          if (idx >= notesPerMeasure) continue
          variantKick[idx] = addSplashToKick(variantKick[idx])
        }
      }
    }
    kick.push(...variantKick)
  }

  return {
    ...base,
    id: null,
    name: `${base.name || 'Groove'} \u2013 Practice`,
    measures: 1 + variants.length,
    hiHat,
    snare,
    kick,
    toms,
    sticking,
  }
}
