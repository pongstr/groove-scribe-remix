import { get } from 'svelte/store'

import type { App, ClickSubdivision } from '../context/types'

type UI = App.UI.ContextStore
type Data = App.Data.ContextStore

/** Mirror persisted UI display prefs onto the live groove so renderers stay in sync. */
export function applyUiPrefsToGroove(
  ui: UI,
  data: Data,
  options?: { quiet?: boolean },
): void {
  const prefs = get(ui)
  const payload = {
    showToms: prefs.showToms,
    showLegend: prefs.showLegend,
    showStickings: prefs.stickingMode !== 'off',
    metronomeSubdivision: prefs.clickSubdivision,
  }

  if (options?.quiet) {
    data.applyDisplayPrefs(payload)
    return
  }

  data.setShowToms(payload.showToms)
  data.setShowLegend(payload.showLegend)
  data.setShowStickings(payload.showStickings)
  if (get(data).groove.metronomeSubdivision !== payload.metronomeSubdivision) {
    data.setMetronomeSubdivision(payload.metronomeSubdivision)
  }
}

export function setShowToms(ui: UI, data: Data, value: boolean): void {
  ui.setShowTomsPref(value)
  applyUiPrefsToGroove(ui, data)
}

export function toggleToms(ui: UI, data: Data): void {
  ui.toggleShowTomsPref()
  applyUiPrefsToGroove(ui, data)
}

export function cycleStickings(ui: UI, data: Data): void {
  ui.cycleStickingMode()
  applyUiPrefsToGroove(ui, data)
}

export function setStickingVisible(ui: UI, data: Data, visible: boolean): void {
  const current = get(ui).stickingMode
  if (visible) {
    ui.setStickingMode(current === 'reverse' ? 'reverse' : 'visible')
  } else {
    ui.setStickingMode('off')
  }
  applyUiPrefsToGroove(ui, data)
}

export function setShowLegend(ui: UI, data: Data, value: boolean): void {
  ui.setShowLegendPref(value)
  applyUiPrefsToGroove(ui, data)
}

export function toggleLegend(ui: UI, data: Data): void {
  ui.toggleShowLegendPref()
  applyUiPrefsToGroove(ui, data)
}

export function setClickSubdivision(
  ui: UI,
  data: Data,
  value: ClickSubdivision,
): void {
  ui.setClickSubdivision(value)
  applyUiPrefsToGroove(ui, data)
}

export function cycleClick(ui: UI, data: Data): void {
  ui.cycleClickSubdivision()
  applyUiPrefsToGroove(ui, data)
}
