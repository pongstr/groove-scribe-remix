// Articulation catalog: for every lane, the ordered set of articulations a
// user can pick (used by the articulation context menu), plus per-articulation
// metadata (display label, single-letter tab code used by tabNotation.ts,
// sample file, playback gain, and an SVG icon id for the grid / legend).
//
// Sample gains follow the reference app's MIDI velocity ratios
// (constant_OUR_MIDI_VELOCITY_* in js/constants.js: normal 85, accent 120,
// ghost 50 out of 127) translated to a 0-1 linear gain multiplier.

import type {
  Division,
  HiHatArticulation,
  KickArticulation,
  LaneId,
  SnareArticulation,
  StickingArticulation,
  TomArticulation,
} from './types'
import type { ArticulationIconId } from '$lib/components/groove-editor/components/articulation-icons/types'

export const MAX_MEASURES = 20
export const DEFAULT_TEMPO = 80
export const MIN_TEMPO = 30
export const MAX_TEMPO = 600

export const DIVISIONS: {
  value: Division
  label: string
  group: 'straight' | 'triplet'
}[] = [
  { value: 8, label: '1/8 Notes', group: 'straight' },
  { value: 16, label: '1/16 Notes', group: 'straight' },
  { value: 32, label: '1/32 Notes', group: 'straight' },
  { value: 12, label: '1/8 Triplets', group: 'triplet' },
  { value: 24, label: '1/16 Triplets', group: 'triplet' },
]

export interface ArticulationMeta {
  label: string
  shortLabel: string
  tabCode: string
  sample: string
  gain: number
  icon: ArticulationIconId
  shortcut?: string
}

export type LaneProperty = {
  label: string
  shortLabel: string
  background: string
  color: string
  bgPrimary: string
  bgSecondary: string
}

/** Lane display metadata. `color` is a concrete hex value (not a Tailwind
 * token) so it can be used directly in inline styles without needing the
 * class to appear literally in source for Tailwind's scanner to pick up. */
export const LANE_META: Record<LaneId, LaneProperty> = {
  hihat: {
    label: 'Hi-Hat / Cymbal',
    shortLabel: 'HH',
    background: '--color-fuchsia-800',
    color: '--color-lime-300',
    bgPrimary: '--color-lime-800',
    bgSecondary: '--color-lime-400',
  },
  snare: {
    label: 'Snare',
    shortLabel: 'SN',
    background: '--color-amber-300',
    color: '--color-green-300',
    bgPrimary: '--color-green-800',
    bgSecondary: '--color-green-400',
  },
  kick: {
    label: 'Kick',
    shortLabel: 'KK',
    background: '--color-green-500',
    color: '--color-cyan-300',
    bgPrimary: '--color-cyan-800',
    bgSecondary: '--color-cyan-400',
  },
  tom1: {
    label: 'Tom 1',
    shortLabel: 'T1',
    background: '#8b5cf6',
    color: '--color-blue-300',
    bgPrimary: '--color-blue-800',
    bgSecondary: '--color-blue-400',
  },
  tom2: {
    label: 'Tom 2',
    shortLabel: 'T2',
    background: '#8b5cf6',
    color: '--color-violet-300',
    bgPrimary: '--color-violet-800',
    bgSecondary: '--color-violet-400',
  },
  tom3: {
    label: 'Floor Tom 1',
    shortLabel: 'FT1',
    background: '#8b5cf6',
    color: '--color-fuchsia-300',
    bgPrimary: '--color-fuchsia-800',
    bgSecondary: '--color-fuchsia-400',
  },
  tom4: {
    label: 'Floor Tom 2',
    shortLabel: 'FT2',
    background: '#8b5cf6',
    color: '--color-pink-300',
    bgPrimary: '--color-pink-800',
    bgSecondary: '--color-pink-400',
  },
  sticking: {
    label: 'Sticking',
    shortLabel: 'ST',
    background: '#64748b',
    color: '--color-white',
    bgPrimary: '',
    bgSecondary: '',
  },
}

