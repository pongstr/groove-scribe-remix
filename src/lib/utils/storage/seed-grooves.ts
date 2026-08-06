// Built-in starter grooves shipped with the app. On first launch these are
// written to IndexedDB ("My Grooves"), loaded into the editor when no draft
// exists, and used as the default practice queue.

import * as db from '$lib/utils/storage/db'
import ghostNotes1 from '$lib/utils/storage/seed/ghost-notes-1.groove.json'
import ghostNotes2 from '$lib/utils/storage/seed/ghost-notes-2.groove.json'
import type { GrooveData } from '$lib/utils/types'

export const SEED_GROOVE_IDS = {
  ghostNotes1: 'seed-ghost-notes-1',
  ghostNotes2: 'seed-ghost-notes-2',
} as const

const SEED_SOURCES = [
  {
    id: SEED_GROOVE_IDS.ghostNotes1,
    raw: ghostNotes1 as GrooveData,
  },
  {
    id: SEED_GROOVE_IDS.ghostNotes2,
    raw: ghostNotes2 as GrooveData,
  },
] as const

function cloneGroove(data: GrooveData): GrooveData {
  return JSON.parse(JSON.stringify(data)) as GrooveData
}

export function seedGrooveData(id: string, raw: GrooveData): GrooveData {
  const data = cloneGroove(raw)
  data.id = id
  data.name = raw.name
  if (data.showLegend === undefined) data.showLegend = false
  if (data.kickStemsUp === undefined) data.kickStemsUp = true
  return data
}

export function defaultEditorGroove(): GrooveData {
  return seedGrooveData(
    SEED_GROOVE_IDS.ghostNotes1,
    ghostNotes1 as GrooveData,
  )
}

export function defaultPracticeQueue(): App.UI.PracticeQueueItem[] {
  return [
    {
      id: 'q_seed_ghost_notes_1',
      name: 'Ghost Notes 1',
      data: defaultEditorGroove(),
    },
    {
      id: 'q_seed_ghost_notes_2',
      name: 'Ghost Notes 2',
      data: seedGrooveData(
        SEED_GROOVE_IDS.ghostNotes2,
        ghostNotes2 as GrooveData,
      ),
    },
  ]
}

/** Populate "My Grooves" with starter grooves when the library is empty. */
export async function seedGroovesIfEmpty(): Promise<void> {
  const existing = await db.listGrooves()
  if (existing.length > 0) return

  for (const seed of SEED_SOURCES) {
    const data = seedGrooveData(seed.id, seed.raw)
    await db.saveGroove(data.name, data, seed.id)
  }
}
