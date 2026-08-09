<script lang="ts">
  import NotationStaff from '$lib/components/groove-notation/components/NotationStaff.svelte'
  import { hydrateQueueItem } from '$lib/components/groove-notation/components/queue-hydrate'
  import { getDataContext, getUIContext } from '$lib/utils/context'

  let data = getDataContext()
  let ui = getUIContext()

  let stackEl = $state<HTMLDivElement | null>(null)

  async function selectItem(index: number) {
    const item = ui.selectQueueIndex(index)
    if (!item) return

    const wasPlaying = $data.playback.isPlaying
    const resolved = await hydrateQueueItem(ui, item)

    data.stop()
    data.load(resolved.data, resolved.name, { clearHistory: false })
    if (wasPlaying) {
      void data.play({ skipCountIn: true })
    }
  }

  $effect(() => {
    const root = stackEl
    if (!root) return

    const index = $ui.practiceMode.currentIndex
    const target = root.querySelector(`[data-queue-index="${index}"]`)
    if (!(target instanceof HTMLElement)) return

    // Wait a frame so notation layout can settle before scrolling.
    requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })
    })
  })
</script>

<div
  bind:this={stackEl}
  class="flex flex-col items-stretch justify-start gap-8"
>
  {#if $ui.practiceMode.queue.length === 0}
    <p class="text-muted-foreground px-1 text-sm">
      Queue grooves from the practice sidebar, then step through them here.
    </p>
  {:else}
    {#each $ui.practiceMode.queue as item, index (item.id)}
      {@render GrooveNotation(item, index)}
    {/each}
  {/if}
</div>

{#snippet GrooveNotation(item: App.UI.PracticeQueueItem, index: number)}
  {@const isCurrent = index === $ui.practiceMode.currentIndex}
  <section
    data-queue-index={index}
    class={[
      'border-border/60 relative border p-4 transition-colors',
      isCurrent
        ? 'border-primary bg-background/80 shadow-sm'
        : 'bg-background/50 hover:border-border',
    ]}
  >
    <button
      type="button"
      class="flex w-full items-center gap-2 px-4 pt-3 text-left"
      onclick={() => selectItem(index)}
    >
      <span class="text-muted-foreground text-xs font-bold tabular-nums">
        {index + 1}.
      </span>

      <span
        class="text-foreground min-w-0 flex-1 truncate text-sm font-semibold"
      >
        {item.name}
      </span>

      {#if isCurrent}
        <span
          class="bg-primary absolute top-4 right-4 block size-4 rounded-full"
        >
          &nbsp;
        </span>
      {/if}
    </button>

    <div class="pointer-events-none">
      <NotationStaff groove={item.data} active={isCurrent} showHeader={false} />
    </div>
  </section>
{/snippet}
