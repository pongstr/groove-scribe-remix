import type { Readable, Writable } from 'svelte/store'

declare global {
  namespace App {
    namespace Groove {
      // Core data model for Groove Editor.
      //
      // A `Groove.Data` is the single, notation- and audio-independent description of
      // a groove: time signature, subdivision, tempo/swing, and one array of
      // "slots" per instrument lane. This mirrors the original GrooveScribe
      // `grooveData` contract (see js/grooveData.js in the reference app) but swaps
      // ABC-notation token strings for typed `Articulation` unions, and drops the
      // URL-serialization concerns entirely (state now lives in memory + IndexedDB).

      type LoopMode = 'once' | 'loop'

      /** Notes-per-measure subdivisions we support. 48 ("mixed") is intentionally omitted. */
      type Division = 8 | 16 | 32 | 12 | 24

      type TimeSignature = {
        /** Top number, e.g. the "4" in 4/4. */
        beats: number
        /** Bottom number, e.g. the "4" in 4/4. Must be 2, 4, 8, or 16. */
        noteValue: 2 | 4 | 8 | 16
      }

      type StickingMode = 'off' | 'visible' | 'reverse'
      type ClickSubdivision = 0 | 4 | 8 | 16

      type HiHatArticulation =
        | 'normal'
        | 'accent'
        | 'open'
        | 'closed'
        | 'ride'
        | 'rideBell'
        | 'crash'
        | 'stacker'
        | 'cowbell'

      type SnareArticulation =
        | 'normal'
        | 'accent'
        | 'ghost'
        | 'xstick'
        | 'buzz'
        | 'buzz2'
        | 'buzz3'
        | 'flam'
        | 'drag'

      /** `kickAndSplash` plays the kick and hi-hat foot splash together. */
      type KickArticulation = 'normal' | 'splash' | 'kickAndSplash'
      type TomArticulation = 'normal'
      type StickingArticulation = 'R' | 'L' | 'both' | 'count'
      type Articulation =
        | HiHatArticulation
        | SnareArticulation
        | KickArticulation
        | TomArticulation
        | StickingArticulation

      type TomIndex = 0 | 1 | 2 | 3

      const LANE_IDS = [
        'hihat',
        'snare',
        'kick',
        'tom1',
        'tom2',
        'tom3',
        'tom4',
        'sticking',
      ] as const

      type LaneId = (typeof LANE_IDS)[number]

      /** A single grid slot: `null` is a rest, otherwise the articulation played there. */
      type Slot<A extends string = Articulation> = A | null

      type TupletKind = 'triplet' | 'sixtuplet'

      type TupletGroup = {
        id: string
        kind: TupletKind
        startSlot: number
      }

      type Data = {
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

        /** In-bar tuplet spans on a straight grid (experiment). */
        tupletGroups?: TupletGroup[]

        /** Accent overlay on snare slots whose articulation is not already accented. */
        snareAccent?: boolean[]
        /** `true` at slot i ties that snare note to the next occupied snare slot. */
        snareTies?: boolean[]

        /**
         * 1+ means `buzz` is a 1-slash roll (`buzz3` is 3-slash).
         * Absent/0 is legacy: `buzz` meant the 3-slash roll.
         */
        schemaVersion?: number
      }

      /** @deprecated Prefer `App.Groove.Data`. */
      type GrooveData = Data

      /** A saved "My Grooves" record, as stored in IndexedDB. */
      type SavedGroove = {
        id: string
        name: string
        createdAt: number
        updatedAt: number
        data: Data
      }

      /** A read-only built-in preset groove. */
      type PresetGroove = {
        id: string
        category: string
        name: string
        data: Data
      }

      type LoadProgress = {
        loaded: number
        total: number
        ready: boolean
      }

      type PlaybackState = {
        isPlaying: boolean
        loop: LoopMode
        countInEnabled: boolean
        naturalEndCount: number
        /** AudioContext time when the last slot of a once-loop groove finishes. */
        naturalEndAt: number | null
        loadProgress: LoadProgress
      }

      /** High-frequency playhead UI state — separate from the main data store. */
      type PlayheadState = {
        currentSlot: number
        isCountingIn: boolean
        countInBeat: number
      }

      type Context = {
        groove: GrooveData
        dirty: boolean
        sourceLabel: string
        playback: PlaybackState
      }

      type ContextInput = Partial<{
        groove: GrooveData
        dirty: boolean
        sourceLabel: string
        playback: Partial<PlaybackState>
      }>

      type HistoryState = {
        canUndo: boolean
        canRedo: boolean
      }

      interface ContextStore extends Writable<Context> {
        playhead: Readable<PlayheadState>
        history: Readable<HistoryState>
        notesPerMeasure: () => number
        totalSlots: () => number
        groupSize: () => number
        slotMs: () => number
        getLane: (_: LaneId) => Slot[]
        getCell: (_: LaneId, index: number) => Slot
        setCell: (lane: LaneId, index: number, value: Slot) => void
        toggleCell: (
          lane: LaneId,
          index: number,
          articulation: NonNullable<Slot>,
        ) => void
        setTupletAt: (startSlot: number, kind: TupletKind | null) => void
        toggleSnareAccent: (index: number) => void
        toggleSnareTie: (index: number) => void
        setDivision: (division: GrooveData['division']) => void
        setTimeSignature: (timeSignature: GrooveData['timeSignature']) => void
        setMeasures: (measures: number) => void
        setTempo: (tempo: number) => void
        setMetronomeSubdivision: (subdivision: 0 | 4 | 8 | 16) => void
        setSwing: (percent: number) => void
        setName: (name: string) => void
        setShowToms: (value: boolean) => void
        setShowStickings: (value: boolean) => void
        setShowLegend: (value: boolean) => void
        /** Apply display prefs without flipping dirty (used on draft restore). */
        applyDisplayPrefs: (prefs: {
          showToms: boolean
          showStickings: boolean
          showLegend: boolean
          metronomeSubdivision: 0 | 4 | 8 | 16
        }) => void
        toggleShowToms: () => void
        toggleShowStickings: () => void
        toggleShowLegend: () => void
        setKickStemsUp: (up: boolean) => void
        reverseStickings: () => void
        clearLane: (lane: LaneId) => void
        clearAll: () => void
        load: (
          data: GrooveData,
          sourceLabel: string,
          options?: { clearHistory?: boolean; keepTransport?: boolean },
        ) => void
        markSaved: (sourceLabel: string) => void
        applySavedRecord: (record: { id: string; name: string }) => void
        newGroove: () => void
        setDirty: (dirty: boolean) => void
        setSourceLabel: (label: string) => void
        setLoop: (loop: LoopMode) => void
        toggleLoop: () => void
        setCountInEnabled: (enabled: boolean) => void
        toggleCountIn: () => void
        play: (options?: {
          skipCountIn?: boolean
          startAt?: number
        }) => Promise<void>
        chainPlay: (
          data: GrooveData,
          sourceLabel: string,
          chainAt: number,
        ) => void
        pause: () => void
        stop: () => void
        togglePlay: () => Promise<void>
        seekToSlot: (slot: number) => void
        prevMeasure: () => void
        nextMeasure: () => void
        undo: () => void
        redo: () => void
        clearHistory: () => void
        restoreHistory: () => Promise<void>
        previewSample: (sample: string, gain?: number) => Promise<void>
        restoreDraft: () => Promise<boolean>
        saveDraftNow: () => Promise<void>
      }
    }
  }
}

export {}
