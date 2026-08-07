<script lang="ts">
  import Articulations from '$lib/components/groove-editor/components/Articulations.svelte'
  import * as ContextMenu from '$lib/components/ui/context-menu'
  import { cn } from '$lib/utils'
  import {
    LANE_ALT_ARTICULATION,
    LANE_ARTICULATION_META,
    LANE_ARTICULATION_ORDER,
    LANE_DEFAULT_ARTICULATION,
    LANE_META,
    LANE_SHIFT_ARTICULATION,
    type LaneProperty,
    TOM_SAMPLES,
  } from '$lib/utils/config'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { lanes } from '$lib/utils/groove-lanes'
  import { calcNotesPerMeasure } from '$lib/utils/music-math'
  import { isTripletDivision } from '$lib/utils/music-math'
  import { reverseStickingSlot } from '$lib/utils/sticking-display'
  import {
    findTupletGroup,
    TUPLET_SLOT_COUNT,
    tupletSlotCount,
  } from '$lib/utils/tuplet-timing'
  import type {
    LaneId,
    StickingArticulation,
    TupletGroup,
    TupletKind,
  } from '$lib/utils/types'

  let data = getDataContext()
  let ui = getUIContext()
  let playhead = data.playhead

  function previewLaneArticulation(l: LaneId, articulation: string) {
    const artMeta = LANE_ARTICULATION_META[l][articulation]

    if (!artMeta) return

    const sample = l.startsWith('tom')
      ? TOM_SAMPLES[Number(l.slice(3)) - 1]
      : artMeta.sample
    void data.previewSample(sample, artMeta.gain)
  }

  type Props = {
    lane: LaneId
    index: number
    isBeatStart: boolean
    isMeasureStart: boolean
    beatNumber: number | null
  }

  let { lane, index, isBeatStart, isMeasureStart, beatNumber }: Props = $props()

  let value = $derived(lanes($data.groove)[lane][index] ?? null)
  /** Display value may swap R↔L when sticking reverse mode is active. */
  let displayValue = $derived.by(() => {
    if (lane !== 'sticking' || $ui.stickingMode !== 'reverse' || value == null)
      return value
    return reverseStickingSlot(value as StickingArticulation)
  })
  let meta = $derived(
    displayValue ? LANE_ARTICULATION_META[lane][displayValue] : null,
  )

  let laneItem = $derived<LaneProperty>(LANE_META[lane])

  let isPlayhead = $derived($playhead.currentSlot === index)
  let options = $derived(LANE_ARTICULATION_ORDER[lane])
  let articulationMeta = $derived(LANE_ARTICULATION_META[lane])
  let laneLabel = $derived(LANE_META[lane].label)
  let tupletGroups = $derived($data.groove.tupletGroups ?? [])
  let tupletAtCell = $derived(findTupletGroup(tupletGroups, index))
  let straightGrid = $derived(!isTripletDivision($data.groove.division))

  function canPlaceTuplet(kind: TupletKind): boolean {
    if (!straightGrid) return false
    const span = tupletSlotCount(kind)
    const total =
      $data.groove.measures *
      calcNotesPerMeasure($data.groove.division, $data.groove.timeSignature)
    if (index + span > total) return false
    return !tupletGroups.some((g: TupletGroup) => {
      const gSpan = TUPLET_SLOT_COUNT[g.kind]
      const gEnd = g.startSlot + gSpan
      const end = index + span
      return !(end <= g.startSlot || index >= gEnd)
    })
  }

  function assignTuplet(kind: TupletKind) {
    if (!canPlaceTuplet(kind)) return
    data.setTupletAt(index, kind)
  }

  function removeTuplet() {
    data.setTupletAt(index, null)
  }

  function handleClick(e: MouseEvent) {
    let articulation = LANE_DEFAULT_ARTICULATION[lane]
    if (e.shiftKey && LANE_SHIFT_ARTICULATION[lane]) {
      articulation = LANE_SHIFT_ARTICULATION[lane]!
    } else if (e.altKey && LANE_ALT_ARTICULATION[lane]) {
      articulation = LANE_ALT_ARTICULATION[lane]!
    }
    const turningOn = value !== articulation
    data.toggleCell(lane, index, articulation as never)
    if (turningOn) previewLaneArticulation(lane, articulation)
  }

  function handleKeydown(e: KeyboardEvent) {
    // Space is reserved for global play/pause; use Enter to toggle cells.
    if (e.key === 'Enter') {
      e.preventDefault()
      const articulation = LANE_DEFAULT_ARTICULATION[lane]
      const turningOn = value !== articulation
      data.toggleCell(lane, index, articulation as never)
      if (turningOn) previewLaneArticulation(lane, articulation)
    }
  }

  function select(articulation: string) {
    const turningOn = value !== articulation
    data.setCell(lane, index, turningOn ? (articulation as never) : null)
    if (turningOn) previewLaneArticulation(lane, articulation)
  }

  function clear() {
    data.setCell(lane, index, null)
  }

  const ariaLabel = $derived(
    `${laneLabel}, ${beatNumber !== null ? `beat ${beatNumber}` : `step ${index + 1}`}, ${
      meta ? meta.label : 'off'
    }${$ui.stickingMode === 'reverse' && lane === 'sticking' && value ? ' (display reversed)' : ''}`,
  )
</script>

