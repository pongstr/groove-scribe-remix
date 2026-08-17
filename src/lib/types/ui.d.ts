import type { Writable } from 'svelte/store'

declare global {
  namespace App {
    namespace UI {
      type Theme = 'light' | 'dark'
      type PracticeQueueItem = {
        id: string
        name: string
        data: App.Groove.Data
      }

      type PracticeModeState = {
        active: boolean
        queue: PracticeQueueItem[]
        currentIndex: number
        autoAdvance: boolean
        selectedTab: 'queue' | 'grooves' | 'presets'
      }

      type DrawerState = {
        open: boolean
        tab: DrawerTab
      }

      type Settings = {
        countInDefault: boolean
      }

      type Context = {
        /** Bump when persisted shape changes; see migrate map in ui.ts. */
        version: string
        theme: Theme
        practiceMode: PracticeModeState
        /** Edit-mode notation preview: Groove Editor chrome hidden. */
        previewMode: boolean
        drawer: DrawerState
        aboutOpen: boolean
        helpOpen: boolean
        permutationsOpen: boolean
        settings: Settings
        stickingMode: StickingMode
        showToms: boolean
        showLegend: boolean
        clickSubdivision: ClickSubdivision
        editorVisible: boolean
        queueOpen: boolean
        shortcutsOpen: boolean
      }

      type ContextInput = Partial<{
        version: string
        theme: Theme
        practiceMode: Partial<PracticeModeState>
        previewMode: boolean
        drawer: Partial<DrawerState>
        aboutOpen: boolean
        helpOpen: boolean
        permutationsOpen: boolean
        settings: Partial<Settings>
        stickingMode: StickingMode
        showToms: boolean
        showLegend: boolean
        clickSubdivision: ClickSubdivision
        editorVisible: boolean
        queueOpen: boolean
        shortcutsOpen: boolean
      }>

      interface ContextStore extends Writable<App.UI.Context> {
        enterPracticeMode: () => void
        exitPracticeMode: () => void
        togglePracticeMode: () => void
        setPreviewMode: (value: boolean) => void
        togglePreviewMode: () => void
        enqueue: (name: string, data: App.Groove.Data) => PracticeQueueItem
        removeFromQueue: (id: string) => void
        selectQueueIndex: (index: number) => PracticeQueueItem | null
        nextInQueue: () => PracticeQueueItem | null
        prevInQueue: () => PracticeQueueItem | null
        moveQueueItem: (id: string, direction: -1 | 1) => void
        /** Refresh any queue snapshots that match a saved groove id. */
        syncQueueGroove: (
          grooveId: string,
          name: string,
          data: GrooveData,
        ) => void
        updateQueueItem: (
          entryId: string,
          name: string,
          data: App.Groove.Data,
        ) => void
        setAutoAdvance: (value: boolean) => void
        clearQueue: () => void
        showDrawer: (tab?: DrawerTab) => void
        closeDrawer: () => void
        toggleDrawer: () => void
        setDrawerTab: (tab: DrawerTab) => void
        toggleAbout: (value: boolean) => void
        toggleHelp: (value: boolean) => void
        togglePermutations: () => void
        closePermutations: () => void
        setTheme: (theme: Theme) => void
        setSetting: <K extends keyof Settings>(
          key: K,
          value: Settings[K],
        ) => void
        setStickingMode: (mode: StickingMode) => void
        cycleStickingMode: () => void
        toggleShowTomsPref: () => void
        setShowTomsPref: (value: boolean) => void
        toggleShowLegendPref: () => void
        setShowLegendPref: (value: boolean) => void
        setClickSubdivision: (value: ClickSubdivision) => void
        cycleClickSubdivision: () => void
        toggleEditorVisible: () => void
        setEditorVisible: (value: boolean) => void
        toggleQueueOpen: () => void
        setQueueOpen: (value: boolean) => void
        toggleShortcuts: (value: boolean) => void
        /* @deprecated: openShortcuts, closeShortcuts - use toggleShortcuts instead  */
        // openShortcuts: () => void
        // closeShortcuts: () => void
      }
    }
  }
}

export { }
