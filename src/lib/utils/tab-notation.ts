// Compact "drum tab" notation: parse/serialize lanes as strings of single
// characters (one per grid slot), and a full groove as a small
// `Key=value&Key=value` query-string-like format.
//
// This is the same convention the reference GrooveScribe app used for its
// built-in preset library and its (now-removed) URL-based sharing, e.g.
// `TimeSig=4/4&Div=16&Tempo=80&Measures=1&H=|xxxxxxxxxxxxxxxx|&S=|----O---|`.
// We reuse the format (not the original's DOM-coupled parsing code) so the
// preset library data can be transcribed close to verbatim, and so users have
// a plain-text way to paste/export a groove.

import {
  DEFAULT_TEMPO,
  HIHAT_ARTICULATIONS,
  KICK_ARTICULATIONS,
  SNARE_ARTICULATIONS,
  STICKING_ARTICULATIONS,
  TOM_ARTICULATIONS,
} from './config'
import { calcNotesPerMeasure } from './music-math'
import type {
  Division,
  GrooveData,
  HiHatArticulation,
  KickArticulation,
  Slot,
  SnareArticulation,
  StickingArticulation,
  TomArticulation,
} from './types'

type LaneKey = 'H' | 'S' | 'K' | 'T1' | 'T2' | 'T3' | 'T4' | 'St'

function buildReverseMap<A extends string>(
  meta: Record<A, { tabCode: string }>,
): ReadonlyMap<string, A> {
  const map = new Map<string, A>()
  for (const key in meta) {
    map.set(meta[key as A].tabCode, key as A)
  }
  return map
}

const HH_MAP = buildReverseMap(HIHAT_ARTICULATIONS)
const SN_MAP = buildReverseMap(SNARE_ARTICULATIONS)
const KI_MAP = buildReverseMap(KICK_ARTICULATIONS)
const TOM_MAP = buildReverseMap(TOM_ARTICULATIONS)
const ST_MAP = buildReverseMap(STICKING_ARTICULATIONS)

function mapForLane(laneKey: LaneKey): ReadonlyMap<string, string> {
  switch (laneKey) {
    case 'H':
      return HH_MAP
    case 'S':
      return SN_MAP
    case 'K':
      return KI_MAP
    case 'T1':
    case 'T2':
    case 'T3':
    case 'T4':
      return TOM_MAP
    case 'St':
      return ST_MAP
  }
}

const REST_CHARS = new Set(['-', '', undefined])

/** Strip markup punctuation (barlines, repeats, ties) that may appear in a tab string. */
function stripMarkup(tab: string): string {
  return tab.replace(/[|:!()[\]]/g, '')
}

/**
 * Parse a lane's tab characters into an array of slots. `chars` should
 * already have barline/markup punctuation stripped. Extra/missing characters
 * are padded or truncated to `length`.
 */
export function parseLane<A extends string>(
  laneKey: LaneKey,
  chars: string,
  length: number,
): Slot<A>[] {
  const map = mapForLane(laneKey)
  const out: Slot<A>[] = new Array(length).fill(null)
  for (let i = 0; i < length; i++) {
    const ch = chars[i]
    if (ch === undefined || REST_CHARS.has(ch)) continue
    const articulation = map.get(ch)
    if (articulation !== undefined) out[i] = articulation as A
  }
  return out
}

export function serializeLane<A extends string>(
  slots: Slot<A>[],
  meta: Record<A, { tabCode: string }>,
): string {
  return slots
    .map((slot) => (slot === null ? '-' : meta[slot].tabCode))
    .join('')
}

export function laneToTabString<A extends string>(
  slots: Slot<A>[],
  measures: number,
  notesPerMeasure: number,
  meta: Record<A, { tabCode: string }>,
): string {
  let out = ''
  for (let m = 0; m < measures; m++) {
    out +=
      '|' +
      serializeLane(
        slots.slice(m * notesPerMeasure, (m + 1) * notesPerMeasure),
        meta,
      )
  }
  return out + '|'
}

/** A fresh groove: 1 measure of 4/4 16th notes, no notes. */
export function createEmptyGrooveData(
  overrides: Partial<GrooveData> = {},
): GrooveData {
  const division: Division = overrides.division ?? 16
  const timeSignature = overrides.timeSignature ?? { beats: 4, noteValue: 4 }
  const measures = overrides.measures ?? 1
  const notesPerMeasure = calcNotesPerMeasure(division, timeSignature)
  const length = notesPerMeasure * measures

  return {
    id: null,
    name: '',
    author: '',
    comments: '',
    timeSignature,
    division,
    measures,
    tempo: DEFAULT_TEMPO,
    swingPercent: 0,
    metronomeSubdivision: 0,
    showToms: false,
    showStickings: false,
    showLegend: false,
    kickStemsUp: true,
    hiHat: new Array(length).fill(null),
    snare: new Array(length).fill(null),
    kick: new Array(length).fill(null),
    toms: [
      new Array(length).fill(null),
      new Array(length).fill(null),
      new Array(length).fill(null),
      new Array(length).fill(null),
    ],
    sticking: new Array(length).fill(null),
    tupletGroups: [],
    ...overrides,
  }
}

