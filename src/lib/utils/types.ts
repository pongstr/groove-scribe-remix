// Core data model for Groove Studio.
//
// A `GrooveData` is the single, notation- and audio-independent description of
// a groove: time signature, subdivision, tempo/swing, and one array of
// "slots" per instrument lane. This mirrors the original GrooveScribe
// `grooveData` contract (see js/grooveData.js in the reference app) but swaps
// ABC-notation token strings for typed `Articulation` unions, and drops the
// URL-serialization concerns entirely (state now lives in memory + IndexedDB).

/** Notes-per-measure subdivisions we support. 48 ("mixed") is intentionally omitted. */
export type Division = 8 | 16 | 32 | 12 | 24

export interface TimeSignature {
  /** Top number, e.g. the "4" in 4/4. */
  beats: number
  /** Bottom number, e.g. the "4" in 4/4. Must be 2, 4, 8, or 16. */
  noteValue: 2 | 4 | 8 | 16
}

export type HiHatArticulation =
  | 'normal'
  | 'accent'
  | 'open'
  | 'closed'
  | 'ride'
  | 'rideBell'
  | 'crash'
  | 'stacker'
  | 'cowbell'

export type SnareArticulation =
  'normal' | 'accent' | 'ghost' | 'xstick' | 'buzz' | 'flam' | 'drag'

/** `kickAndSplash` plays the kick and hi-hat foot splash together. */
export type KickArticulation = 'normal' | 'splash' | 'kickAndSplash'

export type TomArticulation = 'normal'

export type StickingArticulation = 'R' | 'L' | 'both' | 'count'

export type Articulation =
  | HiHatArticulation
  | SnareArticulation
  | KickArticulation
  | TomArticulation
  | StickingArticulation

export type TomIndex = 0 | 1 | 2 | 3

export const LANE_IDS = [
  'hihat',
  'snare',
  'kick',
  'tom1',
  'tom2',
  'tom3',
  'tom4',
  'sticking',
] as const
export type LaneId = (typeof LANE_IDS)[number]

/** A single grid slot: `null` is a rest, otherwise the articulation played there. */
export type Slot<A extends string = Articulation> = A | null

export interface GrooveData {
  /** IndexedDB key when this groove was loaded from / saved to "My Grooves"; `null` otherwise. */
  id: string | null
  name: string
  author: string
  comments: string

  timeSignature: TimeSignature
  division: Division
  measures: number

  tempo: number
  swingPercent: number
  metronomeSubdivision: 0 | 4 | 8 | 16

  showToms: boolean
  showStickings: boolean
  /** When true, abc2svg prepends the full drum-notation key (GrooveScribe's "legend"). */
  showLegend: boolean
  /** Kick stems drawn up into the hands staff (GrooveScribe default). */
  kickStemsUp: boolean

  hiHat: Slot<HiHatArticulation>[]
  snare: Slot<SnareArticulation>[]
  kick: Slot<KickArticulation>[]
  toms: [
    Slot<TomArticulation>[],
    Slot<TomArticulation>[],
    Slot<TomArticulation>[],
    Slot<TomArticulation>[],
  ]
  sticking: Slot<StickingArticulation>[]
}

/** A saved "My Grooves" record, as stored in IndexedDB. */
export interface SavedGroove {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  data: GrooveData
}

/** A read-only built-in preset groove. */
export interface PresetGroove {
  id: string
  category: string
  name: string
  data: GrooveData
}
