export {
  createShortcutKeydownHandler,
  isSpaceKey,
  isTextEditableTarget,
} from './dispatch'
export { createShortcutHandlers, type ShortcutHandlers } from './handlers'
export {
  createShortcutDefs,
  getShortcutById,
  getShortcutDefs,
  matchShortcut,
  shortcutsByGroup,
} from './registry'
export {
  applyUiPrefsToGroove,
  cycleClick,
  cycleStickings,
  setClickSubdivision,
  setShowLegend,
  setShowToms,
  setStickingVisible,
  toggleLegend,
  toggleToms,
} from './sync'
export type {
  ShortcutDef,
  ShortcutGroup,
  ShortcutId,
  ShortcutKey,
} from './types'
