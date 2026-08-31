// IndexedDB persistence via `idb`. This replaces the reference app's
// URL-query-string state entirely: user grooves are named records in the
// `grooves` store ("My Grooves"), and the in-progress working groove is
// continuously autosaved to a single `drafts` record so a page refresh never
// loses work (the ergonomic the URL used to provide).
//
// Important: App.Groove.Data often arrives as a Svelte 5 `$state` proxy. Proxies
// cannot be structured-cloned into IndexedDB, so every write path first
// converts the value to a plain JSON object via `toPlain`.

import { type DBSchema, type IDBPDatabase, openDB } from 'idb'

export interface HistoryRecord {
  id: string
  past: App.Groove.Data[]
  future: App.Groove.Data[]
  updatedAt: number
}

interface GrooveDBSchema extends DBSchema {
  grooves: {
    key: string
    value: App.Groove.SavedGroove
    indexes: { 'by-updatedAt': number }
  }
  drafts: {
    key: string
    value: { id: string; data: App.Groove.Data; updatedAt: number }
  }
  history: {
    key: string
    value: HistoryRecord
  }
  practiceQueue: {
    key: string
    value: { id: string; queue: PracticeQueueRecord[]; updatedAt: number }
  }
}

/** Lightweight queue entry stored in IndexedDB (full groove snapshots). */
export type PracticeQueueRecord = {
  id: string
  name: string
  data: App.Groove.Data
}

const DB_NAME = 'groove-studio'
const DB_VERSION = 3
const DRAFT_KEY = 'current'
const HISTORY_KEY = 'current'
const PRACTICE_QUEUE_KEY = 'current'

let dbPromise: Promise<IDBPDatabase<GrooveDBSchema>> | null = null

function getDb(): Promise<IDBPDatabase<GrooveDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<GrooveDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('grooves')) {
          const store = db.createObjectStore('grooves', { keyPath: 'id' })
          store.createIndex('by-updatedAt', 'updatedAt')
        }
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('practiceQueue')) {
          db.createObjectStore('practiceQueue', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Strip Svelte reactive proxies (and any other non-cloneable bits) to a plain value. */
function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export async function listGrooves(): Promise<App.Groove.SavedGroove[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('grooves', 'by-updatedAt')
  return all.reverse()
}

export async function getGroove(
  id: string,
): Promise<App.Groove.SavedGroove | undefined> {
  const db = await getDb()
  return db.get('grooves', id)
}

/** Create a new saved groove, or update an existing one when `existingId` is provided. */
export async function saveGroove(
  name: string,
  data: App.Groove.Data,
  existingId?: string | null,
): Promise<App.Groove.SavedGroove> {
  const db = await getDb()
  const now = Date.now()
  const id = existingId ?? newId()
  const existing = existingId ? await db.get('grooves', existingId) : undefined
  const plain = toPlain(data)
  const record: App.Groove.SavedGroove = {
    id,
    name,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    data: { ...plain, id, name },
  }
  await db.put('grooves', record)
  return record
}

export async function deleteGroove(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('grooves', id)
}

export async function renameGroove(
  id: string,
  name: string,
): Promise<App.Groove.SavedGroove | undefined> {
  const db = await getDb()
  const record = await db.get('grooves', id)
  if (!record) return undefined
  record.name = name
  record.data.name = name
  record.updatedAt = Date.now()
  await db.put('grooves', record)
  return record
}

export async function duplicateGroove(
  id: string,
): Promise<App.Groove.SavedGroove | undefined> {
  const db = await getDb()
  const record = await db.get('grooves', id)
  if (!record) return undefined
  const now = Date.now()
  const id2 = newId()
  const name = `${record.name} copy`
  const copy: App.Groove.SavedGroove = {
    id: id2,
    name,
    createdAt: now,
    updatedAt: now,
    data: { ...toPlain(record.data), id: id2, name },
  }
  await db.put('grooves', copy)
  return copy
}

export async function saveDraft(data: App.Groove.Data): Promise<void> {
  const db = await getDb()
  await db.put('drafts', {
    id: DRAFT_KEY,
    data: toPlain(data),
    updatedAt: Date.now(),
  })
}

export async function loadDraft(): Promise<App.Groove.Data | undefined> {
  const db = await getDb()
  const draft = await db.get('drafts', DRAFT_KEY)
  return draft?.data
}

export async function clearDraft(): Promise<void> {
  const db = await getDb()
  await db.delete('drafts', DRAFT_KEY)
}

export async function saveHistory(
  past: App.Groove.Data[],
  future: App.Groove.Data[],
): Promise<void> {
  const db = await getDb()
  const record: HistoryRecord = {
    id: HISTORY_KEY,
    past: toPlain(past),
    future: toPlain(future),
    updatedAt: Date.now(),
  }
  await db.put('history', record)
}

export async function loadHistory(): Promise<
  { past: App.Groove.Data[]; future: App.Groove.Data[] } | undefined
> {
  const db = await getDb()
  const record = await db.get('history', HISTORY_KEY)
  if (!record) return undefined
  return {
    past: Array.isArray(record.past) ? record.past : [],
    future: Array.isArray(record.future) ? record.future : [],
  }
}

export async function clearHistory(): Promise<void> {
  const db = await getDb()
  await db.delete('history', HISTORY_KEY)
}

export async function savePracticeQueue(
  queue: PracticeQueueRecord[],
): Promise<void> {
  const db = await getDb()
  await db.put('practiceQueue', {
    id: PRACTICE_QUEUE_KEY,
    queue: toPlain(queue),
    updatedAt: Date.now(),
  })
}

export async function loadPracticeQueue(): Promise<
  PracticeQueueRecord[] | undefined
> {
  const db = await getDb()
  const record = await db.get('practiceQueue', PRACTICE_QUEUE_KEY)
  if (!record?.queue?.length) return undefined
  return record.queue
}
