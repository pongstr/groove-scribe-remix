<script lang="ts">
  import { CircleX } from '@lucide/svelte'

  import StepGridLaneItem from '$lib/components/groove-editor/components/StepGridLaneItem.svelte'
  import { cn } from '$lib/utils'
  import { LANE_META } from '$lib/utils/config'
  import { getDataContext } from '$lib/utils/context'
  import { calcNotesPerMeasure, noteGroupingSize } from '$lib/utils/music-math'
  import type { LaneId } from '$lib/utils/types'

  interface Props {
    lane: LaneId
    onClear?: () => void
    class?: string
  }

  let { lane, onClear, class: className }: Props = $props()

  const data = getDataContext()

  const meta = $derived(LANE_META[lane])
  const notesPerMeasure = $derived(
    calcNotesPerMeasure($data.groove.division, $data.groove.timeSignature),
  )
  const slotCount = $derived(notesPerMeasure * $data.groove.measures)
  const groupSize = $derived(
    Math.max(
      1,
      Math.round(noteGroupingSize(notesPerMeasure, $data.groove.timeSignature)),
    ),
  )
  const indices = $derived(Array.from({ length: slotCount }, (_, i) => i))
</script>

<div class={cn('group flex w-max min-w-full items-stretch gap-x-2', className)}>
  <div
    class="bg-background/95 sticky left-0 z-20 flex w-40 shrink-0 cursor-default items-center gap-2 border-r border-b pr-2 text-[0.8rem] font-semibold text-(--lane-color) backdrop-blur-xs md:w-50"
    style="--lane-color: var({meta.color}); --lane-bg: var({meta.bgSecondary})"
  >
    <span
      class="ml-px h-[calc(100%-2px)] w-1 shrink-0 bg-(--lane-bg)"
      aria-hidden="true"
    ></span>
    <span class="min-w-0 flex-1 truncate whitespace-nowrap">{meta.label}</span>
    {#if onClear}
      <button
        type="button"
        class="size-4 text-slate-400 hover:bg-transparent hover:text-red-500"
        onclick={onClear}
        title="Clear {meta.label} lane"
        aria-label="Clear {meta.label} lane"
      >
        <CircleX class="size-4" />
      </button>
    {/if}
  </div>

  <div
    class="relative z-10 grid flex-1 gap-2 p-1"
    style:grid-template-columns="repeat({slotCount}, minmax(2.5rem, 1fr))"
    style:width="max(100%, calc({slotCount} * 2.5rem + {Math.max(
      0,
      slotCount - 1,
    )} * 0.5rem))"
  >
    {#each indices as index (index)}
      {@const isMeasureStart = index % notesPerMeasure === 0}
      {@const isBeatStart = index % groupSize === 0}
      {@const beatNumber = isBeatStart
        ? (Math.floor((index % notesPerMeasure) / groupSize) % 99) + 1
        : null}
      <StepGridLaneItem
        {lane}
        {index}
        {isBeatStart}
        {isMeasureStart}
        {beatNumber}
      />
    {/each}
  </div>
</div>
