import { getContext, setContext } from 'svelte'
import { get, writable } from 'svelte/store'

import { browser } from '$app/environment'
import * as db from '$lib/utils/storage/db'
import { defaultPracticeQueue } from '$lib/utils/storage/seed-grooves'

export const UI_CONTEXT = 'app.ui'

// NOTE:
// Whenever changes are made in the UI Context, bump the version
// (patch/minor/major) so that `initUIContext` can migrate via `migrate` below.
const UI_CONTEXT_VERSION = '0.3.4'

const STICKING_MODES: App.Groove.StickingMode[] = ['off', 'visible', 'reverse']
const CLICK_SUBDIVISIONS: App.Groove.ClickSubdivision[] = [0, 4, 8, 16]

/** Default UI context — also the seed written to localStorage on first visit. */
export const uiDefaults: App.UI.ContextInput = {
  version: UI_CONTEXT_VERSION,
  theme: 'dark',
  practiceMode: {
    active: false,
    queue: defaultPracticeQueue(),
    currentIndex: 0,
    autoAdvance: true,
    selectedTab: 'queue',
  },
  previewMode: false,
  drawer: {
    open: false,
    tab: 'mine',
  },
  aboutOpen: false,
  helpOpen: false,
  permutationsOpen: false,
  settings: {
    countInDefault: true,
  },
  stickingMode: 'off',
  showToms: false,
  showLegend: false,
  clickSubdivision: 0,
  editorVisible: true,
  queueOpen: true,
  shortcutsOpen: false,
}

type MigrateFunction = (
  _update: App.UI.ContextInput,
  _local: App.UI.ContextInput,
) => App.UI.ContextInput

function practiceModeFromLocal(
  local: App.UI.ContextInput,
  fallback: App.UI.ContextInput['practiceMode'],
): App.UI.ContextInput['practiceMode'] {
  const practiceMode = local.practiceMode

  if (!practiceMode) return fallback

  return {
    active: practiceMode.active ?? fallback?.active ?? false,
    queue: Array.isArray(practiceMode.queue)
      ? practiceMode.queue
      : (fallback?.queue ?? []),
    currentIndex: practiceMode.currentIndex ?? fallback?.currentIndex ?? 0,
    autoAdvance: practiceMode.autoAdvance ?? fallback?.autoAdvance ?? true,
  }
}

const migrate: Record<string, MigrateFunction> = {
  '0.3.0': (update, local) => ({
    ...update,
    ...local,
    practiceMode: practiceModeFromLocal(local, update.practiceMode),
    previewMode: local.previewMode ?? false,
    stickingMode: local.stickingMode ?? update.stickingMode ?? 'off',
    showToms: local.showToms ?? update.showToms ?? false,
    showLegend: local.showLegend ?? update.showLegend ?? false,
    clickSubdivision: local.clickSubdivision ?? update.clickSubdivision ?? 0,
    editorVisible: local.editorVisible ?? update.editorVisible ?? true,
    queueOpen: local.queueOpen ?? update.queueOpen ?? true,
    helpOpen: false,
    permutationsOpen: false,
    shortcutsOpen: false,
    version: '0.3.0',
  }),
  '0.3.2': (update, local) => {
    const practiceMode = practiceModeFromLocal(local, update.practiceMode)
    const queue =
      practiceMode && practiceMode.queue && practiceMode.queue?.length > 0
        ? practiceMode.queue
        : defaultPracticeQueue()

    return {
      ...update,
      ...local,
      practiceMode: { ...practiceMode, queue },
      previewMode: local.previewMode ?? false,
      stickingMode: local.stickingMode ?? update.stickingMode ?? 'off',
      showToms: local.showToms ?? update.showToms ?? false,
      showLegend: local.showLegend ?? update.showLegend ?? false,
      clickSubdivision: local.clickSubdivision ?? update.clickSubdivision ?? 0,
      editorVisible: local.editorVisible ?? update.editorVisible ?? true,
      queueOpen: local.queueOpen ?? update.queueOpen ?? true,
      helpOpen: false,
      permutationsOpen: false,
      shortcutsOpen: false,
      version: '0.3.2',
    }
  },
  '0.3.3': (update, local) => {
    const practiceMode = practiceModeFromLocal(local, update.practiceMode)
    const queue =
      practiceMode && practiceMode.queue && practiceMode.queue?.length > 0
        ? practiceMode.queue
        : defaultPracticeQueue()

    return {
      ...update,
      ...local,
      practiceMode: { ...practiceMode, queue },
      previewMode: local.previewMode ?? false,
      stickingMode: local.stickingMode ?? update.stickingMode ?? 'off',
      showToms: local.showToms ?? update.showToms ?? false,
      showLegend: local.showLegend ?? update.showLegend ?? false,
      clickSubdivision: local.clickSubdivision ?? update.clickSubdivision ?? 0,
      editorVisible: local.editorVisible ?? update.editorVisible ?? true,
      queueOpen: local.queueOpen ?? update.queueOpen ?? true,
      helpOpen: false,
      permutationsOpen: false,
      shortcutsOpen: false,
      version: '0.3.3',
    }
  },
  '0.3.4': (update, local) => {
    return {
      ...update,
      ...local,
      aboutOpen: local.aboutOpen ?? update.aboutOpen ?? false
    }
  }
}

