<script lang="ts">
  import type { Snippet } from 'svelte'
  import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    CircleQuestionMark,
    Keyboard,
    X,
  } from '@lucide/svelte'

  import PracticeSettings from '$lib/components/groove-notation/components/PracticeSettings.svelte'
  import {
    hydrateQueueItem,
    hydrateQueueOnPracticeEnter,
    resolvePracticeNaturalEnd,
  } from '$lib/components/groove-notation/components/queue-hydrate'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import * as ButtonGroup from '$lib/components/ui/button-group/index'
  import ToggleWithTooltip from '$lib/components/ui/toggle/toggle-with-tooltip.svelte'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { applyUiPrefsToGroove } from '$lib/utils/shortcuts'

  type Props = { children?: Snippet }

  let { children }: Props = $props()

  let data = getDataContext()
  let ui = getUIContext()

  // Seed from current transport so leftover editor once-play ends are not treated as new.
  let lastNaturalEnd = $state($data.playback.naturalEndCount)
  let wasPracticeActive = $state(false)

  async function loadQueueItem(
    item: App.UI.PracticeQueueItem | null,
    autoPlay = false,
  ) {
    if (!item) return
    const resolved = await hydrateQueueItem(ui, item)

    data.stop()
    data.load(resolved.data, resolved.name, { clearHistory: false })

    applyUiPrefsToGroove(ui, data, { quiet: true })

    if (autoPlay) {
      void data.play({ skipCountIn: true })
    }
  }

  function goPrev() {
    const wasPlaying = $data.playback.isPlaying
    void loadQueueItem(ui.prevInQueue(), wasPlaying)
  }

  function goNext() {
    const wasPlaying = $data.playback.isPlaying
    void loadQueueItem(ui.nextInQueue(), wasPlaying)
  }

  $effect(() => {
    const count = $data.playback.naturalEndCount
    const chainAt = $data.playback.naturalEndAt
    const action = resolvePracticeNaturalEnd({
      lastNaturalEnd,
      count,
      active: $ui.practiceMode.active,
      autoAdvance: $ui.practiceMode.autoAdvance,
      queueLength: $ui.practiceMode.queue.length,
      loop: $data.playback.loop,
      chainAt,
    })

    if (action === 'ignore') {
      lastNaturalEnd = count
      return
    }

    lastNaturalEnd = count

    if (action === 'stop') {
      // Early natural-end notify must not cut the last bars or the chain window.
      if (chainAt == null) data.stop()
      return
    }

    const item = ui.nextInQueue()
    if (!item || chainAt == null) {
      // Missing item still lets last bars finish; only stop if no halt time.
      if (chainAt == null) data.stop()
      return
    }

    data.chainPlay(item.data, item.name, chainAt)
    applyUiPrefsToGroove(ui, data, { quiet: true })
    void hydrateQueueItem(ui, item)
  })

  $effect(() => {
    const active = $ui.practiceMode.active
    if (active && !wasPracticeActive) {
      void hydrateQueueOnPracticeEnter(ui, data)
    }
    wasPracticeActive = active
  })
</script>

<div class="no-print flex w-full flex-wrap items-center justify-between px-4">
  <div class="flex w-72 items-center justify-start gap-3">
    <PracticeSettings />

    <ButtonGroup.Root class="bg-background/20">
      {@render PracticeTools()}
    </ButtonGroup.Root>

    <ToggleWithTooltip
      variant="outline"
      size="icon"
      pressed={$ui.practiceMode.autoAdvance}
      class="text-muted-foreground font-semibold data-[state=on]:text-violet-400 data-[state=on]:*:[svg]:stroke-violet-400"
      onPressedChange={() => ui.setAutoAdvance(!$ui.practiceMode.autoAdvance)}
      content="Flow Mode"
      tooltipContentProps={{ align: 'start', sideOffset: 10 }}
    >
      <ArrowUpDown class="size-5" />
    </ToggleWithTooltip>
  </div>

  {#if children}
    <div class="flex items-center justify-start gap-1">
      {@render children()}

      <div class="bg-secondary mx-2 h-10 w-px">&nbsp;</div>

      <ButtonWithTooltip
        size="icon"
        variant="outline"
        content="Exit Practice Mode"
        onclick={ui.exitPracticeMode}
        tooltipContentProps={{ align: 'center', sideOffset: 10 }}
      >
        <X class="size-5" />
      </ButtonWithTooltip>
    </div>
  {/if}

  <div class="flex w-72 items-center justify-end gap-2">
    <ButtonWithTooltip
      variant="ghost"
      size="icon"
      class="hover:text-muted-foreground"
      onclick={() => ui.toggleShortcuts(!$ui.shortcutsOpen)}
      aria-label="Keyboard shortcuts"
      content="Hotkeys (H)"
      tooltipContentProps={{ align: 'end', sideOffset: 10 }}
    >
      <Keyboard class="size-5" />
    </ButtonWithTooltip>

    <ButtonWithTooltip
      variant="ghost"
      size="icon"
      class="hover:text-muted-foreground"
      onclick={() => ui.toggleHelp(!$ui.helpOpen)}
      aria-label="Help and notation key"
      content="Help Docs"
      tooltipContentProps={{ align: 'end', sideOffset: 10 }}
    >
      <CircleQuestionMark class="size-5" />
    </ButtonWithTooltip>
  </div>
</div>

{#snippet PracticeTools()}
  <ButtonWithTooltip
    size="icon"
    variant="outline"
    aria-label="Previous in queue"
    content="Previous in queue"
    onclick={goPrev}
    disabled={$ui.practiceMode.queue.length < 2}
    tooltipContentProps={{ align: 'start', sideOffset: 10 }}
  >
    <ChevronLeft class="size-5" />
  </ButtonWithTooltip>

  <ButtonWithTooltip
    size="icon"
    variant="outline"
    onclick={goNext}
    aria-label="Next in queue"
    content="Next in queue"
    disabled={$ui.practiceMode.queue.length < 2}
    tooltipContentProps={{ align: 'start', sideOffset: 10 }}
  >
    <ChevronRight class="size-5" />
  </ButtonWithTooltip>
{/snippet}
