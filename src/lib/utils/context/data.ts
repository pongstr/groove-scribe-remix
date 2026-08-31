import { getContext, setContext } from 'svelte'
import { get, type Readable, writable } from 'svelte/store'

import { createScheduler } from '$lib/utils/audio/scheduler'
import { MAX_MEASURES, MAX_TEMPO, MIN_TEMPO } from '$lib/utils/config'
import { lanes, resampleArray } from '$lib/utils/groove-lanes'
import {
  cloneGroove,
  emptyHistory,
  type HistoryStacks,
  pushHistory,
  redoHistory,
  undoHistory,
} from '$lib/utils/history'
import {
  calcNotesPerMeasure,
  noteGroupingSize,
  slotDurationMs,
} from '$lib/utils/music-math'
import {
  canTieSnareToNext,
  clearAllSnareModifiers,
  clearSnareModifiersAt,
  ensureSnareModifiers,
  normalizeGrooveData,
  padFlagArray,
  resampleFlagArray,
  snareArticulationHasInherentAccent,
} from '$lib/utils/snare-modifiers'
import * as db from '$lib/utils/storage/db'
import { createEmptyGrooveData } from '$lib/utils/tab-notation'
import {
  clampTupletGroups,
  removeTupletAt,
  upsertTupletAt,
} from '$lib/utils/tuplet-timing'

export const DATA_CONTEXT = 'app.data'

const HISTORY_PERSIST_MS = 250

const INITIAL_PLAYHEAD: App.Groove.PlayheadState = {
  currentSlot: -1,
  isCountingIn: false,
  countInBeat: 0,
}

function initDataContext(
  init: App.Groove.ContextInput = {},
): App.Groove.Context {
  return {
    groove: init.groove ?? createEmptyGrooveData(),
    dirty: init.dirty ?? false,
    sourceLabel: init.sourceLabel ?? 'Untitled Groove',
    playback: {
      isPlaying: false,
      loop: 'loop',
      countInEnabled: true,
      naturalEndCount: 0,
      naturalEndAt: null as number | null,
      loadProgress: { loaded: 0, total: 0, ready: false },
      ...init.playback,
    },
  }
}

