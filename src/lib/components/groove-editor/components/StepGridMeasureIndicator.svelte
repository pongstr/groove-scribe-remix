<script lang="ts">
  import { cn } from '$lib/utils'
  import { getDataContext } from '$lib/utils/context'
  import { calcNotesPerMeasure } from '$lib/utils/music-math'

  const data = getDataContext()
  const playhead = data.playhead

  let rootEl = $state<HTMLDivElement | null>(null)
  /** 1-based measure most visible / under edit focus while scrolling. */
  let viewingMeasure = $state(1)

  const notesPerMeasure = $derived(
    calcNotesPerMeasure($data.groove.division, $data.groove.timeSignature),
  )
  const measureCount = $derived($data.groove.measures)
  const slotCount = $derived(notesPerMeasure * measureCount)
  const measures = $derived(
    Array.from({ length: measureCount }, (_, i) => i + 1),
  )

  const playheadMeasure = $derived.by(() => {
    const slot = $playhead.currentSlot
    if (slot < 0 || notesPerMeasure <= 0) return -1
    return Math.floor(slot / notesPerMeasure) + 1
  })

  const highlightedMeasure = $derived(
    playheadMeasure > 0 ? playheadMeasure : viewingMeasure,
  )

  function updateViewingMeasure() {
    const root = rootEl
    if (!root || notesPerMeasure <= 0) return

    const scroller =
      root.closest('[data-step-grid-scroll]') ?? root.parentElement
    if (!(scroller instanceof HTMLElement)) return

    const gutter = 136
    const pad = 12
    const edge = scroller.getBoundingClientRect().left + gutter + pad

    const markers = root.querySelectorAll<HTMLElement>('[data-measure-marker]')
    let best = 1

    for (const marker of markers) {
      const measure = Number(marker.dataset.measureMarker)
      if (!Number.isFinite(measure)) continue
      // Last measure whose start is at or left of the visible grid edge.
      if (marker.getBoundingClientRect().left <= edge + 8) best = measure
    }

    viewingMeasure = best
  }

  $effect(() => {
    void measureCount
    void notesPerMeasure
    void slotCount

    const root = rootEl
    if (!root) return

    const scroller =
      root.closest('[data-step-grid-scroll]') ?? root.parentElement
    if (!(scroller instanceof HTMLElement)) return

    const onScroll = () => updateViewingMeasure()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // After layout settles (cells may resize).
    requestAnimationFrame(onScroll)

    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  })
</script>

<div
  bind:this={rootEl}
  class="bg-background flex w-max min-w-full items-stretch gap-1.5"
  aria-label="Measure {highlightedMeasure} of {measureCount}"
>
  <div
    class="bg-background sticky left-0 z-10 flex w-40 shrink-0 items-center border-r border-b px-2 py-1 text-[0.7rem] font-bold tracking-wide text-slate-500 uppercase md:w-50"
  >
    <span class="truncate">
      {#if measureCount > 1}
        Bar {highlightedMeasure}/{measureCount}
      {:else}
        Bar 1
      {/if}
    </span>
  </div>

  <div
    class="grid flex-1 gap-2 px-1 py-2.5"
    style:grid-template-columns="repeat({slotCount}, minmax(3rem, 1fr))"
    style:width="max(100%, calc({slotCount} * 3rem + {Math.max(
      0,
      slotCount - 1,
    )} * 0.5rem))"
  >
    {#each measures as measure (measure)}
      {@const active = measure === highlightedMeasure}
      <div
        data-measure-marker={measure}
        class={[
          'flex h-1 items-center text-[0.7rem] font-bold tracking-wide uppercase transition-colors',
          active
            ? 'text-foreground bg-yellow-500'
            : 'bg-card/80 text-secondary-foreground',
        ]}
        style:grid-column="span {notesPerMeasure}"
      >
        <span
          class={cn(
            'inline-block  px-1.5 py-0.5 text-amber-950',
            active
              ? 'bg-yellow-500 text-amber-950'
              : 'bg-muted/80 text-muted-foreground',
          )}>Bar {measure}</span
        >
      </div>
    {/each}
  </div>
</div>
