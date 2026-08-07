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
  import Button from '$lib/components/ui/button/button.svelte'
  import Toggle from '$lib/components/ui/toggle/toggle.svelte'
  import type { PracticeQueueItem } from '$lib/components/utils/context/types'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { applyUiPrefsToGroove } from '$lib/utils/shortcuts'

  type Props = { children?: Snippet }

  let { children }: Props = $props()

  let data = getDataContext()
  let ui = getUIContext()

  let lastNaturalEnd = $state(0)
  let wasPracticeActive = $state(false)

  async function loadQueueItem(
    item: PracticeQueueItem | null,
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

<div
  class="no-print flex w-full flex-wrap items-center justify-between gap-3 px-4"
>
  <div class="flex w-60 min-w-0 items-center gap-3">
    <Button variant="outline" class="h-9" onclick={ui.exitPracticeMode}>
      <X class="size-4" />
      <span class="text-muted-foreground font-sans text-sm">
        Exit Practice Mode
      </span>
    </Button>

    <PracticeSettings />
  </div>

  {#if children}
    <div class="flex items-center justify-start gap-3">
      {@render children()}
    </div>
  {/if}

  <div class="flex w-75 items-center justify-end gap-2">
    <Button
      variant="outline"
      size="sm"
      aria-label="Previous in queue"
      onclick={goPrev}
      class="aspect-square h-9"
      disabled={$ui.practiceMode.queue.length < 2}
    >
      <ChevronLeft class="size-4" />
    </Button>

    <Button
      variant="outline"
      class="aspect-square h-9"
      onclick={goNext}
      disabled={$ui.practiceMode.queue.length < 2}
      aria-label="Next in queue"
    >
      <ChevronRight class="size-4" />
    </Button>

    <Toggle
      pressed={$ui.practiceMode.autoAdvance}
      class="text-muted-foreground h-9 font-semibold data-[state=on]:text-violet-400 data-[state=on]:*:[svg]:stroke-violet-400"
      variant="outline"
      onPressedChange={() => ui.setAutoAdvance(!$ui.practiceMode.autoAdvance)}
    >
      <ArrowUpDown class="size-4" />
      <span class="font-sans text-xs">Flow Mode</span>
    </Toggle>

    <Button
      variant="outline"
      size="icon"
      class="text-muted-foreground hover:text-foreground size-9"
      onclick={() => ui.openShortcuts()}
      aria-label="Keyboard shortcuts"
      title="Keyboard shortcuts (H)"
    >
      <Keyboard class="size-4" />
    </Button>

    <Button
      variant="outline"
      size="icon"
      class="text-muted-foreground hover:text-foreground size-9"
      onclick={() => ui.toggleHelp()}
      aria-label="Help and notation key"
    >
      <CircleQuestionMark class="size-4" />
    </Button>
  </div>
</div>
