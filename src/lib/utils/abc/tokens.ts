// Maps our typed articulations to the ABC tokens GrooveScribe's engraver expects.
// Token strings match `js/constants.js` in the GrooveScribe source.

import {
  nextOccupiedSnare,
  SNARE_ABC_TIE_MARK,
  snareArticulationHasInherentAccent,
} from '../snare-modifiers'

/** ABC token or `false` for a rest — the shape abcNotation.js consumes. */
export type AbcSlot = string | false

const HH: Record<App.Groove.HiHatArticulation, string> = {
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

const SN: Record<App.Groove.SnareArticulation, string> = {
  normal: 'c',
  accent: '!accent!c',
  ghost: '!(.!!).!c',
  xstick: '^c',
  buzz: '!/!c',
  buzz2: '!//!c',
  buzz3: '!///!c',
  flam: '!accent!{/c}c',
  drag: '{/cc}c',
}

function composeSnareToken(
  art: App.Groove.SnareArticulation,
  accentOverlay: boolean,
  tieOut: boolean,
): string {
  let token = SN[art]
  if (accentOverlay && !snareArticulationHasInherentAccent(art)) {
    token = `!accent!${token}`
  }
  if (tieOut) token += SNARE_ABC_TIE_MARK
  return token
}

const KI: Record<App.Groove.KickArticulation, string> = {
  normal: 'F',
  splash: '^d,',
  kickAndSplash: '[F^d,]',
}

const TOM: Record<App.Groove.TomArticulation, string> = {
  normal: 'e', // overridden per tom index below
}

const TOM_BY_INDEX = ['e', 'd', 'B', 'A'] as const

const ST: Record<App.Groove.StickingArticulation, string> = {
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
export function grooveDataToAbcArrays(data: App.Groove.Data): {
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
    snare: data.snare.map((slot, i) => {
      if (!slot) return false
      const accent = Boolean(data.snareAccent?.[i])
      const tieOut =
        Boolean(data.snareTies?.[i]) && nextOccupiedSnare(data.snare, i) >= 0
      return composeSnareToken(slot, accent, tieOut)
    }),
    kick: mapLane(data.kick, KI),
    toms: toms as AbcSlot[][],
  }
}

// Keep TOM referenced so tree-shaking doesn't complain in isolation.
void TOM
