import type { PracticeQueueItem } from '$lib/utils/context/types'
import type { App } from '$lib/utils/context/types'
import * as db from '$lib/utils/storage/db'

/** Prefer the latest IndexedDB record when a queue item points at a saved groove. */
export async function hydrateQueueItem(
  ui: App.UI.ContextStore,
  item: PracticeQueueItem,
): Promise<PracticeQueueItem> {
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
