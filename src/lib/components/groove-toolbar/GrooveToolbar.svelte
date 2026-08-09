<script lang="ts">
  import { cubicIn, cubicOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  import { CircleQuestionMark, Keyboard } from '@lucide/svelte'

  import PracticeModeBar from '$lib/components/groove-notation/components/PracticeModeBar.svelte'
  import PlaybackControls from '$lib/components/groove-toolbar/components/PlaybackControls.svelte'
  import PlaybackFile from '$lib/components/groove-toolbar/components/PlaybackFile.svelte'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import { cn } from '$lib/utils'
  import { getUIContext } from '$lib/utils/context'

  let ui = getUIContext()
</script>

{#if !$ui.practiceMode.active}
  <div
    in:fly={{ y: 20, easing: cubicIn, duration: 300 }}
    out:fly={{ y: 20, easing: cubicOut, duration: 300 }}
    class={cn(
      'no-print fixed top-0 left-0 flex h-16 w-full items-center justify-between gap-2 px-4 select-none',
      'bottom-10',
    )}
  >
    <div class="flex w-60 items-center justify-start gap-1">
      {@render LeftSection()}
    </div>

    <div class="flex items-center justify-center gap-1">
      <PlaybackControls />
    </div>

    <div class="flex w-60 items-center justify-end gap-1">
      {@render RightSection()}
    </div>
  </div>
{/if}

{#if $ui.practiceMode.active}
  <div
    in:fly={{ y: 20, easing: cubicIn, duration: 300 }}
    out:fly={{ y: 20, easing: cubicOut, duration: 300 }}
    class="no-print bg-background fixed top-0 left-0 z-20 flex h-16 w-full items-center select-none"
  >
    <PracticeModeBar>
      <PlaybackControls />
    </PracticeModeBar>
  </div>
{/if}

{#snippet LeftSection()}
  <PlaybackFile />
{/snippet}

{#snippet RightSection()}
  <div class="ml-auto flex items-center justify-end">
    <ButtonWithTooltip
      variant="ghost"
      size="icon"
      class="hover:text-muted-foreground"
      onclick={() => ui.openShortcuts()}
      aria-label="Keyboard shortcuts"
      content="Hotkeys (H)"
      tooltipContentProps={{ align: 'end', sideOffset: 14 }}
    >
      <Keyboard class="size-4" />
    </ButtonWithTooltip>

    <ButtonWithTooltip
      variant="ghost"
      size="icon"
      class="hover:text-muted-foreground"
      onclick={() => ui.toggleHelp()}
      aria-label="Help and notation key"
      content="Help Docs"
      tooltipContentProps={{ align: 'end', sideOffset: 14 }}
    >
      <CircleQuestionMark class="size-4" />
    </ButtonWithTooltip>
  </div>
{/snippet}
