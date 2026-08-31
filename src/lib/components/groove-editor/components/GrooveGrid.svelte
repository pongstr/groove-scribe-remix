<script lang="ts">
  import StepGrid from '$lib/components/groove-editor/components/StepGrid.svelte'
  import { cn } from '$lib/utils'
  import { getDataContext, getUIContext } from '$lib/utils/context'

  /** Fallback if sticky lane gutter isn't measurable yet (`w-40` / `md:w-50`). */
  const LANE_LABEL_WIDTH_PX = 160

  let data = getDataContext()
  let playhead = data.playhead
  let ui = getUIContext()
  let scrollEl = $state<HTMLDivElement | null>(null)

  /** Previous playhead slot — used to detect groove loop wrap (end → start). */
  let prevScrollSlot = $state(-1)

  const MOUSE_DRAG_THRESHOLD_PX = 5

  let mouseDragPointerId = $state<number | null>(null)
  let mouseDragStartX = 0
  let mouseDragStartScrollLeft = 0
  let isMouseDragging = $state(false)
  let suppressClick = false

  function canMouseDragScroll(): boolean {
    return !$data.playback.isPlaying
  }

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !canMouseDragScroll())
      return

    const el = scrollEl
    if (!el) return

    mouseDragPointerId = e.pointerId
    mouseDragStartX = e.clientX
    mouseDragStartScrollLeft = el.scrollLeft
    isMouseDragging = false
    // Capture only after drag threshold — immediate capture blocks button clicks.
  }

  function onPointerMove(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || mouseDragPointerId !== e.pointerId) return
    if (!canMouseDragScroll()) {
      endMouseDrag(e)
      return
    }

    const el = scrollEl
    if (!el) return

    const dx = e.clientX - mouseDragStartX
    if (!isMouseDragging && Math.abs(dx) < MOUSE_DRAG_THRESHOLD_PX) return

    if (!isMouseDragging) {
      isMouseDragging = true
      suppressClick = true
      el.setPointerCapture(e.pointerId)
    }

    el.scrollLeft = mouseDragStartScrollLeft - dx
    e.preventDefault()
  }

  function endMouseDrag(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || mouseDragPointerId !== e.pointerId) return

    const el = scrollEl
    const didDrag = isMouseDragging

    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId)
    }

    mouseDragPointerId = null
    isMouseDragging = false

    if (didDrag) {
      suppressClick = true
      requestAnimationFrame(() => {
        suppressClick = false
      })
    }
  }

  function onClickCapture(e: MouseEvent) {
    if (suppressClick) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  $effect(() => {
    if (!$data.playback.isPlaying || mouseDragPointerId === null) return

    const el = scrollEl
    const pointerId = mouseDragPointerId
    isMouseDragging = false
    mouseDragPointerId = null

    if (el?.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId)
    }
  })

  function gutterWidth(el: HTMLElement): number {
    const gutterEl = el.querySelector('.sticky.left-0')
    return gutterEl instanceof HTMLElement
      ? gutterEl.offsetWidth
      : LANE_LABEL_WIDTH_PX
  }

  /**
   * Scroll only when the playhead is about to leave the viewport (or after a
   * loop wrap). Instant — no smooth scroll, no continuous pinning.
   */
  function syncPlayheadScroll(el: HTMLElement, slot: number, wrapped: boolean) {
    const cell = el.querySelector(`[data-step-slot="${slot}"]`)
    if (!(cell instanceof HTMLElement)) return

    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll <= 0) return

    const containerRect = el.getBoundingClientRect()
    const cellRect = cell.getBoundingClientRect()
    const cellWidth = Math.max(1, cellRect.width)
    const pad = 12
    const visibleLeft = containerRect.left + gutterWidth(el) + pad
    const visibleRight = containerRect.right - pad
    const visibleWidth = Math.max(1, visibleRight - visibleLeft)

    // Page before the active cell reaches the right edge (~2–3 cells of lead).
    const lead = Math.min(cellWidth * 3, visibleWidth * 0.3)
    const rightLimit = visibleRight - lead

    const pageForward = cellRect.right > rightLimit
    const pageBack = wrapped || cellRect.right < visibleLeft

    if (!pageForward && !pageBack) return

    // After paging, park the playhead near the left so the next stretch is visible.
    const targetX = visibleLeft + Math.min(cellWidth, visibleWidth * 0.08)
    el.scrollLeft = Math.max(
      0,
      Math.min(maxScroll, el.scrollLeft + (cellRect.left - targetX)),
    )
  }

  $effect(() => {
    if ($ui.practiceMode.active) return
    // Depend on playhead only — use get(data) so groove edits do not re-scroll.
    const slot = $playhead.currentSlot
    const el = scrollEl

    if (slot < 0 || !el) {
      prevScrollSlot = slot
      return
    }

    const playing = $data.playback.isPlaying
    const wrapped = playing && prevScrollSlot >= 0 && slot < prevScrollSlot
    prevScrollSlot = slot
    syncPlayheadScroll(el, slot, wrapped)
  })
</script>

<div
  bind:this={scrollEl}
  data-step-grid-scroll
  role="region"
  aria-label="Groove step grid"
  class={cn(
    'w-full max-w-full min-w-0 shrink-0 scrollbar-none overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch]',
    // Snap fights programmatic follow during playback (esp. 1/32 / fast tempos).
    !$data.playback.isPlaying &&
      !isMouseDragging &&
      'touch-pan-x snap-x snap-mandatory',
    canMouseDragScroll() && !isMouseDragging && 'cursor-grab',
    isMouseDragging && 'cursor-grabbing select-none',
    $data.playback.isPlaying && 'touch-none',
  )}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={endMouseDrag}
  onpointercancel={endMouseDrag}
  onclickcapture={onClickCapture}
  onwheel={(e) => {
    if ($data.playback.isPlaying) e.preventDefault()
  }}
>
  <StepGrid />
</div>
