import { describe, expect, it, vi } from 'vitest'

import { createEmptyGrooveData } from '$lib/utils/tab-notation'

async function freshDbModule() {
  // Reset the module registry and swap in a brand new in-memory IndexedDB
  // instance so each test gets a fully isolated database (db.ts caches its
  // connection promise at module scope, so a plain re-import would reuse it).
  const { IDBFactory } = await import('fake-indexeddb')
  vi.stubGlobal('indexedDB', new IDBFactory())
  vi.resetModules()
  return import('$lib/utils/storage/db')
}

describe('storage/db', () => {
  it('saves and lists grooves, most-recently-updated first', async () => {
    const db = await freshDbModule()
    const a = createEmptyGrooveData({ name: 'Groove A' })
    const b = createEmptyGrooveData({ name: 'Groove B' })

    const recordA = await db.saveGroove('Groove A', a)
    await new Promise((r) => setTimeout(r, 5))
    const recordB = await db.saveGroove('Groove B', b)

    const list = await db.listGrooves()
    expect(list.map((g) => g.id)).toEqual([recordB.id, recordA.id])
  })

  it('updates an existing groove in place when given an id', async () => {
    const db = await freshDbModule()
    const data = createEmptyGrooveData({ name: 'Original' })
    const created = await db.saveGroove('Original', data)

    data.hiHat[0] = 'normal'
    const updated = await db.saveGroove('Renamed', data, created.id)

    expect(updated.id).toBe(created.id)
    expect(updated.createdAt).toBe(created.createdAt)
    const fetched = await db.getGroove(created.id)
    expect(fetched?.name).toBe('Renamed')
    expect(fetched?.data.hiHat[0]).toBe('normal')

    const list = await db.listGrooves()
    expect(list).toHaveLength(1)
  })

  it('deletes a groove', async () => {
    const db = await freshDbModule()
    const record = await db.saveGroove('To delete', createEmptyGrooveData())
    await db.deleteGroove(record.id)
    expect(await db.getGroove(record.id)).toBeUndefined()
    expect(await db.listGrooves()).toHaveLength(0)
  })

  it('renames a groove', async () => {
    const db = await freshDbModule()
    const record = await db.saveGroove('Old name', createEmptyGrooveData())
    const renamed = await db.renameGroove(record.id, 'New name')
    expect(renamed?.name).toBe('New name')
    expect((await db.getGroove(record.id))?.data.name).toBe('New name')
  })

  it('duplicates a groove with a new id and "copy" suffix', async () => {
    const db = await freshDbModule()
    const record = await db.saveGroove('Original', createEmptyGrooveData())
    const copy = await db.duplicateGroove(record.id)
    expect(copy).toBeDefined()
    expect(copy!.id).not.toBe(record.id)
    expect(copy!.name).toBe('Original copy')
    expect(await db.listGrooves()).toHaveLength(2)
  })

  it('round-trips the autosave draft', async () => {
    const db = await freshDbModule()
    expect(await db.loadDraft()).toBeUndefined()
    const data = createEmptyGrooveData({ name: 'Draft groove' })
    await db.saveDraft(data)
    const loaded = await db.loadDraft()
    expect(loaded?.name).toBe('Draft groove')
    await db.clearDraft()
    expect(await db.loadDraft()).toBeUndefined()
  })
})
