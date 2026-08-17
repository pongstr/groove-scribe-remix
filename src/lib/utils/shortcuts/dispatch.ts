import { createShortcutHandlers } from './handlers'
import { createShortcutDefs, matchShortcut } from './registry'
import type { ShortcutDef } from './types'

type UI = App.UI.ContextStore
type Data = App.Groove.ContextStore

/** True when letter/space shortcuts should defer to the focused field. */
export function isTextEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target instanceof HTMLTextAreaElement) return true
  if (target instanceof HTMLSelectElement) return true
  if (target.isContentEditable) return true
  if (target.closest('[contenteditable="true"]')) return true

  if (target instanceof HTMLInputElement) {
    const type = (target.type || 'text').toLowerCase()
    const textLike = new Set([
      'text',
      'search',
      'email',
      'url',
      'tel',
      'password',
      'number',
      'date',
      'datetime-local',
      'month',
      'week',
      'time',
    ])
    return textLike.has(type)
  }

  return false
}

export function isSpaceKey(event: KeyboardEvent): boolean {
  return event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar'
}

function claim(event: KeyboardEvent): void {
  event.preventDefault()
  event.stopImmediatePropagation()
}

/**
 * Builds a stable capture-phase keydown handler closed over store refs.
 * Call once at host mount — do not recreate when groove/UI values change.
 *
 * Do not gate on helpOpen/shortcutsOpen: those flags can desync from the
 * visible dialog (and helpOpen was persisted), which silently killed every
 * letter shortcut while Space still worked via its early path.
 */
export function createShortcutKeydownHandler(
  ui: UI,
  data: Data,
): (event: KeyboardEvent) => void {
  const defs: ShortcutDef[] = createShortcutDefs(
    createShortcutHandlers(ui, data),
  )

  return function onShortcutKeydown(event: KeyboardEvent): void {
    if (event.repeat) return

    if (event.metaKey || event.ctrlKey || event.altKey) {
      const def = matchShortcut(event, defs)

      if (!def) return
      if (isTextEditableTarget(event.target)) return

      claim(event)
      void def.run()

      return
    }

    if (isTextEditableTarget(event.target)) return

    // Space is claimed before match so focused buttons cannot steal play/pause.
    if (isSpaceKey(event)) {
      claim(event)
      void data.togglePlay()
      return
    }

    const def = matchShortcut(event, defs)
    if (!def || def.id === 'playPause') return

    claim(event)
    void def.run()
  }
}
