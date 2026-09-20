import { get } from 'svelte/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createEmptyGrooveData } from '$lib/utils/tab-notation'

vi.mock('$app/environment', () => ({ browser: false }))

const { getGroove } = vi.hoisted(() => ({
  getGroove: vi.fn(),
}))

vi.mock('$lib/utils/storage/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/utils/storage/db')>()
  return { ...actual, getGroove }
})

const { createDataContextStore } = await import('$lib/utils/context/data')
const { createUIContextStore } = await import('$lib/utils/context/ui')
const { hydrateQueueOnPracticeEnter, resolvePracticeNaturalEnd } =
  await import('$lib/components/groove-notation/components/queue-hydrate')
const { createScheduler } = await import('$lib/utils/audio/scheduler')

describe('practice + preview modes', () => {
  it('enterPracticeMode loads queue[currentIndex] without changing the queue', () => {
    const a = createEmptyGrooveData({ name: 'A', id: 'a-1' })
    const b = createEmptyGrooveData({ name: 'B', id: 'b-1' })
    const editor = createEmptyGrooveData({ name: 'Editor', id: 'e-1' })

    const data = createDataContextStore({
      groove: editor,
      sourceLabel: 'Editor',
    })
    const ui = createUIContextStore(
      {
        practiceMode: {
          active: false,
          queue: [
            { id: 'q0', name: 'A', data: a },
            { id: 'q1', name: 'B', data: b },
          ],
          currentIndex: 1,
          autoAdvance: true,
        },
      },
      data,
    )

    const queueBefore = get(ui).practiceMode.queue
    ui.enterPracticeMode()

    expect(get(ui).practiceMode.active).toBe(true)
    expect(get(ui).previewMode).toBe(false)
    expect(get(ui).practiceMode.queue).toEqual(queueBefore)
    expect(get(ui).practiceMode.currentIndex).toBe(1)
    expect(get(data).groove.id).toBe('b-1')

    ui.exitPracticeMode()
    expect(get(ui).practiceMode.active).toBe(false)
    expect(get(data).groove.id).toBe('e-1')
    expect(get(data).sourceLabel).toBe('Editor')
    expect(get(ui).practiceMode.queue).toHaveLength(2)
  })

  it('preview mode hides practice and does not mutate the queue', () => {
    const queued = createEmptyGrooveData({ name: 'Queued', id: 'q-1' })
    const data = createDataContextStore({
      groove: createEmptyGrooveData({ name: 'Live', id: 'live-1' }),
      sourceLabel: 'Live',
    })
    const ui = createUIContextStore(
      {
        practiceMode: {
          active: true,
          queue: [{ id: 'q0', name: 'Queued', data: queued }],
          currentIndex: 0,
          autoAdvance: true,
        },
      },
      data,
    )

    ui.setPreviewMode(true)

    expect(get(ui).previewMode).toBe(true)
    expect(get(ui).practiceMode.active).toBe(false)
    expect(get(ui).practiceMode.queue).toHaveLength(1)

    ui.togglePreviewMode()
    expect(get(ui).previewMode).toBe(false)
    expect(get(ui).practiceMode.active).toBe(false)
  })

  it('nextInQueue advances index without enqueueing', () => {
    const a = createEmptyGrooveData({ name: 'A', id: 'a-1' })
    const b = createEmptyGrooveData({ name: 'B', id: 'b-1' })
    const data = createDataContextStore()
    const ui = createUIContextStore(
      {
        practiceMode: {
          active: true,
          queue: [
            { id: 'q0', name: 'A', data: a },
            { id: 'q1', name: 'B', data: b },
          ],
          currentIndex: 0,
          autoAdvance: true,
        },
      },
      data,
    )

    const item = ui.nextInQueue()
    expect(item?.data.id).toBe('b-1')
    expect(get(ui).practiceMode.currentIndex).toBe(1)
    expect(get(ui).practiceMode.queue).toHaveLength(2)
  })
})

