<script lang="ts">
  import { cubicIn, cubicOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'

  import GrooveGrid from '$lib/components/groove-editor/components/GrooveGrid.svelte'
  import GrooveSettings from '$lib/components/groove-editor/components/GrooveSettings.svelte'
  import { getUIContext } from '$lib/utils/context'

  let ui = getUIContext()
</script>

{#if $ui.previewMode && !$ui.practiceMode.active}
  <div
    class="no-print bg-background relative bottom-0 left-0 flex h-0 w-full min-w-0 flex-col items-stretch justify-start border-t transition-[height,min-height] duration-300 ease-out"
    in:slide={{ duration: 50, easing: cubicIn, axis: 'y' }}
    out:slide={{ duration: 50, easing: cubicOut, axis: 'y' }}
  >
    <GrooveSettings />
  </div>
{/if}

{#if !$ui.practiceMode.active && !$ui.previewMode && $ui.editorVisible}
  <div
    class="no-print bg-background relative bottom-0 left-0 flex max-h-125 min-h-50 w-full min-w-0 flex-col items-stretch justify-start border-t transition-[height,min-height] duration-300 ease-out"
    in:slide={{ duration: 250, easing: cubicIn, axis: 'y' }}
    out:slide={{ duration: 250, easing: cubicOut, axis: 'y' }}
  >
    <GrooveSettings />
    <GrooveGrid />
  </div>
{/if}
