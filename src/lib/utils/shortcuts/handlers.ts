import { get } from 'svelte/store'

import type { App } from '../context/types'
import {
  applyUiPrefsToGroove,
  cycleClick,
  cycleStickings,
  toggleLegend,
  toggleToms,
} from './sync'
import type { ShortcutId } from './types'

type UI = App.UI.ContextStore
type Data = App.Data.ContextStore

export type ShortcutHandlers = Record<
  ShortcutId,
  () => void | Promise<void>
> & {
  hydrateFromUi: (options?: { quiet?: boolean }) => void
}

/** Build handlers closed over context stores captured during component init. */
export function createShortcutHandlers(ui: UI, data: Data): ShortcutHandlers {
  return {
    playPause: () => {
      void data.togglePlay()
    },

    stop: () => {
      data.stop()
    },

    toggleCountIn: () => {
      data.toggleCountIn()
    },

    prevMeasure: () => {
      data.prevMeasure()
    },

    nextMeasure: () => {
      data.nextMeasure()
    },

    toggleToms: () => toggleToms(ui, data),

    cycleStickings: () => cycleStickings(ui, data),

    toggleLegend: () => toggleLegend(ui, data),

    toggleLibrary: () => {
      if (get(ui).drawer.open) ui.closeDrawer()
      else ui.showDrawer('mine')
    },

    cycleClick: () => cycleClick(ui, data),

    togglePreview: () => {
      ui.togglePreviewMode()
    },

    togglePractice: () => {
      ui.togglePracticeMode()
    },

    toggleEditor: () => {
      ui.toggleEditorVisible()
    },

    repeatOrQueue: () => {
      if (get(ui).practiceMode.active) {
        ui.toggleQueueOpen()
      } else {
        data.toggleLoop()
      }
    },

    undo: () => {
      data.undo()
    },

    redo: () => {
      data.redo()
    },

    openShortcuts: () => {
      ui.toggleShortcuts()
    },

    hydrateFromUi: (options) => applyUiPrefsToGroove(ui, data, options),
  }
}
