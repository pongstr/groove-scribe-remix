import type { ShortcutHandlers } from './handlers'
import type {
  ShortcutDef,
  ShortcutGroup,
  ShortcutId,
  ShortcutKey,
} from './types'

interface ShortcutMeta {
  id: ShortcutId
  keys: ShortcutKey[]
  keysLabel: string
  label: string
  group: ShortcutGroup
}

/** Static binding metadata — safe to use outside components (e.g. modal). */
const meta: ShortcutMeta[] = [
  {
    id: 'playPause',
    keys: [{ key: ' ', code: 'Space' }],
    keysLabel: 'Space',
    label: 'Play / pause',
    group: 'Playback',
  },
  {
    id: 'stop',
    keys: [{ key: 'd', code: 'KeyD' }],
    keysLabel: 'D',
    label: 'Stop',
    group: 'Playback',
  },
  {
    id: 'toggleCountIn',
    keys: [{ key: 'b', code: 'KeyB' }],
    keysLabel: 'B',
    label: 'Toggle count-in',
    group: 'Playback',
  },
  {
    id: 'prevMeasure',
    keys: [{ key: 'a', code: 'KeyA' }],
    keysLabel: 'A',
    label: 'Previous measure',
    group: 'Playback',
  },
  {
    id: 'nextMeasure',
    keys: [{ key: 's', code: 'KeyS' }],
    keysLabel: 'S',
    label: 'Next measure',
    group: 'Playback',
  },
  {
    id: 'repeatOrQueue',
    keys: [{ key: 'c', code: 'KeyC' }],
    keysLabel: 'C',
    label: 'Repeat groove (edit) / toggle queue (practice)',
    group: 'Playback',
  },
  {
    id: 'cycleClick',
    keys: [{ key: 'z', code: 'KeyZ' }],
    keysLabel: 'Z',
    label: 'Cycle click (off → quarter → eighth → 16th)',
    group: 'Playback',
  },
  {
    id: 'undo',
    keys: [{ key: 'u', code: 'KeyU' }],
    keysLabel: 'U',
    label: 'Undo',
    group: 'Edit',
  },
  {
    id: 'redo',
    keys: [{ key: 'y', code: 'KeyY' }],
    keysLabel: 'Y',
    label: 'Redo',
    group: 'Edit',
  },
  {
    id: 'toggleToms',
    keys: [{ key: 'q', code: 'KeyQ' }],
    keysLabel: 'Q',
    label: 'Toggle toms visibility',
    group: 'Display',
  },
  {
    id: 'cycleStickings',
    keys: [{ key: 'w', code: 'KeyW' }],
    keysLabel: 'W',
    label: 'Cycle stickings (off → visible → reverse)',
    group: 'Display',
  },
  {
    id: 'toggleLegend',
    keys: [{ key: 'e', code: 'KeyE' }],
    keysLabel: 'E',
    label: 'Toggle notation key',
    group: 'Display',
  },
  {
    id: 'toggleLibrary',
    keys: [{ key: 'g', code: 'KeyG' }],
    keysLabel: 'G',
    label: 'Toggle groove library',
    group: 'Panels',
  },
  {
    id: 'toggleEditor',
    keys: [{ key: 'x', code: 'KeyX' }],
    keysLabel: 'X',
    label: 'Toggle groove editor',
    group: 'Panels',
  },
  {
    id: 'togglePreview',
    keys: [{ key: 'v', code: 'KeyV' }],
    keysLabel: 'V',
    label: 'Toggle preview mode (hide groove editor)',
    group: 'Navigation',
  },
  {
    id: 'togglePractice',
    keys: [{ key: 'p', code: 'KeyP' }],
    keysLabel: 'P',
    label: 'Toggle practice mode',
    group: 'Navigation',
  },
  {
    id: 'openShortcuts',
    keys: [{ key: 'h', code: 'KeyH' }],
    keysLabel: 'H',
    label: 'Toggle keyboard shortcuts',
    group: 'Help',
  },
]

function keyMatches(event: KeyboardEvent, chord: ShortcutKey): boolean {
  const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key
  const chordKey = chord.key.length === 1 ? chord.key.toLowerCase() : chord.key
  const keyOk =
    eventKey === chordKey || (chord.code != null && event.code === chord.code)
  if (!keyOk) return false
  if (Boolean(chord.shift) !== event.shiftKey) return false
  if (Boolean(chord.alt) !== event.altKey) return false
  if (Boolean(chord.meta) !== event.metaKey) return false
  if (Boolean(chord.ctrl) !== event.ctrlKey) return false
  return true
}

export function createShortcutDefs(handlers: ShortcutHandlers): ShortcutDef[] {
  return meta.map((item) => ({
    ...item,
    run: handlers[item.id],
  }))
}

export function getShortcutDefs(): Omit<ShortcutDef, 'run'>[] {
  return meta
}

export function getShortcutById(id: ShortcutId): ShortcutMeta | undefined {
  return meta.find((d) => d.id === id)
}

export function matchShortcut(
  event: KeyboardEvent,
  defs: ShortcutDef[],
): ShortcutDef | undefined {
  // Ignore chorded system shortcuts (⌘S etc.) unless a def opts into modifiers.
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return defs.find(
      (def) =>
        (!def.when || def.when()) &&
        def.keys.some(
          (k) => (k.meta || k.ctrl || k.alt) && keyMatches(event, k),
        ),
    )
  }

  return defs.find(
    (def) =>
      (!def.when || def.when()) && def.keys.some((k) => keyMatches(event, k)),
  )
}

export function shortcutsByGroup(): { group: string; items: ShortcutMeta[] }[] {
  const order = [
    'Playback',
    'Display',
    'Panels',
    'Navigation',
    'Edit',
    'Help',
  ] as const
  return order
    .map((group) => ({
      group,
      items: meta.filter((d) => d.group === group),
    }))
    .filter((g) => g.items.length > 0)
}
