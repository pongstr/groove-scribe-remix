export type ShortcutId =
  | 'playPause'
  | 'stop'
  | 'toggleCountIn'
  | 'prevMeasure'
  | 'nextMeasure'
  | 'toggleToms'
  | 'cycleStickings'
  | 'toggleLegend'
  | 'toggleLibrary'
  | 'cycleClick'
  | 'togglePreview'
  | 'togglePractice'
  | 'toggleEditor'
  | 'repeatOrQueue'
  | 'undo'
  | 'redo'
  | 'openShortcuts'

export type ShortcutGroup =
  'Playback' | 'Display' | 'Panels' | 'Navigation' | 'Edit' | 'Help'

export interface ShortcutKey {
  /** Normalized key from KeyboardEvent.key (e.g. ' ', 'q', 'h'). */
  key: string
  /** Optional KeyboardEvent.code (e.g. 'KeyA') — layout-stable physical key. */
  code?: string
  shift?: boolean
  alt?: boolean
  meta?: boolean
  ctrl?: boolean
}

export interface ShortcutDef {
  id: ShortcutId
  /** Keys that trigger this shortcut (any match). */
  keys: ShortcutKey[]
  /** Human-readable key chord for the modal (e.g. "Space", "Q"). */
  keysLabel: string
  label: string
  group: ShortcutGroup
  /** Optional predicate; when false the shortcut is ignored. */
  when?: () => boolean
  run: () => void | Promise<void>
}
