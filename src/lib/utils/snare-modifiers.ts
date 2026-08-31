// Snare-only modifiers that sit beside the per-slot articulation:
// stacked accent (any hit can be accented) and ties (this note continues
// into the next occupied snare slot). Both are optional on GrooveData so
// older saved grooves stay valid.

import { SNARE_ARTICULATIONS } from './config'

/** Sentinel appended to an ABC snare token so the engraver can emit a tie. */
export const SNARE_ABC_TIE_MARK = '~'

export function padFlagArray(
  source: boolean[] | undefined,
  length: number,
): boolean[] {
  const out = new Array<boolean>(length).fill(false)
  if (!source) return out
  const n = Math.min(source.length, length)
  for (let i = 0; i < n; i++) out[i] = Boolean(source[i])
  return out
}

export function resampleFlagArray(
  source: boolean[] | undefined,
  newLength: number,
): boolean[] {
  if (!source || source.length === 0) return new Array(newLength).fill(false)
  if (source.length === newLength) return source.slice()
  const out: boolean[] = new Array(newLength)
  for (let i = 0; i < newLength; i++) {
    const srcIndex = Math.floor((i * source.length) / newLength)
    out[i] = Boolean(source[srcIndex])
  }
  return out
}

export function ensureSnareModifiers(
  data: App.Groove.Data,
  length = data.snare.length,
): void {
  data.snareAccent = padFlagArray(data.snareAccent, length)
  data.snareTies = padFlagArray(data.snareTies, length)
}

export function nextOccupiedSnare(
  snare: App.Groove.Slot<App.Groove.SnareArticulation>[],
  index: number,
): number {
  for (let i = index + 1; i < snare.length; i++) {
    if (snare[i]) return i
  }
  return -1
}

export function previousOccupiedSnare(
  snare: App.Groove.Slot<App.Groove.SnareArticulation>[],
  index: number,
): number {
  for (let i = index - 1; i >= 0; i--) {
    if (snare[i]) return i
  }
  return -1
}

export function snareArticulationHasInherentAccent(
  art: App.Groove.SnareArticulation | null,
): boolean {
  return art === 'accent' || art === 'flam'
}

export function snareHasAccent(data: App.Groove.Data, index: number): boolean {
  const art = data.snare[index]
  if (!art) return false
  if (snareArticulationHasInherentAccent(art)) return true
  return Boolean(data.snareAccent?.[index])
}

/** True when an earlier snare note is tied into this slot (do not re-attack). */
export function isSnareTieContinuation(
  data: App.Groove.Data,
  index: number,
): boolean {
  const prev = previousOccupiedSnare(data.snare, index)
  if (prev < 0) return false
  return (
    Boolean(data.snareTies?.[prev]) &&
    nextOccupiedSnare(data.snare, prev) === index
  )
}

export function canTieSnareToNext(
  data: App.Groove.Data,
  index: number,
): boolean {
  return data.snare[index] != null && nextOccupiedSnare(data.snare, index) >= 0
}

/** Clear accent/tie on this slot, and any incoming tie from the previous note. */
export function clearSnareModifiersAt(
  data: App.Groove.Data,
  index: number,
): void {
  ensureSnareModifiers(data)
  if (data.snareAccent) data.snareAccent[index] = false
  if (data.snareTies) data.snareTies[index] = false
  const prev = previousOccupiedSnare(data.snare, index)
  if (
    prev >= 0 &&
    data.snareTies &&
    nextOccupiedSnare(data.snare, prev) === index
  ) {
    data.snareTies[prev] = false
  }
}

export function clearAllSnareModifiers(data: App.Groove.Data): void {
  const length = data.snare.length
  data.snareAccent = new Array(length).fill(false)
  data.snareTies = new Array(length).fill(false)
}

export function isSnareBuzz(art: App.Groove.SnareArticulation | null): boolean {
  return art === 'buzz' || art === 'buzz2' || art === 'buzz3'
}

/** Last grid slot covered by this note, following chained snare ties. */
export function snareSustainEndSlot(
  data: App.Groove.Data,
  index: number,
): number {
  let i = index
  for (;;) {
    const next = nextOccupiedSnare(data.snare, i)
    if (next < 0 || !data.snareTies?.[i]) {
      return next >= 0 ? next - 1 : data.snare.length - 1
    }
    i = next
  }
}

export function snareSustainSeconds(
  data: App.Groove.Data,
  index: number,
  slotSeconds: (slot: number) => number,
): number {
  const end = snareSustainEndSlot(data, index)
  let total = 0
  for (let slot = index; slot <= end; slot++) total += slotSeconds(slot)
  return total
}

/** Current schema: `buzz` = 1-slash, `buzz3` = 3-slash. */
export const GROOVE_SCHEMA_VERSION = 1

/** Map legacy `buzz` (3-slash) to `buzz3` when schemaVersion is missing or stale. */
export function migrateLegacySnareBuzz(data: App.Groove.Data): void {
  const version = data.schemaVersion ?? 0
  if (version >= GROOVE_SCHEMA_VERSION) {
    data.schemaVersion = GROOVE_SCHEMA_VERSION
    return
  }
  data.snare = data.snare.map((slot) => (slot === 'buzz' ? 'buzz3' : slot))
  data.schemaVersion = GROOVE_SCHEMA_VERSION
}

export function normalizeGrooveData(data: App.Groove.Data): App.Groove.Data {
  if (data.showLegend === undefined) data.showLegend = false
  if (data.kickStemsUp === undefined) data.kickStemsUp = true
  migrateLegacySnareBuzz(data)
  ensureSnareModifiers(data)
  return data
}

export function snarePlaybackMeta(data: App.Groove.Data, index: number) {
  const art = data.snare[index]
  if (!art) return null
  const meta = SNARE_ARTICULATIONS[art]
  if (snareHasAccent(data, index) && art === 'normal') {
    return SNARE_ARTICULATIONS.accent
  }
  if (snareHasAccent(data, index) && isSnareBuzz(art)) {
    return { ...meta, gain: SNARE_ARTICULATIONS.accent.gain }
  }
  return meta
}