/**
 * Parse the compact `Key=value&Key=value` groove format used by the preset
 * library and by JSON-free text import/export.
 */
export function parseGrooveTabString(input: string): GrooveData {
  const qs = input.trim().replace(/^\?/, '')
  const rawParams = new Map<string, string>()
  for (const pair of qs.split('&')) {
    if (!pair) continue
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    const key = pair.slice(0, idx)
    const value = decodeURIComponent(pair.slice(idx + 1))
    rawParams.set(key, value)
  }
  // Lane keys (H/S/K/T1..T4/Stickings) are case-sensitive; the scalar option
  // keys (TimeSig, Measures, Tempo, ...) appear with inconsistent casing in
  // the ported preset data (e.g. "measures=1"), so look those up case-insensitively.
  const params = {
    get(key: string) {
      if (rawParams.has(key)) return rawParams.get(key)
      const lower = key.toLowerCase()
      for (const [k, v] of rawParams) if (k.toLowerCase() === lower) return v
      return undefined
    },
    has(key: string) {
      return params.get(key) !== undefined
    },
  }

  const timeSigStr = params.get('TimeSig') ?? '4/4'
  const [beatsStr, noteValueStr] = timeSigStr.split('/')
  const beats = Number.parseInt(beatsStr, 10) || 4
  const noteValueRaw = Number.parseInt(noteValueStr, 10)
  const noteValue = ([2, 4, 8, 16] as const).includes(noteValueRaw as never)
    ? (noteValueRaw as 2 | 4 | 8 | 16)
    : 4
  const timeSignature = { beats, noteValue }

  const divisionRaw = Number.parseInt(params.get('Div') ?? '16', 10)
  const division = ([8, 16, 32, 12, 24] as const).includes(divisionRaw as never)
    ? (divisionRaw as Division)
    : 16

  const measures = Math.max(
    1,
    Number.parseInt(params.get('Measures') ?? '1', 10) || 1,
  )
  const tempo =
    Number.parseInt(params.get('Tempo') ?? String(DEFAULT_TEMPO), 10) ||
    DEFAULT_TEMPO
  const swingPercent = Number.parseInt(params.get('Swing') ?? '0', 10) || 0

  const notesPerMeasure = calcNotesPerMeasure(division, timeSignature)
  const length = notesPerMeasure * measures

  const laneChars = (key: string) => stripMarkup(params.get(key) ?? '')

  return {
    id: null,
    name: params.get('Title') ?? '',
    author: params.get('Author') ?? '',
    comments: params.get('Comments') ?? '',
    timeSignature,
    division,
    measures,
    tempo,
    swingPercent,
    metronomeSubdivision: 0,
    showToms: ['T1', 'T2', 'T3', 'T4'].some((k) => params.has(k)),
    showStickings: params.has('Stickings'),
    showLegend: false,
    kickStemsUp: true,
    hiHat: parseLane<HiHatArticulation>('H', laneChars('H'), length),
    snare: parseLane<SnareArticulation>('S', laneChars('S'), length),
    kick: parseLane<KickArticulation>('K', laneChars('K'), length),
    toms: [
      parseLane<TomArticulation>('T1', laneChars('T1'), length),
      parseLane<TomArticulation>('T2', laneChars('T2'), length),
      parseLane<TomArticulation>('T3', laneChars('T3'), length),
      parseLane<TomArticulation>('T4', laneChars('T4'), length),
    ],
    sticking: parseLane<StickingArticulation>(
      'St',
      laneChars('Stickings'),
      length,
    ),
  }
}

export function grooveDataToTabString(data: GrooveData): string {
  const notesPerMeasure = calcNotesPerMeasure(data.division, data.timeSignature)
  const parts: string[] = [
    `TimeSig=${data.timeSignature.beats}/${data.timeSignature.noteValue}`,
    `Div=${data.division}`,
    `Tempo=${data.tempo}`,
    `Measures=${data.measures}`,
    `Swing=${data.swingPercent}`,
  ]
  if (data.name) parts.push(`Title=${encodeURIComponent(data.name)}`)
  if (data.author) parts.push(`Author=${encodeURIComponent(data.author)}`)
  parts.push(
    `H=${laneToTabString(data.hiHat, data.measures, notesPerMeasure, HIHAT_ARTICULATIONS)}`,
  )
  parts.push(
    `S=${laneToTabString(data.snare, data.measures, notesPerMeasure, SNARE_ARTICULATIONS)}`,
  )
  parts.push(
    `K=${laneToTabString(data.kick, data.measures, notesPerMeasure, KICK_ARTICULATIONS)}`,
  )
  if (data.showToms) {
    const toms = ['T1', 'T2', 'T3', 'T4'] as const
    data.toms.forEach((tom, i) => {
      parts.push(
        `${toms[i]}=${laneToTabString(tom, data.measures, notesPerMeasure, TOM_ARTICULATIONS)}`,
      )
    })
  }
  if (data.showStickings) {
    parts.push(
      `Stickings=${laneToTabString(data.sticking, data.measures, notesPerMeasure, STICKING_ARTICULATIONS)}`,
    )
  }
  return parts.join('&')
}