describe('practice queue hydrate + natural end', () => {
  beforeEach(() => {
    getGroove.mockReset()
  })

  it('reloads the current idle groove after hydrate when IndexedDB is longer', async () => {
    const short = createEmptyGrooveData({ name: 'A', id: 'g-1', measures: 2 })
    const long = createEmptyGrooveData({ name: 'A', id: 'g-1', measures: 4 })
    getGroove.mockResolvedValue({
      id: 'g-1',
      name: 'A',
      createdAt: 1,
      updatedAt: 1,
      data: long,
    })

    const data = createDataContextStore({
      groove: short,
      sourceLabel: 'A',
    })
    const ui = createUIContextStore(
      {
        practiceMode: {
          active: false,
          queue: [{ id: 'q0', name: 'A', data: short }],
          currentIndex: 0,
          autoAdvance: true,
        },
      },
      data,
    )

    ui.enterPracticeMode()
    expect(get(data).groove.measures).toBe(2)

    await hydrateQueueOnPracticeEnter(ui, data)

    expect(get(data).groove.measures).toBe(4)
    expect(get(ui).practiceMode.currentIndex).toBe(0)
    expect(get(ui).practiceMode.queue[0]?.data.measures).toBe(4)
  })

  it('does not treat a leftover naturalEndCount as a new practice end', () => {
    expect(
      resolvePracticeNaturalEnd({
        lastNaturalEnd: 3,
        count: 3,
        active: true,
        autoAdvance: true,
        queueLength: 2,
        loop: 'once',
        chainAt: 12.5,
      }),
    ).toBe('ignore')
  })

  it('does not advance the queue when chainAt is missing', () => {
    expect(
      resolvePracticeNaturalEnd({
        lastNaturalEnd: 0,
        count: 1,
        active: true,
        autoAdvance: true,
        queueLength: 2,
        loop: 'once',
        chainAt: null,
      }),
    ).toBe('stop')
  })

  it('chains only after a new natural end with a valid chainAt', () => {
    expect(
      resolvePracticeNaturalEnd({
        lastNaturalEnd: 0,
        count: 1,
        active: true,
        autoAdvance: true,
        queueLength: 2,
        loop: 'once',
        chainAt: 4.2,
      }),
    ).toBe('chain')
  })

  it('stop() reports isPlaying false so editor once-mode does not stick', () => {
    let playing = true
    const scheduler = createScheduler({
      getGroove: () => createEmptyGrooveData(),
      getSlotMs: () => 100,
      getTotalSlots: () => 16,
      getCell: () => null,
      getLoop: () => 'once',
      getCountInEnabled: () => false,
      getIsPlaying: () => playing,
      getLoadReady: () => true,
      getCurrentSlot: () => 0,
      getIsCountingIn: () => false,
      patchPlayback: (partial) => {
        if (partial.isPlaying !== undefined) playing = partial.isPlaying
      },
      patchPlayhead: () => {},
      notifyNaturalEnd: () => {},
      onStopped: () => {},
    })

    scheduler.stop()
    expect(playing).toBe(false)
  })

  it('practice session tempo overrides each loaded groove document tempo', async () => {
    const editor = createEmptyGrooveData({
      name: 'Editor',
      id: 'e-1',
      tempo: 100,
    })
    const a = createEmptyGrooveData({ name: 'A', id: 'a-1', tempo: 80 })
    const b = createEmptyGrooveData({
      name: 'B',
      id: 'b-1',
      tempo: 140,
      measures: 4,
    })
    getGroove.mockResolvedValue({
      id: 'b-1',
      name: 'B',
      createdAt: 1,
      updatedAt: 1,
      data: b,
    })

    const data = createDataContextStore({
      groove: editor,
      sourceLabel: 'Editor',
    })
    const ui = createUIContextStore(
      {
        practiceMode: {
          active: false,
          queue: [
            { id: 'q0', name: 'A', data: a },
            { id: 'q1', name: 'B', data: b },
          ],
          currentIndex: 1,
          autoAdvance: true,
        },
      },
      data,
    )

    ui.enterPracticeMode()
    expect(get(data).playback.sessionTempo).toBe(100)
    expect(get(data).groove.id).toBe('b-1')
    expect(get(data).groove.tempo).toBe(100)

    await hydrateQueueOnPracticeEnter(ui, data)
    expect(get(data).groove.tempo).toBe(100)
    expect(get(data).groove.measures).toBe(4)
    expect(get(ui).practiceMode.queue[1]?.data.tempo).toBe(140)

    data.setTempo(110)
    expect(get(data).playback.sessionTempo).toBe(110)
    expect(get(data).groove.tempo).toBe(110)

    data.load(a, 'A', { clearHistory: false, keepTransport: true })
    expect(get(data).groove.id).toBe('a-1')
    expect(get(data).groove.tempo).toBe(110)
    expect(a.tempo).toBe(80)

    ui.exitPracticeMode()
    expect(get(data).playback.sessionTempo).toBeNull()
    expect(get(data).groove.id).toBe('e-1')
    expect(get(data).groove.tempo).toBe(100)
  })
})