function cloneGroove(data: App.Groove.Data): App.Groove.Data {
  return JSON.parse(JSON.stringify(data)) as App.Groove.Data
}

function newEntryId(): string {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function canUseLocalStorage(): boolean {
  return browser && typeof localStorage !== 'undefined'
}

function applyTheme(theme: App.UI.Theme): void {
  if (!browser) return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function normalizeStickingMode(value: unknown): App.Groove.StickingMode {
  return value === 'visible' || value === 'reverse' ? value : 'off'
}

function normalizeClickSubdivision(
  value: unknown,
): App.Groove.ClickSubdivision {
  return value === 4 || value === 8 || value === 16 ? value : 0
}

function toContext(input: App.UI.ContextInput): App.UI.Context {
  const practiceSource = input.practiceMode

  // Always copy the queue so we never share a reference with `uiDefaults`.
  const queue = Array.isArray(practiceSource?.queue)
    ? practiceSource!.queue!.slice()
    : []
  const currentIndex =
    queue.length === 0
      ? 0
      : Math.min(
        Math.max(0, practiceSource?.currentIndex ?? 0),
        queue.length - 1,
      )

  return {
    version: UI_CONTEXT_VERSION,
    theme: input.theme === 'light' ? 'light' : 'dark',
    practiceMode: {
      active: Boolean(practiceSource?.active),
      queue,
      currentIndex,
      autoAdvance: practiceSource?.autoAdvance ?? true,
      selectedTab: practiceSource?.selectedTab ?? 'queue',
    },
    previewMode: Boolean(input.previewMode),
    drawer: {
      open: Boolean(input.drawer?.open),
      tab: input.drawer?.tab === 'presets' ? 'presets' : 'mine',
    },
    aboutOpen: false,
    // Ephemeral overlays — never restore open from storage (stuck true
    // previously blocked all letter shortcuts while Space still worked).
    helpOpen: false,
    permutationsOpen: false,
    settings: {
      countInDefault: input.settings?.countInDefault ?? true,
    },
    stickingMode: normalizeStickingMode(input.stickingMode),
    showToms: Boolean(input.showToms),
    showLegend: Boolean(input.showLegend),
    clickSubdivision: normalizeClickSubdivision(input.clickSubdivision),
    editorVisible: input.editorVisible !== false,
    queueOpen: input.queueOpen !== false,
    shortcutsOpen: false,
  }
}

/**
 * Load UI context from localStorage (or seed it), applying migrations when the
 * stored version does not match `UI_CONTEXT_VERSION`.
 *
 * Mirrors the ffmpeg-trimmer pattern: shallow merge so persisted nested objects
 * (e.g. practiceMode) fully replace defaults — including active session state.
 */
function initUIContext(init: App.UI.ContextInput = {}): App.UI.Context {
  const seed = toContext({
    ...uiDefaults,
    ...init,
    version: UI_CONTEXT_VERSION,
  })

  if (!canUseLocalStorage()) return seed

  const raw = localStorage.getItem(UI_CONTEXT)
  if (!raw) {
    localStorage.setItem(UI_CONTEXT, JSON.stringify(seed))
    return seed
  }

  try {
    const local = JSON.parse(raw) as App.UI.ContextInput

    if (local.version !== UI_CONTEXT_VERSION) {
      const migrateFn = migrate[UI_CONTEXT_VERSION]
      const update = migrateFn
        ? migrateFn({ ...seed, version: UI_CONTEXT_VERSION }, local)
        : { ...local, version: UI_CONTEXT_VERSION }

      // Shallow merge: persisted fields win over defaults (same as reference).
      const next = toContext({ ...seed, ...update })

      localStorage.setItem(UI_CONTEXT, JSON.stringify(next))
      return next
    }

    const next = toContext({ ...seed, ...local })
    localStorage.setItem(UI_CONTEXT, JSON.stringify(next))
    return next
  } catch (err) {
    console.error('Failed to parse UI context from localStorage', err)
    localStorage.setItem(UI_CONTEXT, JSON.stringify(seed))
    return seed
  }
}

function updateStorage(input: App.UI.Context): void {
  if (!canUseLocalStorage()) return
  try {
    const { practiceMode, ...rest } = input
    const { queue: _queue, ...practiceMeta } = practiceMode
    localStorage.setItem(
      UI_CONTEXT,
      JSON.stringify({
        ...rest,
        practiceMode: practiceMeta,
        helpOpen: false,
        permutationsOpen: false,
        shortcutsOpen: false,
      }),
    )
  } catch (err) {
    console.error('Failed to persist UI context to localStorage', err)
  }
}

function persistPracticeQueue(queue: App.UI.PracticeQueueItem[]): void {
  if (!browser) return
  void db.savePracticeQueue(queue).catch((err) => {
    console.error('Failed to persist practice queue to IndexedDB', err)
  })
}

export function createUIContextStore(
  init: App.UI.ContextInput = {},
  data: App.Groove.ContextStore,
): App.UI.ContextStore {
  const base = initUIContext(init)
  const {
    subscribe,
    set: rawSet,
    update: rawUpdate,
  } = writable<App.UI.Context>(base)
  applyTheme(base.theme)

  let savedLoop: App.Groove.LoopMode | null = null
  let savedBeforePractice: {
    groove: App.Groove.Data
    sourceLabel: string
  } | null = null

  // Persist on every store update (skip the immediate subscribe emission so we
  // never overwrite localStorage with a stale in-memory snapshot).
  let persistReady = false

  subscribe((value) => {
    if (!persistReady) return
    updateStorage(value)
  })

  persistReady = true

  // Load practice queue from IndexedDB (migrates legacy localStorage queue on first run).
  if (browser) {
    void (async () => {
      try {
        const stored = await db.loadPracticeQueue()
        if (stored && stored.length > 0) {
          rawUpdate((store) => ({
            ...store,
            practiceMode: { ...store.practiceMode, queue: stored },
          }))
          return
        }
        const { queue } = base.practiceMode
        if (queue.length > 0) {
          await db.savePracticeQueue(queue)
        }
      } catch (err) {
        console.error('Failed to load practice queue from IndexedDB', err)
      }
    })()
  }

  // Resume Practice Mode side-effects when the session was left active.
  if (base.practiceMode.active) {
    savedLoop = get(data).playback.loop
    data.setLoop('once')
    const item = base.practiceMode.queue[base.practiceMode.currentIndex]
    if (item) data.load(item.data, item.name, { clearHistory: false })
  }
  // Align groove display with UI prefs (prefs win over groove/draft fields).
  data.applyDisplayPrefs({
    showToms: base.showToms,
    showStickings: base.stickingMode !== 'off',
    showLegend: base.showLegend,
    metronomeSubdivision: base.clickSubdivision,
  })

  function set(value: App.UI.Context): void {
    rawSet(value)
  }

  function update(fn: (_: App.UI.Context) => App.UI.Context): void {
    rawUpdate(fn)
  }

  function snapshot(): App.UI.Context {
    return get({ subscribe })
  }

  /** Keep groove display fields aligned with persisted UI prefs after loads. */
  function syncDisplayFromUi(): void {
    const prefs = snapshot()
    data.applyDisplayPrefs({
      showToms: prefs.showToms,
      showStickings: prefs.stickingMode !== 'off',
      showLegend: prefs.showLegend,
      metronomeSubdivision: prefs.clickSubdivision,
    })
  }

  function exitPracticeMode(): void {
    update((store) => ({
      ...store,
      practiceMode: { ...store.practiceMode, active: false },
      previewMode: false,
    }))
    if (savedLoop) {
      data.setLoop(savedLoop)
      savedLoop = null
    }
    data.stop()
    if (savedBeforePractice) {
      data.load(savedBeforePractice.groove, savedBeforePractice.sourceLabel, {
        clearHistory: false,
      })
      savedBeforePractice = null
    }
    syncDisplayFromUi()
  }

  function enterPracticeMode(): void {
    const current = get(data)
    savedBeforePractice = {
      groove: cloneGroove(current.groove),
      sourceLabel: current.sourceLabel,
    }
    update((store) => {
      let currentIndex = store.practiceMode.currentIndex
      if (store.practiceMode.queue.length > 0) {
        currentIndex = Math.min(
          Math.max(0, currentIndex),
          store.practiceMode.queue.length - 1,
        )
      }
      return {
        ...store,
        previewMode: false,
        practiceMode: {
          ...store.practiceMode,
          active: true,
          currentIndex,
        },
      }
    })
    savedLoop = get(data).playback.loop
    data.setLoop('once')
    data.stop()
    const { queue, currentIndex } = snapshot().practiceMode
    const activeItem = queue[currentIndex]
    if (activeItem) {
      data.load(activeItem.data, activeItem.name, { clearHistory: false })
    }
    syncDisplayFromUi()
  }

  function setPreviewMode(value: boolean): void {
    if (value) {
      if (snapshot().practiceMode.active) exitPracticeMode()
      update((store) => ({ ...store, previewMode: true }))
      return
    }
    update((store) => ({ ...store, previewMode: false }))
  }

  function togglePreviewMode(): void {
    setPreviewMode(!snapshot().previewMode)
  }

  function enqueue(
    name: string,
    groove: App.Groove.Data,
  ): App.UI.PracticeQueueItem {
    const item: App.UI.PracticeQueueItem = {
      id: newEntryId(),
      name: name.trim() || 'Untitled Groove',
      data: cloneGroove(groove),
    }
    update((store) => ({
      ...store,
      practiceMode: {
        ...store.practiceMode,
        queue: [...store.practiceMode.queue, item],
      },
    }))
    persistPracticeQueue([...snapshot().practiceMode.queue, item])
    return item
  }

  function removeFromQueue(id: string): void {
    update((store) => {
      const idx = store.practiceMode.queue.findIndex((q) => q.id === id)
      if (idx < 0) return store
      const queue = store.practiceMode.queue.filter((q) => q.id !== id)
      let currentIndex = store.practiceMode.currentIndex
      if (queue.length === 0) currentIndex = 0
      else if (idx < currentIndex) currentIndex -= 1
      else if (idx === currentIndex)
        currentIndex = Math.min(currentIndex, queue.length - 1)
      return {
        ...store,
        practiceMode: { ...store.practiceMode, queue, currentIndex },
      }
    })
    persistPracticeQueue(snapshot().practiceMode.queue)
  }

  function selectQueueIndex(index: number): App.UI.PracticeQueueItem | null {
    const { practiceMode } = snapshot()
    if (index < 0 || index >= practiceMode.queue.length) return null
    update((store) => ({
      ...store,
      practiceMode: { ...store.practiceMode, currentIndex: index },
    }))
    return practiceMode.queue[index] ?? null
  }

  function nextInQueue(): App.UI.PracticeQueueItem | null {
    const { practiceMode } = snapshot()
    if (practiceMode.queue.length === 0) return null
    const index = (practiceMode.currentIndex + 1) % practiceMode.queue.length
    return selectQueueIndex(index)
  }

  function prevInQueue(): App.UI.PracticeQueueItem | null {
    const { practiceMode } = snapshot()
    if (practiceMode.queue.length === 0) return null
    const index =
      (practiceMode.currentIndex - 1 + practiceMode.queue.length) %
      practiceMode.queue.length
    return selectQueueIndex(index)
  }

  function moveQueueItem(id: string, direction: -1 | 1): void {
    update((store) => {
      const idx = store.practiceMode.queue.findIndex((q) => q.id === id)
      if (idx < 0) return store
      const target = idx + direction
      if (target < 0 || target >= store.practiceMode.queue.length) return store
      const queue = [...store.practiceMode.queue]
      const [item] = queue.splice(idx, 1)
      queue.splice(target, 0, item)
      let currentIndex = store.practiceMode.currentIndex
      if (currentIndex === idx) currentIndex = target
      else if (currentIndex === target) currentIndex = idx
      return {
        ...store,
        practiceMode: { ...store.practiceMode, queue, currentIndex },
      }
    })
    persistPracticeQueue(snapshot().practiceMode.queue)
  }

  function syncQueueGroove(
    grooveId: string,
    name: string,
    groove: App.Groove.Data,
  ): void {
    if (!grooveId) return
    const next = cloneGroove(groove)
    next.id = grooveId
    next.name = name
    update((store) => {
      let changed = false
      const queue = store.practiceMode.queue.map((item) => {
        if (item.data.id !== grooveId) return item
        changed = true
        return {
          ...item,
          name: name.trim() || item.name,
          data: cloneGroove(next),
        }
      })
      if (!changed) return store
      return {
        ...store,
        practiceMode: { ...store.practiceMode, queue },
      }
    })
    persistPracticeQueue(snapshot().practiceMode.queue)
  }

  function updateQueueItem(
    entryId: string,
    name: string,
    groove: App.Groove.Data,
  ): void {
    update((store) => {
      const queue = store.practiceMode.queue.map((item) =>
        item.id === entryId
          ? {
            ...item,
            name: name.trim() || item.name,
            data: cloneGroove(groove),
          }
          : item,
      )
      return {
        ...store,
        practiceMode: { ...store.practiceMode, queue },
      }
    })
    persistPracticeQueue(snapshot().practiceMode.queue)
  }

  const store: App.UI.ContextStore = {
    subscribe,
    set,
    update,
    enterPracticeMode,
    exitPracticeMode,
    togglePracticeMode: () => {
      if (snapshot().practiceMode.active) exitPracticeMode()
      else enterPracticeMode()
    },
    setPreviewMode,
    togglePreviewMode,
    enqueue,
    removeFromQueue,
    selectQueueIndex,
    nextInQueue,
    prevInQueue,
    moveQueueItem,
    syncQueueGroove,
    updateQueueItem,
    setAutoAdvance: (value) =>
      update((s) => ({
        ...s,
        practiceMode: { ...s.practiceMode, autoAdvance: value },
      })),
    clearQueue: () => {
      update((s) => ({
        ...s,
        practiceMode: { ...s.practiceMode, queue: [], currentIndex: 0 },
      }))
      persistPracticeQueue([])
    },

    // TODO: prefer `selectedTab`
    showDrawer: (tab: string = 'mine') =>
      update((s) => ({
        ...s,
        drawer: { open: true, tab },
      })),
    closeDrawer: () =>
      update((s) => ({
        ...s,
        drawer: { ...s.drawer, open: false },
      })),
    toggleDrawer: () =>
      update((s) => ({
        ...s,
        drawer: { ...s.drawer, open: !s.drawer.open },
      })),
    setDrawerTab: (tab) =>
      void update((store) => ({
        ...store,
        drawer: { ...store.drawer, tab },
      })),
    toggleAbout: (value: boolean) => void update((store) => ({ ...store, aboutOpen: value })),
    toggleHelp: (value: boolean) => void update((store) => ({ ...store, helpOpen: value })),
    togglePermutations: () =>
      update((s) => ({ ...s, permutationsOpen: !s.permutationsOpen })),
    closePermutations: () => update((s) => ({ ...s, permutationsOpen: false })),
    setTheme: (theme) => {
      applyTheme(theme)
      update((s) => ({ ...s, theme }))
    },
    setSetting: (key, value) =>
      update((s) => ({
        ...s,
        settings: { ...s.settings, [key]: value },
      })),
    setStickingMode: (mode) => update((s) => ({ ...s, stickingMode: mode })),
    cycleStickingMode: () =>
      update((s) => {
        const idx = STICKING_MODES.indexOf(s.stickingMode)
        const next = STICKING_MODES[(idx + 1) % STICKING_MODES.length]!
        return { ...s, stickingMode: next }
      }),
    toggleShowTomsPref: () => update((s) => ({ ...s, showToms: !s.showToms })),
    setShowTomsPref: (value) => update((s) => ({ ...s, showToms: value })),
    toggleShowLegendPref: () =>
      update((s) => ({ ...s, showLegend: !s.showLegend })),
    setShowLegendPref: (value) => update((s) => ({ ...s, showLegend: value })),
    setClickSubdivision: (value) =>
      update((s) => ({ ...s, clickSubdivision: value })),
    cycleClickSubdivision: () =>
      update((s) => {
        const idx = CLICK_SUBDIVISIONS.indexOf(s.clickSubdivision)
        const next = CLICK_SUBDIVISIONS[(idx + 1) % CLICK_SUBDIVISIONS.length]!
        return { ...s, clickSubdivision: next }
      }),
    toggleEditorVisible: () =>
      update((s) => ({ ...s, editorVisible: !s.editorVisible })),
    setEditorVisible: (value) =>
      update((s) => ({ ...s, editorVisible: value })),
    toggleQueueOpen: () => update((s) => ({ ...s, queueOpen: !s.queueOpen })),
    setQueueOpen: (value) => update((s) => ({ ...s, queueOpen: value })),
    toggleShortcuts: (value: boolean) =>
      update((store) => ({ ...store, shortcutsOpen: value })),
    // openShortcuts: () => update((s) => ({ ...s, shortcutsOpen: true })),
    // closeShortcuts: () => update((s) => ({ ...s, shortcutsOpen: false })),
  }

  return store
}

export function setUIContext(
  init: App.UI.ContextInput = {},
  data: App.Groove.ContextStore,
): App.UI.ContextStore {
  return setContext(UI_CONTEXT, createUIContextStore(init, data))
}

export function getUIContext(): App.UI.ContextStore {
  return getContext<App.UI.ContextStore>(UI_CONTEXT)
}
