<script lang="ts">
  import { slide } from 'svelte/transition'
  import {
    CircleParking,
    Pause,
    Play,
    RotateCw,
    Square,
    Timer,
  } from '@lucide/svelte'

  import PlaybackClick from '$lib/components/groove-toolbar/components/PlaybackClick.svelte'
  import PlaybackClickControl from '$lib/components/groove-toolbar/components/PlaybackClickControl.svelte'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import * as ButtonGroup from '$lib/components/ui/button-group/index'
  import ToggleWithTooltip from '$lib/components/ui/toggle/toggle-with-tooltip.svelte'
  import { getDataContext, getUIContext } from '$lib/utils/context'

  let data = getDataContext()
  let playhead = data.playhead

  // let tapTimes: number[] = []
  let isPreparing = $state(false)

  async function handlePlayPause() {
    if ($data.playback.isPlaying) {
      data.pause()
      return
    }
    isPreparing = true
    try {
      await data.play()
    } finally {
      isPreparing = false
    }
  }

  function handleStop() {
    data.stop()
  }

  let canStop = $derived($data.playback.isPlaying || $playhead.currentSlot >= 0)

  function toggleLoop() {
    data.toggleLoop()
  }

  function toggleCountIn() {
    data.toggleCountIn()
  }

  // TODO: keep or not?
  // function handleTap() {
  //   const now = performance.now()
  //   if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2000) {
  //     tapTimes = []
  //   }
  //   tapTimes = [...tapTimes, now].slice(-5)
  //   if (tapTimes.length >= 2) {
  //     const intervals = tapTimes.slice(1).map((t, i) => t - tapTimes[i])
  //     const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
  //     const bpm = Math.round(60000 / avg)
  //     data.setTempo(Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, bpm)))
  //   }
  // }

  // TODO: keep or not?
  // let progressPct = $derived(
  //   $data.playback.loadProgress.total
  //     ? Math.round(
  //         ($data.playback.loadProgress.loaded /
  //           $data.playback.loadProgress.total) *
  //           100,
  //       )
  //     : 0,
  // )

  let countInLabel = $derived(
    `${$data.groove.timeSignature.beats}/${$data.groove.timeSignature.noteValue}`,
  )

  let loopOn = $derived($data.playback.loop === 'loop')
  let countInOn = $derived($data.playback.countInEnabled)
  let ui = getUIContext()
</script>

<ButtonGroup.Root class="bg-neutral-900/80 backdrop-blur-sm">
  {#if $data.playback.isPlaying}
    <div in:slide={{ axis: 'x' }} out:slide={{ axis: 'x' }}>
      <ButtonWithTooltip
        variant="outline"
        size="icon"
        onclick={handleStop}
        disabled={!canStop}
        aria-label="Stop"
        class="text-muted-foreground hover:text-foreground"
        content="Stop [D] (Reset Playhead)"
        tooltipContentProps={{ align: 'start' }}
        tooltipRootProps={{ triggerId: 'playback-stop' }}
      >
        <Square class="size-4" />
      </ButtonWithTooltip>
    </div>
  {/if}

  <ButtonWithTooltip
    variant="outline"
    size="icon"
    class="aria-pressed:bg-primary aria-pressed:text-primary-foreground over:text-foreground"
    onclick={handlePlayPause}
    disabled={isPreparing}
    aria-label={$data.playback.isPlaying ? 'Pause' : 'Play'}
    content={[$data.playback.isPlaying ? 'Pause' : 'Play', ' [Space]'].join('')}
    tooltipContentProps={{ align: 'start' }}
  >
    {#if isPreparing}
      <span
        class="border-primary-foreground/30 border-t-primary-foreground inline-block size-4 animate-spin rounded-full border-2"
        aria-hidden="true"
      ></span>
    {:else if $data.playback.isPlaying}
      <Pause class="size-5" />
    {:else}
      <Play class="size-5" />
    {/if}
  </ButtonWithTooltip>

  <ToggleWithTooltip
    variant="outline"
    size="icon"
    class="aria-pressed:bg-primary aria-pressed:text-primary-foreground over:text-foreground"
    pressed={loopOn}
    onPressedChange={() => toggleLoop()}
    aria-label="Toggle loop"
    content="Loop [C]"
  >
    <RotateCw class="size-4" />
  </ToggleWithTooltip>

  <ToggleWithTooltip
    variant="outline"
    size="icon"
    class="aria-pressed:bg-primary aria-pressed:text-primary-foreground hover:text-foreground"
    pressed={countInOn}
    onPressedChange={() => toggleCountIn()}
    content="Count-in one bar of {countInLabel}"
  >
    <Timer class="size-4" />
  </ToggleWithTooltip>
</ButtonGroup.Root>

<div class="bg-secondary mx-2 h-10 w-px">&nbsp;</div>

<PlaybackClick />
<PlaybackClickControl />

{#if !$ui.practiceMode.active}
  <div class="bg-secondary mx-2 h-10 w-px">&nbsp;</div>

  <div class="flex items-center justify-center bg-neutral-900/80">
    <ButtonWithTooltip
      variant="outline"
      size="icon"
      class="text-muted-foreground hover:text-foreground"
      onclick={() => ui.togglePracticeMode()}
      content="Practice mode (P)"
      aria-label="Toggle Practice mode"
      aria-pressed={$ui.previewMode}
      tooltipContentProps={{ sideOffset: 10 }}
    >
      <CircleParking class="size-5" />
    </ButtonWithTooltip>
  </div>
{/if}
