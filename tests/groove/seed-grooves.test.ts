import { describe, expect, it, vi } from 'vitest'

import { createEmptyGrooveData } from '$lib/utils/tab-notation'

async function freshDbModule() {
  const { IDBFactory } = await import('fake-indexeddb')
  vi.stubGlobal('indexedDB', new IDBFactory())
  vi.resetModules()
  return import('$lib/utils/storage/db')
}

describe('storage/seed-grooves', () => {
  it('seeds built-in grooves when the library is empty', async () => {
    const db = await freshDbModule()
    const { seedGroovesIfEmpty, SEED_GROOVE_IDS } =
      await import('$lib/utils/storage/seed-grooves')

    await seedGroovesIfEmpty()

    const list = await db.listGrooves()
    expect(list).toHaveLength(3)
    expect(list.map((g) => g.id).sort()).toEqual(
      [
        SEED_GROOVE_IDS.ghostNotes1,
        SEED_GROOVE_IDS.ghostNotes2,
        SEED_GROOVE_IDS.tied2SlashRolls,
      ].sort(),
    )
    expect(list.find((g) => g.id === SEED_GROOVE_IDS.ghostNotes1)?.name).toBe(
      'Ghost Notes 1',
    )
    expect(list.find((g) => g.id === SEED_GROOVE_IDS.ghostNotes2)?.name).toBe(
      'Ghost Notes 2',
    )
    expect(
      list.find((g) => g.id === SEED_GROOVE_IDS.tied2SlashRolls)?.name,
    ).toBe('Tied 2-Slash Rolls')
  })

  it('adds missing built-in seeds without duplicating existing grooves', async () => {
    const db = await freshDbModule()
    const { seedGroovesIfEmpty, SEED_GROOVE_IDS } =
      await import('$lib/utils/storage/seed-grooves')

    await db.saveGroove('Existing', createEmptyGrooveData({ name: 'Existing' }))
    await seedGroovesIfEmpty()

    const list = await db.listGrooves()
    expect(list.some((g) => g.name === 'Existing')).toBe(true)
    expect(list.some((g) => g.id === SEED_GROOVE_IDS.tied2SlashRolls)).toBe(
      true,
    )
    await seedGroovesIfEmpty()
    expect(await db.listGrooves()).toHaveLength(list.length)
  })

  it('uses ghost-notes-1 as the default editor groove', async () => {
    const { defaultEditorGroove, SEED_GROOVE_IDS } =
      await import('$lib/utils/storage/seed-grooves')

    const groove = defaultEditorGroove()
    expect(groove.id).toBe(SEED_GROOVE_IDS.ghostNotes1)
    expect(groove.name).toBe('Ghost Notes 1')
    expect(groove.snare.some((slot) => slot === 'ghost')).toBe(true)
  })

  it('builds a two-item default practice queue', async () => {
    const { defaultPracticeQueue, SEED_GROOVE_IDS } =
      await import('$lib/utils/storage/seed-grooves')

    const queue = defaultPracticeQueue()
    expect(queue).toHaveLength(2)
    expect(queue[0]?.name).toBe('Ghost Notes 1')
    expect(queue[0]?.data.id).toBe(SEED_GROOVE_IDS.ghostNotes1)
    expect(queue[1]?.name).toBe('Ghost Notes 2')
    expect(queue[1]?.data.id).toBe(SEED_GROOVE_IDS.ghostNotes2)
  })
})