<ContextMenu.Root>
  <ContextMenu.Trigger>
    {#snippet child({ props })}
      <div
        class="bg-background flex aspect-square w-11 touch-manipulation snap-end items-center justify-center select-none"
      >
        <!-- class={cn( -->
        <!--   'relative box-border flex aspect-square w-full items-center justify-center', -->
        <!--   'cursor-pointer border border-transparent bg-secondary/20 transition-colors duration-75 focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 dark:hover:bg-accent/60', -->
        <!--   isBeatStart && !isMeasureStart && 'border-primary/40', -->

        <!--   isMeasureStart && 'border-muted/40', -->
        <!--   value && -->
        <!--     'bg-[color-mix(in_srgb,var(--lane-color)_18%,white)] hover:bg-[color-mix(in_srgb,var(--lane-color)_28%,white)]', -->
        <!--   isPlayhead && -->
        <!--     'bg-[color-mix(in_srgb,var(--lane-color)_45%,white)] ring-2 ring-[color-mix(in_srgb,var(--lane-color)_80%,black)] ring-inset', -->
        <!--   className -->
        <!-- )} -->
        <button
          {...props}
          type="button"
          data-step-slot={index}
          style="--lane-color: var({laneItem.color}); --lane-primary: var({laneItem.bgPrimary}); --lane-secondary: var({laneItem.bgSecondary});"
          aria-pressed={value !== null}
          aria-label={ariaLabel}
          class={cn(
            'group bg-secondary/40 relative box-border flex aspect-square w-full items-center justify-center rounded-[8px] p-0.5 transition-colors',
            isBeatStart && !isMeasureStart && 'bg-(--lane-primary)',
            isMeasureStart && 'bg-(--lane-secondary)',
            isPlayhead && 'border-yellow-500! bg-yellow-500/20!',
            tupletAtCell && 'ring-2 ring-violet-400/70 ring-inset',
          )}
          onclick={(e) => {
            handleClick(e)
          }}
          onkeydown={(e) => {
            const fromTrigger = props.onkeydown as
              ((ev: KeyboardEvent) => void) | undefined
            fromTrigger?.(e)
            handleKeydown(e)
          }}
        >
          <div
            class={cn(
              'bg-background flex aspect-square size-full items-center justify-center rounded-[8px]',
              isPlayhead
                ? 'bg-radial from-yellow-300 from-10% to-yellow-400 text-amber-900'
                : isMeasureStart
                  ? 'bg-background text-(--lane-color)'
                  : 'bg-gray-900/5 text-(--lane-color)',
            )}
          >
            {#if beatNumber !== null}
              <span
                class="pointer-events-none absolute top-1.5 left-1.5 text-xs leading-none"
                aria-hidden="true"
              >
                {beatNumber}
              </span>
            {/if}
            {#if meta}
              <Articulations
                icon={meta.icon}
                class="pointer-events-none size-4"
              />
            {/if}
            {#if tupletAtCell && tupletAtCell.position === 0}
              <span
                class="pointer-events-none absolute right-1 bottom-1 rounded bg-violet-500/15 px-1 text-[0.6rem] font-bold text-violet-700 dark:text-violet-300"
                aria-hidden="true"
              >
                {tupletAtCell.kind === 'triplet' ? '3' : '6'}
              </span>
            {/if}
          </div>
        </button>
      </div>
    {/snippet}
  </ContextMenu.Trigger>

  <ContextMenu.Content class="min-w-48">
    <ContextMenu.Label>{laneLabel}</ContextMenu.Label>
    {#each options as optionId (optionId)}
      {@const optionMeta = articulationMeta[optionId]}
      <ContextMenu.Item
        class={cn(value === optionId && 'bg-accent text-accent-foreground')}
        onclick={() => select(optionId)}
      >
        <Articulations icon={optionMeta.icon} class="size-5 shrink-0" />
        <span>{optionMeta.label}</span>
        {#if optionMeta.shortcut}
          <ContextMenu.Shortcut>
            {optionMeta.shortcut}+click
          </ContextMenu.Shortcut>
        {/if}
      </ContextMenu.Item>
    {/each}
    {#if straightGrid}
      <ContextMenu.Separator />
      <ContextMenu.Label>Rhythm grouping</ContextMenu.Label>
      <ContextMenu.Item
        disabled={!canPlaceTuplet('triplet')}
        onclick={() => assignTuplet('triplet')}
      >
        <span class="w-5 text-center text-sm font-bold">♪</span>
        <span>Triplet (3)</span>
        <ContextMenu.Shortcut>3 in 2</ContextMenu.Shortcut>
      </ContextMenu.Item>
      <ContextMenu.Item
        disabled={!canPlaceTuplet('sixtuplet')}
        onclick={() => assignTuplet('sixtuplet')}
      >
        <span class="w-5 text-center text-sm font-bold">♪</span>
        <span>Sixtuplet (6)</span>
        <ContextMenu.Shortcut>6 in 4</ContextMenu.Shortcut>
      </ContextMenu.Item>
      {#if tupletAtCell}
        <ContextMenu.Item variant="destructive" onclick={removeTuplet}>
          Remove tuplet group
        </ContextMenu.Item>
      {/if}
    {/if}
    <ContextMenu.Separator />
    <ContextMenu.Item variant="destructive" onclick={clear}>
      Clear
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
