<script lang="ts">
  import { quintOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  import { SlidersHorizontal } from '@lucide/svelte'

  import GrooveDivision from '$lib/components/groove-editor/components/GrooveDivision.svelte'
  import GrooveEditorElements from '$lib/components/groove-editor/components/GrooveEditorElements.svelte'
  import GrooveLength from '$lib/components/groove-editor/components/GrooveLength.svelte'
  import GrooveSwingControl from '$lib/components/groove-editor/components/GrooveSwingControl.svelte'
  import GrooveTimeSignature from '$lib/components/groove-editor/components/GrooveTimeSignature.svelte'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import * as ButtonGroup from '$lib/components/ui/button-group/index'
  import * as Drawer from '$lib/components/ui/drawer/index'
  import { cn } from '$lib/utils'
  import { getUIContext } from '$lib/utils/context'

  let ui = getUIContext()
</script>

<div class="absolute -top-12 w-full">
  <div class="mx-auto flex max-w-6xl items-center justify-start gap-4 px-4">
    <ButtonGroup.Root class="bg-background/40">
      {@render GrooveDrawer()}
    </ButtonGroup.Root>

    {#if !$ui.previewMode && $ui.editorVisible}
      <div
        class="flex flex-1 items-center justify-between gap-4"
        in:fly={{ y: -40, easing: quintOut, duration: 400, delay: 400 }}
        out:fly={{ y: 40, easing: quintOut, duration: 300 }}
      >
        <GrooveEditorElements />
      </div>
    {/if}
  </div>
</div>

{#snippet GrooveDrawer()}
  <Drawer.Root direction="left">
    <Drawer.Trigger>
      <ButtonWithTooltip
        variant="outline"
        size="icon"
        content="Groove Settings"
        tooltipContentProps={{ align: 'start', sideOffset: 10 }}
      >
        <SlidersHorizontal class="size-5" />
        <span class="sr-only">Groove Settings</span>
      </ButtonWithTooltip>
    </Drawer.Trigger>

    <Drawer.Content class={cn('min-w-80 overflow-y-auto font-sans text-sm ')}>
      {@render GrooveSettingsMain()}
    </Drawer.Content>
  </Drawer.Root>
{/snippet}

{#snippet GrooveSettingsMain()}
  <div class="flex flex-col items-stretch justify-start gap-4 divide-y p-3">
    <GrooveTimeSignature />
    <GrooveDivision />
    <GrooveLength />
    <GrooveSwingControl />
  </div>
{/snippet}
