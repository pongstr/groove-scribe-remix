<script lang="ts">
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

  type Props = { disabled: boolean }
  let { disabled = true }: Props = $props()
</script>

{#if !disabled}
  <div
    class="absolute -top-11 left-0 flex w-full items-center justify-between gap-2 px-2"
  >
    <div class="flex items-center justify-start">
      <ButtonGroup.Root class="bg-background/80">
        {@render GrooveDrawer()}
      </ButtonGroup.Root>
    </div>

    {#if !$ui.previewMode && $ui.editorVisible}
      <GrooveEditorElements />
    {/if}
  </div>
{/if}

<div class="absolute -top-12 w-full">
  <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
    <ButtonGroup.Root class="bg-background/40">
      {@render GrooveDrawer()}
    </ButtonGroup.Root>

    {#if !$ui.previewMode && $ui.editorVisible}
      <GrooveEditorElements />
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
