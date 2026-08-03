import { get } from 'svelte/store'
import { describe, expect, it, vi } from 'vitest'

import { createEmptyGrooveData } from '$lib/utils/tab-notation'

vi.mock('$app/environment', () => ({ browser: false }))

const { createDataContextStore } = await import('$lib/utils/context/data')
const { createUIContextStore } = await import('$lib/utils/context/ui')

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
    expect(get(data).groove.id).toBe('b-1')
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