export const HIHAT_ARTICULATIONS: Record<HiHatArticulation, ArticulationMeta> =
  {
    normal: {
      label: 'Normal',
      shortLabel: 'x',
      tabCode: 'x',
      sample: 'hihat-normal',
      gain: 0.67,
      icon: 'notehead-x',
    },
    accent: {
      label: 'Accent',
      shortLabel: 'X',
      tabCode: 'X',
      sample: 'hihat-accent',
      gain: 0.95,
      icon: 'notehead-x',
      shortcut: 'Shift',
    },
    open: {
      label: 'Open',
      shortLabel: 'open',
      tabCode: 'o',
      sample: 'hihat-open',
      gain: 0.8,
      icon: 'notehead-circle-open',
    },
    closed: {
      label: 'Closed (foot)',
      shortLabel: '+',
      tabCode: '+',
      sample: 'hihat-foot',
      gain: 0.6,
      icon: 'notehead-plus',
    },
    ride: {
      label: 'Ride',
      shortLabel: 'ride',
      tabCode: 'r',
      sample: 'ride-normal',
      gain: 0.75,
      icon: 'notehead-x',
    },
    rideBell: {
      label: 'Ride Bell',
      shortLabel: 'bell',
      tabCode: 'b',
      sample: 'bell',
      gain: 0.85,
      icon: 'notehead-diamond',
    },
    crash: {
      label: 'Crash',
      shortLabel: 'crash',
      tabCode: 'c',
      sample: 'crash',
      gain: 0.9,
      icon: 'notehead-triangle',
    },
    stacker: {
      label: 'Stacker',
      shortLabel: 'stack',
      tabCode: 's',
      sample: 'hihat-stacker',
      gain: 0.85,
      icon: 'notehead-diamond',
    },
    cowbell: {
      label: 'Cowbell',
      shortLabel: 'bell',
      tabCode: 'm',
      sample: 'cowbell',
      gain: 0.85,
      icon: 'notehead-diamond',
    },
  }

export const SNARE_ARTICULATIONS: Record<SnareArticulation, ArticulationMeta> =
  {
    normal: {
      label: 'Normal',
      shortLabel: 'o',
      tabCode: 'o',
      sample: 'snare-normal',
      gain: 0.67,
      icon: 'notehead-circle',
    },
    accent: {
      label: 'Accent',
      shortLabel: 'O',
      tabCode: 'O',
      sample: 'snare-accent',
      gain: 0.95,
      icon: 'notehead-circle',
      shortcut: 'Shift',
    },
    ghost: {
      label: 'Ghost',
      shortLabel: 'g',
      tabCode: 'g',
      sample: 'snare-ghost',
      gain: 0.35,
      icon: 'notehead-circle-ghost',
      shortcut: 'Alt',
    },
    xstick: {
      label: 'Cross Stick',
      shortLabel: 'x',
      tabCode: 'x',
      sample: 'snare-crossstick',
      gain: 0.7,
      icon: 'notehead-cross',
    },
    buzz: {
      label: 'Buzz',
      shortLabel: 'buzz',
      tabCode: 'b',
      sample: 'snare-buzz',
      gain: 0.7,
      icon: 'notehead-buzz',
    },
    flam: {
      label: 'Flam',
      shortLabel: 'flam',
      tabCode: 'f',
      sample: 'snare-flam',
      gain: 0.85,
      icon: 'notehead-flam',
    },
    drag: {
      label: 'Drag',
      shortLabel: 'drag',
      tabCode: 'd',
      sample: 'snare-drag',
      gain: 0.85,
      icon: 'notehead-drag',
    },
  }

export const KICK_ARTICULATIONS: Record<KickArticulation, ArticulationMeta> = {
  normal: {
    label: 'Normal',
    shortLabel: 'o',
    tabCode: 'o',
    sample: 'kick-normal',
    gain: 0.85,
    icon: 'notehead-circle',
  },
  splash: {
    label: 'Hi-Hat Splash',
    shortLabel: 'x',
    tabCode: 'x',
    sample: 'hihat-foot',
    gain: 0.6,
    icon: 'notehead-cross',
  },
  kickAndSplash: {
    label: 'Kick + Splash',
    shortLabel: 'X',
    tabCode: 'X',
    sample: 'kick-normal',
    gain: 0.85,
    icon: 'notehead-circle-x',
    shortcut: 'Shift',
  },
}

export const TOM_ARTICULATIONS: Record<TomArticulation, ArticulationMeta> = {
  normal: {
    label: 'Normal',
    shortLabel: 'o',
    tabCode: 'o',
    sample: 'tom-rack',
    gain: 0.8,
    icon: 'notehead-circle',
  },
}

