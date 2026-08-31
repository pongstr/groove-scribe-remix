// Time-signature / subdivision math. Adapted from the reference GrooveScribe
// app's `js/musicMath.js` (pure functions, GPL v2) to typed TypeScript for a
// fixed set of divisions (8, 16, 32, 12, 24).

export function isTripletDivision(division: App.Groove.Division): boolean {
  return division % 12 === 0
}

/** How many grid slots make up one measure at this division / time signature. */
export function calcNotesPerMeasure(
  division: App.Groove.Division,
  timeSig: App.Groove.TimeSignature,
): number {
  return (division / timeSig.noteValue) * timeSig.beats
}

/**
 * How many slots should be visually grouped (and beamed) together, e.g. 4 for
 * a 4/4 16th-note groove (one group per quarter-note beat).
 */
export function noteGroupingSize(
  notesPerMeasure: number,
  timeSig: App.Groove.TimeSignature,
): number {
  const { beats, noteValue } = timeSig
  const division = (notesPerMeasure / beats) * noteValue

  if (isTripletDivision(division as App.Groove.Division)) {
    return notesPerMeasure / (beats * (4 / noteValue))
  } else if (beats === 3) {
    return notesPerMeasure / 3
  } else if (beats % 6 === 0 && noteValue % 8 === 0) {
    return notesPerMeasure / ((2 * beats) / 6)
  }
  return (notesPerMeasure / beats) * (noteValue / 4)
}

/**
 * Whether `index` falls on an "upbeat" subdivision that swing should delay.
 * Swing quantization always shifts every other slot at the finest
 * resolution - the '&' in an 8th-note grid, or the 'e' and 'a' in a 16th-note
 * grid (both odd-indexed) - so the rule is simply "odd index" for any
 * straight division. Triplet divisions are never swung.
 */
export function isUpbeatSlot(
  division: App.Groove.Division,
  index: number,
): boolean {
  if (isTripletDivision(division)) return false
  return index % 2 === 1
}

/**
 * Seconds to delay an upbeat slot by, for a given swing percentage. 100%
 * swing produces the classic 2:1 triplet shuffle feel (the upbeat moves from
 * the midpoint of its eighth-note pulse to the two-thirds point).
 */
export function swingDelaySeconds(
  slotSeconds: number,
  swingPercent: number,
): number {
  return slotSeconds * (swingPercent / 100) * (1 / 3)
}

/**
 * Duration of a single grid slot, in milliseconds, at the given tempo.
 * Tempo is always quarter-note BPM; `division` already expresses how many
 * slots fit in a quarter note (division / 4, for both straight and triplet
 * divisions - e.g. 12 = eighth-note triplets = 3 slots/quarter note), so the
 * time signature's bottom number does not affect slot duration, only where
 * barlines fall (see `calcNotesPerMeasure`).
 */
export function slotDurationMs(
  division: App.Groove.Division,
  tempo: number,
): number {
  const quarterNoteMs = 60000 / tempo
  return (quarterNoteMs * 4) / division
}

const HALF = '\u{1D15E}'
const QUARTER = '\u2669'
const DOTTED_QUARTER = `${QUARTER}.`
const EIGHTH = '\u266A'
const SIXTEENTH = '\u266C'

export interface TempoMarking {
  /** Note glyph used in tempo markings, e.g. ♩ or ♩. */
  symbol: string
  /** Human-readable beat unit name. */
  label: string
}

/**
 * Typical tempo-marking beat unit for a time signature (felt beat, not just
 * the denominator). The BPM number itself is unchanged — callers still use
 * quarter-note tempo; only the displayed symbol/label varies.
 */
export function tempoMarkingForTimeSignature(
  timeSig: App.Groove.TimeSignature,
): TempoMarking {
  const { beats, noteValue } = timeSig

  if (noteValue === 2) {
    return { symbol: HALF, label: 'half' }
  }
  if (noteValue === 8 && beats % 3 === 0) {
    return { symbol: DOTTED_QUARTER, label: 'dotted quarter' }
  }
  if (noteValue === 8) {
    return { symbol: EIGHTH, label: 'eighth' }
  }
  if (noteValue === 16) {
    return { symbol: SIXTEENTH, label: 'sixteenth' }
  }
  return { symbol: QUARTER, label: 'quarter' }
}