export function createDataContextStore(
  init: App.Groove.ContextInput = {},
): App.Groove.ContextStore {
  const { subscribe, set, update } = writable<App.Groove.Context>(
    initDataContext(init),
  )
  const playheadStore = writable<App.Groove.PlayheadState>({
    ...INITIAL_PLAYHEAD,
  })
  const historyUiStore = writable<App.Groove.HistoryState>({
    canUndo: false,
    canRedo: false,
  })

  let historyStacks: HistoryStacks = emptyHistory()
  let historyPersistTimer: ReturnType<typeof setTimeout> | null = null
  let draftPendingWhilePlaying = false
  /** When true, groove updates must not push a new history entry (undo/redo/load). */
  let suppressHistory = false

  function playheadSnapshot(): App.Groove.PlayheadState {
    return get(playheadStore)
  }

  function snapshot(): App.Groove.Context {
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

  function patchPlayback(partial: Partial<App.Groove.PlaybackState>): void {
    update((store) => ({
      ...store,
      playback: { ...store.playback, ...partial },
    }))
  }

  function patchPlayhead(partial: Partial<App.Groove.PlayheadState>): void {
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

  function getLane(lane: App.Groove.LaneId): App.Groove.Slot[] {
    return lanes(snapshot().groove)[lane]
  }

  function getCell(lane: App.Groove.LaneId, index: number): App.Groove.Slot {
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
    notifyNaturalEnd: (chainAt: number) => {
      update((store) => ({
        ...store,
        playback: {
          ...store.playback,
          naturalEndCount: store.playback.naturalEndCount + 1,
          naturalEndAt: chainAt,
        },
      }))
    },
    onStopped: () => {
      void flushDraftIfPending()
    },
  })

  function resizeAllLanes(groove: App.Groove.Data, newLength: number): void {
    const map = lanes(groove)
    for (const lane of map.all) {
      map[lane] = resampleArray(map[lane], newLength)
    }
    groove.snareAccent = resampleFlagArray(groove.snareAccent, newLength)
    groove.snareTies = resampleFlagArray(groove.snareTies, newLength)
    groove.tupletGroups = clampTupletGroups(
      groove.tupletGroups ?? [],
      newLength,
    )
  }

  function setCell(
    lane: App.Groove.LaneId,
    index: number,
    value: App.Groove.Slot,
  ): void {
    recordHistoryBeforeMutation()
    update((store) => {
      const groove = structuredClone(store.groove)
      if (lane === 'snare') {
        ensureSnareModifiers(groove)
        if (value === null) {
          clearSnareModifiersAt(groove, index)
        } else if (
          snareArticulationHasInherentAccent(
            value as App.Groove.SnareArticulation,
          )
        ) {
          if (groove.snareAccent) groove.snareAccent[index] = false
        }
      }
      const map = lanes(groove)
      const arr = map[lane].slice()
      arr[index] = value
      map[lane] = arr
      return { ...store, groove, dirty: true }
    })
  }

  function toggleSnareAccent(index: number): void {
    const groove = snapshot().groove
    if (!groove.snare[index]) return
    if (snareArticulationHasInherentAccent(groove.snare[index])) return
    recordHistoryBeforeMutation()
    update((store) => {
      const next = structuredClone(store.groove)
      ensureSnareModifiers(next)
      next.snareAccent![index] = !next.snareAccent![index]
      return { ...store, groove: next, dirty: true }
    })
  }

  function toggleSnareTie(index: number): void {
    const groove = snapshot().groove
    if (!canTieSnareToNext(groove, index) && !groove.snareTies?.[index]) return
    recordHistoryBeforeMutation()
    update((store) => {
      const next = structuredClone(store.groove)
      ensureSnareModifiers(next)
      next.snareTies![index] = !next.snareTies![index]
      return { ...store, groove: next, dirty: true }
    })
  }

  function toggleCell(
    lane: App.Groove.LaneId,
    index: number,
    articulation: NonNullable<App.Groove.Slot>,
  ): void {
    const current = getCell(lane, index)
    setCell(lane, index, current === articulation ? null : articulation)
  }

  function setTupletAt(
    startSlot: number,
    kind: App.Groove.TupletKind | null,
  ): void {
    recordHistoryBeforeMutation()
    update((store) => {
      const groove = structuredClone(store.groove)
      const groups = groove.tupletGroups ?? []
      const total =
        calcNotesPerMeasure(groove.division, groove.timeSignature) *
        groove.measures
      groove.tupletGroups = kind
        ? upsertTupletAt(groups, startSlot, kind, total)
        : removeTupletAt(groups, startSlot)
      return { ...store, groove, dirty: true }
    })
  }

  function setDivision(division: App.Groove.Division): void {
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

  function setTimeSignature(timeSignature: App.Groove.TimeSignature): void {
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
      groove.snareAccent = padFlagArray(groove.snareAccent, newLength)
      groove.snareTies = padFlagArray(groove.snareTies, newLength)
      groove.tupletGroups = clampTupletGroups(
        groove.tupletGroups ?? [],
        newLength,
      )
      return { ...store, groove, dirty: true }
    })
  }

  function mutateGroove(mutator: (groove: App.Groove.Data) => void): void {
    recordHistoryBeforeMutation()
    update((store) => {
      const groove = structuredClone(store.groove)
      mutator(groove)
      return { ...store, groove, dirty: true }
    })
  }

  function load(
    data: App.Groove.Data,
    sourceLabel: string,
    options?: { clearHistory?: boolean; keepTransport?: boolean },
  ): void {
    if (!options?.keepTransport) scheduler.stop()
    const plain = normalizeGrooveData(
      JSON.parse(JSON.stringify(data)) as App.Groove.Data,
    )
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

  function chainPlay(
    grooveData: App.Groove.Data,
    sourceLabel: string,
    chainAt: number,
  ): void {
    load(grooveData, sourceLabel, { clearHistory: false, keepTransport: true })
    scheduler.chain({ startAt: chainAt })
    patchPlayback({ naturalEndAt: null })
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
      const plain = normalizeGrooveData(
        JSON.parse(JSON.stringify(draft)) as App.Groove.Data,
      )
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

  const playhead: Readable<App.Groove.PlayheadState> = {
    subscribe: playheadStore.subscribe,
  }

  const history: Readable<App.Groove.HistoryState> = {
    subscribe: historyUiStore.subscribe,
  }

  const store: App.Groove.ContextStore = {
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
    setTupletAt,
    toggleSnareAccent,
    toggleSnareTie,
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
        if (lane === 'snare') clearAllSnareModifiers(groove)
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
      update((s) => {
        const groove = structuredClone(s.groove)
        clearAllSnareModifiers(groove)
        return { ...s, groove, dirty: true }
      })
      suppressHistory = false
    },
    load,
    chainPlay,
    markSaved,
    applySavedRecord,
    newGroove: () => load(createEmptyGrooveData(), 'Untitled Groove'),
    setDirty: (dirty) => update((s) => ({ ...s, dirty })),
    setSourceLabel: (label) => update((s) => ({ ...s, sourceLabel: label })),
    setLoop: (loop: App.Groove.LoopMode) => patchPlayback({ loop }),
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
  init: App.Groove.ContextInput = {},
): App.Groove.ContextStore {
  return setContext(DATA_CONTEXT, createDataContextStore(init))
}

export function getDataContext(): App.Groove.ContextStore {
  return getContext<App.Groove.ContextStore>(DATA_CONTEXT)
}
