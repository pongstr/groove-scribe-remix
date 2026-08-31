// Built-in starter grooves shipped with the app. On first launch these are
// written to IndexedDB ("My Grooves"), loaded into the editor when no draft
// exists, and used as the default practice queue.

import { normalizeGrooveData } from '$lib/utils/snare-modifiers'
import * as db from '$lib/utils/storage/db'
import ghostNotes1 from '$lib/utils/storage/seed/ghost-notes-1.groove.json'
import ghostNotes2 from '$lib/utils/storage/seed/ghost-notes-2.groove.json'
import tied2SlashRolls from '$lib/utils/storage/seed/tied-2-slash-rolls.groove.json'

export const SEED_GROOVE_IDS = {
  ghostNotes1: 'seed-ghost-notes-1',
  ghostNotes2: 'seed-ghost-notes-2',
  tied2SlashRolls: 'seed-tied-2-slash-rolls',
} as const

const SEED_SOURCES = [
  {
    id: SEED_GROOVE_IDS.ghostNotes1,
    raw: ghostNotes1 as App.Groove.Data,
  },
  {
    id: SEED_GROOVE_IDS.ghostNotes2,
    raw: ghostNotes2 as App.Groove.Data,
  },
  {
    id: SEED_GROOVE_IDS.tied2SlashRolls,
    raw: tied2SlashRolls as unknown as App.Groove.Data,
  },
] as const

function cloneGroove(data: App.Groove.Data): App.Groove.Data {
  return JSON.parse(JSON.stringify(data)) as App.Groove.Data
}

export function seedGrooveData(
  id: string,
  raw: App.Groove.Data,
): App.Groove.Data {
  const data = cloneGroove(raw)
  data.id = id
  data.name = raw.name
  normalizeGrooveData(data)
  return data
}

export function defaultEditorGroove(): App.Groove.Data {
  return seedGrooveData(
    SEED_GROOVE_IDS.ghostNotes1,
    ghostNotes1 as App.Groove.Data,
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
        ghostNotes2 as App.Groove.Data,
      ),
    },
  ]
}

/** Add any built-in starter grooves that are not already in "My Grooves". */
export async function seedGroovesIfEmpty(): Promise<void> {
  const existing = await db.listGrooves()
  const existingIds = new Set(existing.map((g) => g.id))

  for (const seed of SEED_SOURCES) {
    if (existingIds.has(seed.id)) continue
    const data = seedGrooveData(seed.id, seed.raw)
    await db.saveGroove(data.name, data, seed.id)
  }
}
