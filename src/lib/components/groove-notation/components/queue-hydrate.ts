import { get } from 'svelte/store'

import { applyUiPrefsToGroove } from '$lib/utils/shortcuts'
import * as db from '$lib/utils/storage/db'

/** Prefer the latest IndexedDB record when a queue item points at a saved groove. */
export async function hydrateQueueItem(
  ui: App.UI.ContextStore,
  item: App.UI.PracticeQueueItem,
): Promise<App.UI.PracticeQueueItem> {
  const grooveId = item.data.id
  if (!grooveId) return item
  try {
    const fresh = await db.getGroove(grooveId)
    if (!fresh) return item
    ui.updateQueueItem(item.id, fresh.name, fresh.data)
    return { ...item, name: fresh.name, data: fresh.data }
  } catch (err) {
    console.error('Failed to hydrate practice queue item', err)
    return item
  }
}

export type PracticeNaturalEndAction = 'ignore' | 'stop' | 'chain'

/** Decide what practice mode should do when the transport reports a natural end. */
export function resolvePracticeNaturalEnd(input: {
  lastNaturalEnd: number
  count: number
  active: boolean
  autoAdvance: boolean
  queueLength: number
  loop: App.Groove.LoopMode
  chainAt: number | null
}): PracticeNaturalEndAction {
  if (!input.active) return 'ignore'
  if (input.count === input.lastNaturalEnd) return 'ignore'
  if (!input.autoAdvance) return 'stop'
  if (input.queueLength < 2) return 'stop'
  if (input.loop === 'loop') return 'ignore'
  if (input.chainAt == null) return 'stop'
  return 'chain'
}

/**
 * Refresh queue snapshots from IndexedDB after entering practice.
 * Reloads the current item into transport when playback is idle so notation
 * and audio share the same measures.
 */
export async function hydrateQueueOnPracticeEnter(
  ui: App.UI.ContextStore,
  data: App.Groove.ContextStore,
): Promise<void> {
  const entered = get(ui).practiceMode
  if (!entered.active) return

  const { queue, currentIndex } = entered
  const current = queue[currentIndex]
  if (current) {
    const resolved = await hydrateQueueItem(ui, current)
    const practice = get(ui).practiceMode
    if (
      practice.active &&
      practice.currentIndex === currentIndex &&
      !get(data).playback.isPlaying
    ) {
      data.load(resolved.data, resolved.name, { clearHistory: false })
      applyUiPrefsToGroove(ui, data, { quiet: true })
    }
  }

  const rest = get(ui).practiceMode.queue.filter((_, i) => i !== currentIndex)
  for (const item of rest) {
    await hydrateQueueItem(ui, item)
  }

  if (!get(ui).practiceMode.active) return
  applyUiPrefsToGroove(ui, data, { quiet: true })
}
