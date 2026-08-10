<script lang="ts">
  import { quintOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'

  import GrooveGrid from '$lib/components/groove-editor/components/GrooveGrid.svelte'
  import GrooveSettings from '$lib/components/groove-editor/components/GrooveSettings.svelte'
  import { getUIContext } from '$lib/utils/context'

  let ui = getUIContext()
</script>

{#if $ui.previewMode && !$ui.practiceMode.active}
  <div
    class="no-print bg-background fixed bottom-0 left-0 z-50 flex h-0 w-full min-w-0 flex-col items-stretch justify-start border-t transition-[height,min-height] duration-300 ease-out"
    in:slide={{ duration: 100, easing: quintOut, axis: 'y' }}
    out:slide={{ duration: 100, easing: quintOut, axis: 'y' }}
  >
    <GrooveSettings />
  </div>
{/if}

{#if !$ui.practiceMode.active && !$ui.previewMode && $ui.editorVisible}
  <div
    in:slide={{ duration: 600, easing: quintOut, axis: 'y' }}
    out:slide={{ duration: 300, easing: quintOut, axis: 'y' }}
    class="no-print bg-background/60 fixed bottom-0 left-0 z-50 max-h-125 w-full border-t backdrop-blur-sm"
  >
    <GrooveSettings />
    <GrooveGrid />
  </div>
{/if}
