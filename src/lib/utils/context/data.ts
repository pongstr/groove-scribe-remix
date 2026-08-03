import { getContext, setContext } from 'svelte'
import { get, type Readable, writable } from 'svelte/store'

import { createScheduler } from '../audio/scheduler'
import { MAX_MEASURES, MAX_TEMPO, MIN_TEMPO } from '../config'
import { lanes, resampleArray } from '../groove-lanes'
import {
  cloneGroove,
  emptyHistory,
  type HistoryStacks,
  pushHistory,
  redoHistory,
  undoHistory,
} from '../history'
import {
  calcNotesPerMeasure,
  noteGroupingSize,
  slotDurationMs,
} from '../music-math'
import * as db from '../storage/db'
import { createEmptyGrooveData } from '../tab-notation'
import type {
  Division,
  GrooveData,
  LaneId,
  Slot,
  TimeSignature,
} from '../types'
import type { App, LoopMode } from './types'

export const DATA_CONTEXT = 'app.data'

const HISTORY_PERSIST_MS = 250

const INITIAL_PLAYHEAD: App.Data.PlayheadState = {
  currentSlot: -1,
  isCountingIn: false,
  countInBeat: 0,
}

function initDataContext(init: App.Data.ContextInput = {}): App.Data.Context {
  return {
    groove: init.groove ?? createEmptyGrooveData(),
    dirty: init.dirty ?? false,
    sourceLabel: init.sourceLabel ?? 'Untitled Groove',
    playback: {
      isPlaying: false,
      loop: 'loop',
      countInEnabled: true,
      naturalEndCount: 0,
      loadProgress: { loaded: 0, total: 0, ready: false },
      ...init.playback,
    },
  }
}

