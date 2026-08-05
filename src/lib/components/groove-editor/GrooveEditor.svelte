<script lang="ts">
  import { backIn, cubicOut } from 'svelte/easing'
  import { fly, slide } from 'svelte/transition'

  import GrooveGrid from '$lib/components/groove-editor/components/GrooveGrid.svelte'
  // import FileMenu from '$lib/components/TopBar/FileMenu.svelte'
  // import GrooveSettings from '$lib/components/TopBar/GrooveSettings.svelte'
  // import StripGridOptionToggle from '$lib/components/TopBar/StripGridOptionToggle.svelte'
  import GrooveSettings from '$lib/components/groove-editor/components/GrooveSettings.svelte'
  import { cn } from '$lib/utils'
  import { getUIContext } from '$lib/utils/context'

  let ui = getUIContext()
</script>

{#if !$ui.practiceMode.active && !$ui.previewMode}
  <div
    in:fly={{ y: 50, easing: backIn, delay: 200 }}
    out:slide={{ duration: 300, easing: cubicOut, axis: 'y' }}
    class={cn(
      'no-print bg-background relative bottom-0 left-0 flex max-h-125 min-h-50 w-full min-w-0 flex-col items-stretch justify-start border-t transition-[height,min-height] duration-300 ease-out',
    )}
  >
    <!-- File menu stays visible when the editor grid is toggled off (X). -->
    <!-- <FileMenu /> -->

    <GrooveSettings />

    {#if $ui.editorVisible}
      <!-- <div class="flex items-stretch justify-between p-3"> -->
      <!-- <GrooveSettings class="absolute -top-20 left-0 px-4" /> -->
      <!-- <StripGridOptionToggle /> -->
      <!-- </div> -->

      <GrooveGrid />
    {/if}
  </div>
{/if}
