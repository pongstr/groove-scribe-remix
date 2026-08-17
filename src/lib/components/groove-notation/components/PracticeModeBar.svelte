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
  import { hydrateQueueItem } from '$lib/components/groove-notation/components/queue-hydrate'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import * as ButtonGroup from '$lib/components/ui/button-group/index'
  import ToggleWithTooltip from '$lib/components/ui/toggle/toggle-with-tooltip.svelte'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { applyUiPrefsToGroove } from '$lib/utils/shortcuts'

  type Props = { children?: Snippet }

  let { children }: Props = $props()

  let data = getDataContext()
  let ui = getUIContext()

  let lastNaturalEnd = $state(0)
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

    if (!$ui.practiceMode.active) {
      lastNaturalEnd = count
      return
    }

    if (count === lastNaturalEnd) return

    lastNaturalEnd = count

    if (!$ui.practiceMode.autoAdvance) {
      data.stop()
      return
    }

    if ($ui.practiceMode.queue.length < 2) {
      data.stop()
      return
    }

    if ($data.playback.loop === 'loop') return

    const item = ui.nextInQueue()

    if (!item || chainAt == null) {
      data.stop()
      return
    }

    // Chain immediately from the in-memory snapshot; refresh from IndexedDB in the background.
    data.chainPlay(item.data, item.name, chainAt)
    applyUiPrefsToGroove(ui, data, { quiet: true })
    void hydrateQueueItem(ui, item)
  })

  // On practice enter, refresh saved queue snapshots from IndexedDB.
  // Do not data.load here — enterPracticeMode already loads the current index.
  $effect(() => {
    const active = $ui.practiceMode.active
    if (active && !wasPracticeActive) {
      const { queue } = $ui.practiceMode
      void (async () => {
        for (const item of queue) {
          await hydrateQueueItem(ui, item)
        }
        if (!$ui.practiceMode.active) return
        applyUiPrefsToGroove(ui, data, { quiet: true })
      })()
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