export function createDataContextStore(
  init: App.Data.ContextInput = {},
): App.Data.ContextStore {
  const { subscribe, set, update } = writable<App.Data.Context>(
    initDataContext(init),
  )
  const playheadStore = writable<App.Data.PlayheadState>({
    ...INITIAL_PLAYHEAD,
  })
  const historyUiStore = writable<App.Data.HistoryState>({
    canUndo: false,
    canRedo: false,
  })

  let historyStacks: HistoryStacks = emptyHistory()
  let historyPersistTimer: ReturnType<typeof setTimeout> | null = null
  let draftPendingWhilePlaying = false
  /** When true, groove updates must not push a new history entry (undo/redo/load). */
  let suppressHistory = false

  function playheadSnapshot(): App.Data.PlayheadState {
    return get(playheadStore)
  }

  function snapshot(): App.Data.Context {
    return get({ subscribe })
  }

  function syncHistoryUi(): void {
    historyUiStore.set({
      canUndo: historyStacks.past.length > 0,
      canRedo: historyStacks.future.length > 0,
    })
  }

  function persistHistorySoon(): void {
    if (historyPersistTimer) clearTimeout(historyPersistTimer)
    historyPersistTimer = setTimeout(() => {
      historyPersistTimer = null
      void db.saveHistory(historyStacks.past, historyStacks.future)
    }, HISTORY_PERSIST_MS)
  }

  function persistHistoryNow(): void {
    if (historyPersistTimer) {
      clearTimeout(historyPersistTimer)
      historyPersistTimer = null
    }
    void db.saveHistory(historyStacks.past, historyStacks.future)
  }

  function recordHistoryBeforeMutation(): void {
    if (suppressHistory) return
    historyStacks = pushHistory(historyStacks, snapshot().groove)
    syncHistoryUi()
    persistHistorySoon()
  }

  function resetHistory(): void {
    historyStacks = emptyHistory()
    syncHistoryUi()
    persistHistoryNow()
  }

  function patchPlayback(partial: Partial<App.Data.PlaybackState>): void {
    update((store) => ({
      ...store,
      playback: { ...store.playback, ...partial },
    }))
  }

  function patchPlayhead(partial: Partial<App.Data.PlayheadState>): void {
    playheadStore.update((state) => ({ ...state, ...partial }))
  }

  function notesPerMeasure(): number {
    const { groove } = snapshot()
    return calcNotesPerMeasure(groove.division, groove.timeSignature)
  }

  function totalSlots(): number {
    return notesPerMeasure() * snapshot().groove.measures
  }

  function groupSize(): number {
    const { groove } = snapshot()
    const npm = calcNotesPerMeasure(groove.division, groove.timeSignature)
    return Math.max(1, Math.round(noteGroupingSize(npm, groove.timeSignature)))
  }

  function slotMs(): number {
    const { groove } = snapshot()
    return slotDurationMs(groove.division, groove.tempo)
  }

  function getLane(lane: LaneId): Slot[] {
    return lanes(snapshot().groove)[lane]
  }

  function getCell(lane: LaneId, index: number): Slot {
    return lanes(snapshot().groove)[lane][index] ?? null
  }

  async function flushDraftIfPending(): Promise<void> {
    if (!draftPendingWhilePlaying) return
    draftPendingWhilePlaying = false
    await db.saveDraft(snapshot().groove)
  }

  const scheduler = createScheduler({
    getGroove: () => snapshot().groove,
    getSlotMs: () => slotMs(),
    getTotalSlots: () => totalSlots(),
    getCell,
    getLoop: () => snapshot().playback.loop,
    getCountInEnabled: () => snapshot().playback.countInEnabled,
    getIsPlaying: () => snapshot().playback.isPlaying,
    getLoadReady: () => snapshot().playback.loadProgress.ready,
    getCurrentSlot: () => playheadSnapshot().currentSlot,
    getIsCountingIn: () => playheadSnapshot().isCountingIn,
    patchPlayback,
    patchPlayhead,
    notifyNaturalEnd: () => {
      update((store) => ({
        ...store,
        playback: {
          ...store.playback,
          naturalEndCount: store.playback.naturalEndCount + 1,
        },
      }))
    },
    onStopped: () => {
      void flushDraftIfPending()
    },
  })

  function resizeAllLanes(groove: GrooveData, newLength: number): void {
    const map = lanes(groove)
    for (const lane of map.all) {
      map[lane] = resampleArray(map[lane], newLength)
    }
  }

  function setCell(lane: LaneId, index: number, value: Slot): void {
    recordHistoryBeforeMutation()
    update((store) => {
      const groove = structuredClone(store.groove)
      const map = lanes(groove)
      const arr = map[lane].slice()
      arr[index] = value
      map[lane] = arr
      return { ...store, groove, dirty: true }
    })
  }

  function toggleCell(
    lane: LaneId,
    index: number,
    articulation: NonNullable<Slot>,
  ): void {
    const current = getCell(lane, index)
    setCell(lane, index, current === articulation ? null : articulation)
  }

  function setDivision(division: Division): void {
    if (division === snapshot().groove.division) return
    recordHistoryBeforeMutation()
    update((store) => {
      const groove = structuredClone(store.groove)
      const newNotesPerMeasure = calcNotesPerMeasure(
        division,
        groove.timeSignature,
      )
      groove.division = division
      resizeAllLanes(groove, newNotesPerMeasure * groove.measures)
      return { ...store, groove, dirty: true }
    })
  }

  function setTimeSignature(timeSignature: TimeSignature): void {
    recordHistoryBeforeMutation()
    update((store) => {
      const groove = structuredClone(store.groove)
      groove.timeSignature = timeSignature
      const newNotesPerMeasure = calcNotesPerMeasure(
        groove.division,
        timeSignature,
      )
      resizeAllLanes(groove, newNotesPerMeasure * groove.measures)
      return { ...store, groove, dirty: true }
    })
  }

  function setMeasures(measures: number): void {
    const clamped = Math.min(MAX_MEASURES, Math.max(1, Math.round(measures)))
    if (clamped === snapshot().groove.measures) return
    recordHistoryBeforeMutation()
    update((store) => {
      const groove = structuredClone(store.groove)
      const npm = calcNotesPerMeasure(groove.division, groove.timeSignature)
      const newLength = npm * clamped
      const map = lanes(groove)
      for (const lane of map.all) {
        const arr = map[lane].slice()
        arr.length = newLength
        for (let i = 0; i < newLength; i++)
          if (arr[i] === undefined) arr[i] = null
        map[lane] = arr
      }
      groove.measures = clamped
      return { ...store, groove, dirty: true }
    })
  }

  function mutateGroove(mutator: (groove: GrooveData) => void): void {
    recordHistoryBeforeMutation()
    update((store) => {
      const groove = structuredClone(store.groove)
      mutator(groove)
      return { ...store, groove, dirty: true }
    })
  }

  function load(
    data: GrooveData,
    sourceLabel: string,
    options?: { clearHistory?: boolean },
  ): void {
    scheduler.stop()
    const plain = JSON.parse(JSON.stringify(data)) as GrooveData
    if (plain.showLegend === undefined) plain.showLegend = false
    if (plain.kickStemsUp === undefined) plain.kickStemsUp = true
    suppressHistory = true
    update((store) => ({
      ...store,
      groove: plain,
      sourceLabel,
      dirty: false,
    }))
    suppressHistory = false
    // Default: clear (New / library open). Practice/queue loads pass clearHistory: false.
    if (options?.clearHistory !== false) resetHistory()
  }

  function markSaved(sourceLabel: string): void {
    update((store) => ({ ...store, sourceLabel, dirty: false }))
  }

  function applySavedRecord(record: { id: string; name: string }): void {
    // Metadata-only — do not push history or clear the stack.
    update((store) => {
      const groove = structuredClone(store.groove)
      groove.id = record.id
      groove.name = record.name
      return { ...store, groove, sourceLabel: record.name, dirty: false }
    })
  }

  function seekToSlot(slot: number): void {
    scheduler.seek(slot)
  }

  function prevMeasure(): void {
    const npm = notesPerMeasure()
    const total = totalSlots()
    if (npm <= 0 || total <= 0) return
    const current = playheadSnapshot().currentSlot
    // Idle / stopped — nothing to go back to.
    if (current < 0) return
    const start = Math.floor(current / npm) * npm
    // On a downbeat → previous measure; mid-measure → still previous (DAW-style).
    const target = Math.max(0, start - npm)
    seekToSlot(target)
  }

  function nextMeasure(): void {
    const npm = notesPerMeasure()
    const total = totalSlots()
    if (npm <= 0 || total <= 0) return
    const measures = snapshot().groove.measures
    const lastStart = Math.max(0, (measures - 1) * npm)
    const current = playheadSnapshot().currentSlot
    // Idle / stopped — land on measure 1 (don't skip ahead by treating -1 as slot 0).
    if (current < 0) {
      seekToSlot(0)
      return
    }
    const start = Math.floor(current / npm) * npm
    const target = Math.min(lastStart, start + npm)
    seekToSlot(target)
  }

  function undo(): void {
    const result = undoHistory(historyStacks, snapshot().groove)
    if (!result) return
    historyStacks = result.stacks
    suppressHistory = true
    update((store) => ({
      ...store,
      groove: cloneGroove(result.groove),
      dirty: true,
    }))
    suppressHistory = false
    syncHistoryUi()
    persistHistorySoon()
  }

  function redo(): void {
    const result = redoHistory(historyStacks, snapshot().groove)
    if (!result) return
    historyStacks = result.stacks
    suppressHistory = true
    update((store) => ({
      ...store,
      groove: cloneGroove(result.groove),
      dirty: true,
    }))
    suppressHistory = false
    syncHistoryUi()
    persistHistorySoon()
  }

  function clearHistory(): void {
    resetHistory()
  }

  async function restoreHistory(): Promise<void> {
    try {
      const loaded = await db.loadHistory()
      if (!loaded) {
        historyStacks = emptyHistory()
        syncHistoryUi()
        return
      }
      historyStacks = {
        past: loaded.past.map(cloneGroove),
        future: loaded.future.map(cloneGroove),
      }
      syncHistoryUi()
    } catch (err) {
      console.error('Failed to restore undo history from IndexedDB', err)
      historyStacks = emptyHistory()
      syncHistoryUi()
    }
  }

  async function restoreDraft(): Promise<boolean> {
    try {
      const draft = await db.loadDraft()
      if (!draft) return false
      // load() clears history — restoreHistory() is called separately after boot.
      scheduler.stop()
      const plain = JSON.parse(JSON.stringify(draft)) as GrooveData
      if (plain.showLegend === undefined) plain.showLegend = false
      if (plain.kickStemsUp === undefined) plain.kickStemsUp = true
      suppressHistory = true
      update((store) => ({
        ...store,
        groove: plain,
        sourceLabel: draft.name ?? 'Untitled Groove',
        dirty: false,
      }))
      suppressHistory = false
      // Do not resetHistory here — AppLayout restores history after draft.
      if (draft.id) {
        const saved = await db.getGroove(draft.id)
        update((store) => ({
          ...store,
          dirty: saved
            ? JSON.stringify(saved.data) !== JSON.stringify(draft)
            : true,
          sourceLabel: saved ? saved.name : draft.name || 'Untitled Groove',
        }))
      } else {
        update((store) => ({ ...store, dirty: true }))
      }
      return true
    } catch (err) {
      console.error('Failed to restore draft from IndexedDB', err)
      return false
    }
  }

  async function saveDraftNow(): Promise<void> {
    if (snapshot().playback.isPlaying) {
      draftPendingWhilePlaying = true
      return
    }
    draftPendingWhilePlaying = false
    await db.saveDraft(snapshot().groove)
  }

  const playhead: Readable<App.Data.PlayheadState> = {
    subscribe: playheadStore.subscribe,
  }

  const history: Readable<App.Data.HistoryState> = {
    subscribe: historyUiStore.subscribe,
  }

  const store: App.Data.ContextStore = {
    subscribe,
    set,
    update,
    playhead,
    history,
    notesPerMeasure,
    totalSlots,
    groupSize,
    slotMs,
    getLane,
    getCell,
    setCell,
    toggleCell,
    setDivision,
    setTimeSignature,
    setMeasures,
    setTempo: (tempo) =>
      mutateGroove((g) => {
        g.tempo = Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, tempo))
      }),
    setMetronomeSubdivision: (subdivision) => {
      if (snapshot().groove.metronomeSubdivision === subdivision) return
      mutateGroove((g) => {
        g.metronomeSubdivision = subdivision
      })
    },
    setSwing: (percent) =>
      mutateGroove((g) => {
        g.swingPercent = percent
      }),
    setName: (name) =>
      mutateGroove((g) => {
        g.name = name
      }),
    setShowToms: (value) => {
      if (snapshot().groove.showToms === value) return
      mutateGroove((g) => {
        g.showToms = value
      })
    },
    setShowStickings: (value) => {
      if (snapshot().groove.showStickings === value) return
      mutateGroove((g) => {
        g.showStickings = value
      })
    },
    setShowLegend: (value) => {
      if (snapshot().groove.showLegend === value) return
      mutateGroove((g) => {
        g.showLegend = value
      })
    },
    applyDisplayPrefs: (prefs) => {
      update((store) => {
        const g = store.groove
        if (
          g.showToms === prefs.showToms &&
          g.showStickings === prefs.showStickings &&
          g.showLegend === prefs.showLegend &&
          g.metronomeSubdivision === prefs.metronomeSubdivision
        ) {
          return store
        }
        const groove = structuredClone(g)
        groove.showToms = prefs.showToms
        groove.showStickings = prefs.showStickings
        groove.showLegend = prefs.showLegend
        groove.metronomeSubdivision = prefs.metronomeSubdivision
        return { ...store, groove }
      })
    },
    toggleShowToms: () =>
      mutateGroove((g) => {
        g.showToms = !g.showToms
      }),
    toggleShowStickings: () =>
      mutateGroove((g) => {
        g.showStickings = !g.showStickings
      }),
    toggleShowLegend: () =>
      mutateGroove((g) => {
        g.showLegend = !g.showLegend
      }),
    setKickStemsUp: (up) =>
      mutateGroove((g) => {
        g.kickStemsUp = up
      }),
    reverseStickings: () =>
      mutateGroove((g) => {
        g.sticking = g.sticking.map((s) =>
          s === 'R' ? 'L' : s === 'L' ? 'R' : s,
        )
      }),
    clearLane: (lane) => {
      recordHistoryBeforeMutation()
      update((s) => {
        const groove = structuredClone(s.groove)
        const length =
          calcNotesPerMeasure(groove.division, groove.timeSignature) *
          groove.measures
        lanes(groove)[lane] = new Array(length).fill(null)
        return { ...s, groove, dirty: true }
      })
    },
    clearAll: () => {
      // Single history entry for the whole clear.
      recordHistoryBeforeMutation()
      suppressHistory = true
      for (const lane of lanes(snapshot().groove).all) {
        update((s) => {
          const groove = structuredClone(s.groove)
          const length =
            calcNotesPerMeasure(groove.division, groove.timeSignature) *
            groove.measures
          lanes(groove)[lane] = new Array(length).fill(null)
          return { ...s, groove, dirty: true }
        })
      }
      suppressHistory = false
    },
    load,
    markSaved,
    applySavedRecord,
    newGroove: () => load(createEmptyGrooveData(), 'Untitled Groove'),
    setDirty: (dirty) => update((s) => ({ ...s, dirty })),
    setSourceLabel: (label) => update((s) => ({ ...s, sourceLabel: label })),
    setLoop: (loop: LoopMode) => patchPlayback({ loop }),
    toggleLoop: () =>
      patchPlayback({
        loop: snapshot().playback.loop === 'loop' ? 'once' : 'loop',
      }),
    setCountInEnabled: (enabled) => patchPlayback({ countInEnabled: enabled }),
    toggleCountIn: () =>
      patchPlayback({ countInEnabled: !snapshot().playback.countInEnabled }),
    play: (options) => scheduler.start(options),
    pause: () => scheduler.pause(),
    stop: () => scheduler.stop(),
    togglePlay: () => scheduler.toggle(),
    seekToSlot,
    prevMeasure,
    nextMeasure,
    undo,
    redo,
    clearHistory,
    restoreHistory,
    previewSample: (sample, gain) => scheduler.previewSample(sample, gain),
    restoreDraft,
    saveDraftNow,
  }

  return store
}

export function setDataContext(
  init: App.Data.ContextInput = {},
): App.Data.ContextStore {
  return setContext(DATA_CONTEXT, createDataContextStore(init))
}

export function getDataContext(): App.Data.ContextStore {
  return getContext<App.Data.ContextStore>(DATA_CONTEXT)
}
