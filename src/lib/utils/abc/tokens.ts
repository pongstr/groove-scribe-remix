// Maps our typed articulations to the ABC tokens GrooveScribe's engraver expects.
// Token strings match `js/constants.js` in the GrooveScribe source.

import type {
  GrooveData,
  HiHatArticulation,
  KickArticulation,
  SnareArticulation,
  StickingArticulation,
  TomArticulation,
} from '../types'

/** ABC token or `false` for a rest — the shape abcNotation.js consumes. */
export type AbcSlot = string | false

const HH: Record<HiHatArticulation, string> = {
  normal: '^g',
  accent: '!accent!^g',
  open: '!open!^g',
  closed: '!plus!^g',
  ride: "^A'",
  rideBell: "^B'",
  crash: "^c'",
  stacker: "^d'",
  cowbell: "^D'",
}

const SN: Record<SnareArticulation, string> = {
  normal: 'c',
  accent: '!accent!c',
  ghost: '!(.!!).!c',
  xstick: '^c',
  buzz: '!///!c',
  flam: '!accent!{/c}c',
  drag: '{/cc}c',
}

const KI: Record<KickArticulation, string> = {
  normal: 'F',
  splash: '^d,',
  kickAndSplash: '[F^d,]',
}

const TOM: Record<TomArticulation, string> = {
  normal: 'e', // overridden per tom index below
}

const TOM_BY_INDEX = ['e', 'd', 'B', 'A'] as const

const ST: Record<StickingArticulation, string> = {
  R: '"R"x',
  L: '"L"x',
  both: '"R/L"x',
  count: '"count"x',
}

function mapLane<A extends string>(
  slots: Array<A | null>,
  table: Record<A, string>,
): AbcSlot[] {
  return slots.map((s) => (s ? table[s] : false))
}

/** Convert our GrooveData lanes into the ABC-token arrays GrooveScribe's generator expects. */
export function grooveDataToAbcArrays(data: GrooveData): {
  sticking: AbcSlot[]
  hh: AbcSlot[]
  snare: AbcSlot[]
  kick: AbcSlot[]
  toms: AbcSlot[][]
} {
  const toms = data.showToms
    ? data.toms.map((lane, i) => lane.map((s) => (s ? TOM_BY_INDEX[i] : false)))
    : data.toms.map((lane) => lane.map(() => false as const))

  return {
    sticking: data.showStickings
      ? mapLane(data.sticking, ST)
      : data.sticking.map(() => false),
    hh: mapLane(data.hiHat, HH),
    snare: mapLane(data.snare, SN),
    kick: mapLane(data.kick, KI),
    toms: toms as AbcSlot[][],
  }
}

// Keep TOM referenced so tree-shaking doesn't complain in isolation.
void TOM
