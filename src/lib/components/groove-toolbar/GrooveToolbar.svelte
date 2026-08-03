<script lang="ts">
  import { cubicIn, cubicOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  import { CircleQuestionMark, FolderOpen, Keyboard } from '@lucide/svelte'

  import PracticeModeBar from '$lib/components/groove-notation/components/PracticeModeBar.svelte'
  import PlaybackControls from '$lib/components/groove-toolbar/components/PlaybackControls.svelte'
  import PlaybackFile from '$lib/components/groove-toolbar/components/PlaybackFile.svelte'
  import { Button } from '$lib/components/ui/button'
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
      'bg-background/80 bottom-10 backdrop-blur-xs',
    )}
  >
    <div class="flex w-60 items-center justify-start gap-3">
      {@render LeftSection()}
    </div>

    <div class="flex items-center justify-start gap-3">
      <PlaybackControls />
    </div>

    <div class="flex w-60 items-center justify-end gap-3">
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
  <Button
    variant="outline"
    size="sm"
    class="h-9 gap-3 text-xs font-bold"
    onclick={() => ui.showDrawer('mine')}
  >
    <FolderOpen class="size-4" />
    <span class="sr-only">My Groove</span>
  </Button>

  <PlaybackFile />
{/snippet}

{#snippet RightSection()}
  <Button
    variant="outline"
    size="icon"
    class="text-muted-foreground hover:text-foreground ml-auto size-9"
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
{/snippet}
