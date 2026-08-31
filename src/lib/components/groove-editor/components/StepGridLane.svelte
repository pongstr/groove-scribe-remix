<script lang="ts">
  import { BrushCleaning } from '@lucide/svelte'

  import StepGridLaneItem from '$lib/components/groove-editor/components/StepGridLaneItem.svelte'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import { cn } from '$lib/utils'
  import { LANE_META } from '$lib/utils/config'
  import { getDataContext } from '$lib/utils/context'
  import { calcNotesPerMeasure, noteGroupingSize } from '$lib/utils/music-math'

  interface Props {
    lane: App.Groove.LaneId
    onClear?: () => void
    class?: string
  }

  let { lane, onClear, class: className }: Props = $props()
  let data = getDataContext()

  let meta = $derived(LANE_META[lane])
  let notesPerMeasure = $derived(
    calcNotesPerMeasure($data.groove.division, $data.groove.timeSignature),
  )
  let slotCount = $derived(notesPerMeasure * $data.groove.measures)
  let groupSize = $derived(
    Math.max(
      1,
      Math.round(noteGroupingSize(notesPerMeasure, $data.groove.timeSignature)),
    ),
  )
  const indices = $derived(Array.from({ length: slotCount }, (_, i) => i))
</script>

<div class={cn('group flex w-max min-w-full items-stretch gap-x-1', className)}>
  <div
    class="bg-background/95 sticky left-0 z-20 flex h-14 w-40 shrink-0 cursor-default flex-row-reverse items-center gap-2 overflow-hidden px-2 text-[0.8rem] font-semibold text-(--lane-color) backdrop-blur-xs transition-colors select-none hover:bg-neutral-800/40 md:w-50"
    style="--lane-color: var({meta.color}); --lane-bg: var({meta.bgSecondary})"
  >
    <div
      aria-hidden="true"
      class="absolute right-4 bottom-6.5 size-2 bg-(--lane-bg)"
    ></div>

    <span class="block min-w-0 flex-1 truncate whitespace-nowrap">
      {meta.label}
    </span>

    {#if onClear}
      <ButtonWithTooltip
        variant="ghost"
        size="icon"
        class="hover:text-foreground text-muted-foreground/70 aspect-square size-5 transition-colors hover:bg-transparent!"
        onclick={onClear}
        content="Clear {meta.label} lane"
        aria-label="Clear {meta.label} lane"
        tooltipContentProps={{ side: 'right', align: 'center' }}
      >
        <BrushCleaning class="size-4" />
      </ButtonWithTooltip>
    {/if}
  </div>

  <div
    class="relative z-10 grid flex-1 gap-x-0.5 gap-y-0 p-1"
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
