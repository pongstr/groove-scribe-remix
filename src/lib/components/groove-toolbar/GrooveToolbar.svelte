<script lang="ts">
  import { quintOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'

  import PracticeModeBar from '$lib/components/groove-notation/components/PracticeModeBar.svelte'
  import PlaybackControls from '$lib/components/groove-toolbar/components/PlaybackControls.svelte'
  import PlaybackFile from '$lib/components/groove-toolbar/components/PlaybackFile.svelte'
  import ToolbarAssistButtons from '$lib/components/groove-toolbar/components/ToolbarAssistButtons.svelte'
  import { getUIContext } from '$lib/utils/context'

  let ui = getUIContext()
</script>

{#if !$ui.practiceMode.active}
  <div
    in:fly={{ duration: 600, easing: quintOut, y: 40 }}
    out:fly={{ duration: 300, easing: quintOut, y: -40 }}
    class="no-print fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between gap-2 px-4 select-none"
  >
    <div class="flex w-72 items-center justify-start gap-1">
      {@render LeftSection()}
    </div>

    <div class="flex items-center justify-center gap-1">
      <PlaybackControls />
    </div>

    <div class="flex w-72 items-center justify-end gap-1">
      {@render RightSection()}
    </div>
  </div>
{/if}

{#if $ui.practiceMode.active}
  <div
    in:fly={{ duration: 600, easing: quintOut, y: 40 }}
    out:fly={{ duration: 300, easing: quintOut, y: -40 }}
    class="no-print fixed top-0 left-0 z-20 flex h-16 w-full items-center select-none"
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
  <ToolbarAssistButtons class="ml-auto" />
{/snippet}