/** Distinct sample per tom lane (index 0 = highest pitched, 3 = lowest). */
export const TOM_SAMPLES = [
  'tom-10',
  'tom-rack',
  'tom-floor',
  'tom-16',
] as const

export const STICKING_ARTICULATIONS: Record<
  StickingArticulation,
  ArticulationMeta
> = {
  R: {
    label: 'Right',
    shortLabel: 'R',
    tabCode: 'R',
    sample: '',
    gain: 0,
    icon: 'sticking-r',
  },
  L: {
    label: 'Left',
    shortLabel: 'L',
    tabCode: 'L',
    sample: '',
    gain: 0,
    icon: 'sticking-l',
  },
  both: {
    label: 'Both',
    shortLabel: 'R/L',
    tabCode: 'B',
    sample: '',
    gain: 0,
    icon: 'sticking-both',
  },
  count: {
    label: 'Count',
    shortLabel: '#',
    tabCode: 'c',
    sample: '',
    gain: 0,
    icon: 'sticking-count',
  },
}

// Per-lane articulation lookup used by the grid UI: the ordered set of
// articulations offered in the popover (order = display order, first entry
// is the "tap" default), plus fast access to metadata by lane + articulation id.

export const LANE_ARTICULATION_ORDER: Record<LaneId, string[]> = {
  hihat: [
    'normal',
    'accent',
    'open',
    'closed',
    'ride',
    'rideBell',
    'crash',
    'stacker',
    'cowbell',
  ],
  snare: ['normal', 'accent', 'ghost', 'xstick', 'flam', 'drag', 'buzz'],
  kick: ['normal', 'kickAndSplash', 'splash'],
  tom1: ['normal'],
  tom2: ['normal'],
  tom3: ['normal'],
  tom4: ['normal'],
  sticking: ['R', 'L', 'both', 'count'],
}

export const LANE_ARTICULATION_META: Record<
  LaneId,
  Record<string, ArticulationMeta>
> = {
  hihat: HIHAT_ARTICULATIONS,
  snare: SNARE_ARTICULATIONS,
  kick: KICK_ARTICULATIONS,
  tom1: TOM_ARTICULATIONS,
  tom2: TOM_ARTICULATIONS,
  tom3: TOM_ARTICULATIONS,
  tom4: TOM_ARTICULATIONS,
  sticking: STICKING_ARTICULATIONS,
}

export const LANE_DEFAULT_ARTICULATION: Record<LaneId, string> = {
  hihat: 'normal',
  snare: 'normal',
  kick: 'normal',
  tom1: 'normal',
  tom2: 'normal',
  tom3: 'normal',
  tom4: 'normal',
  sticking: 'R',
}

/** Articulation triggered by Shift-click, if the lane has one (fast accenting). */
export const LANE_SHIFT_ARTICULATION: Partial<Record<LaneId, string>> = {
  hihat: 'accent',
  snare: 'accent',
  kick: 'kickAndSplash',
}

/** Articulation triggered by Alt-click, if the lane has one (fast ghosting). */
export const LANE_ALT_ARTICULATION: Partial<Record<LaneId, string>> = {
  snare: 'ghost',
  hihat: 'open',
}

export const METRONOME_SAMPLE = 'metronome-click'
export const METRONOME_ACCENT_SAMPLE = 'metronome-count'

/** Spoken count-in samples for beats 1–4 (from GrooveScribe drum kit). */
export const COUNT_IN_SAMPLES = [
  'count-1',
  'count-2',
  'count-3',
  'count-4',
] as const

export const AUDIO_BASE_PATH = '/groove/audio'

/** Every distinct sample filename (without extension) the app can play, for preloading. */
export const ALL_SAMPLE_NAMES: string[] = [
  ...new Set(
    [
      ...Object.values(HIHAT_ARTICULATIONS).map((m) => m.sample),
      ...Object.values(SNARE_ARTICULATIONS).map((m) => m.sample),
      ...Object.values(KICK_ARTICULATIONS).map((m) => m.sample),
      ...TOM_SAMPLES,
      METRONOME_SAMPLE,
      METRONOME_ACCENT_SAMPLE,
      ...COUNT_IN_SAMPLES,
    ].filter((name) => name.length > 0),
  ),
]
