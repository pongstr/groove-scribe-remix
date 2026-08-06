import { describe, expect, it, vi } from 'vitest'

import { createEmptyGrooveData } from '$lib/utils/tab-notation'

async function freshDbModule() {
  const { IDBFactory } = await import('fake-indexeddb')
  vi.stubGlobal('indexedDB', new IDBFactory())
  vi.resetModules()
  return import('$lib/utils/storage/db')
}

describe('storage/seed-grooves', () => {
  it('seeds both ghost-note grooves when the library is empty', async () => {
    const db = await freshDbModule()
    const { seedGroovesIfEmpty, SEED_GROOVE_IDS } = await import(
      '$lib/utils/storage/seed-grooves'
    )

    await seedGroovesIfEmpty()

    const list = await db.listGrooves()
    expect(list).toHaveLength(2)
    expect(list.map((g) => g.id).sort()).toEqual(
      [SEED_GROOVE_IDS.ghostNotes1, SEED_GROOVE_IDS.ghostNotes2].sort(),
    )
    expect(list.find((g) => g.id === SEED_GROOVE_IDS.ghostNotes1)?.name).toBe(
      'Ghost Notes 1',
    )
    expect(list.find((g) => g.id === SEED_GROOVE_IDS.ghostNotes2)?.name).toBe(
      'Ghost Notes 2',
    )
  })

  it('does not re-seed when grooves already exist', async () => {
    const db = await freshDbModule()
    const { seedGroovesIfEmpty } = await import('$lib/utils/storage/seed-grooves')

    await db.saveGroove('Existing', createEmptyGrooveData({ name: 'Existing' }))
    await seedGroovesIfEmpty()

    expect(await db.listGrooves()).toHaveLength(1)
  })

  it('uses ghost-notes-1 as the default editor groove', async () => {
    const { defaultEditorGroove, SEED_GROOVE_IDS } = await import(
      '$lib/utils/storage/seed-grooves'
    )

    const groove = defaultEditorGroove()
    expect(groove.id).toBe(SEED_GROOVE_IDS.ghostNotes1)
    expect(groove.name).toBe('Ghost Notes 1')
    expect(groove.snare.some((slot) => slot === 'ghost')).toBe(true)
  })

  it('builds a two-item default practice queue', async () => {
    const { defaultPracticeQueue, SEED_GROOVE_IDS } = await import(
      '$lib/utils/storage/seed-grooves'
    )

    const queue = defaultPracticeQueue()
    expect(queue).toHaveLength(2)
    expect(queue[0]?.name).toBe('Ghost Notes 1')
    expect(queue[0]?.data.id).toBe(SEED_GROOVE_IDS.ghostNotes1)
    expect(queue[1]?.name).toBe('Ghost Notes 2')
    expect(queue[1]?.data.id).toBe(SEED_GROOVE_IDS.ghostNotes2)
  })
})
