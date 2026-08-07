<script lang="ts">
  import { SlidersHorizontal } from '@lucide/svelte'

  import GrooveDivision from '$lib/components/groove-editor/components/GrooveDivision.svelte'
  import GrooveEditorElements from '$lib/components/groove-editor/components/GrooveEditorElements.svelte'
  import GrooveLength from '$lib/components/groove-editor/components/GrooveLength.svelte'
  import GrooveSwingControl from '$lib/components/groove-editor/components/GrooveSwingControl.svelte'
  import GrooveTimeSignature from '$lib/components/groove-editor/components/GrooveTimeSignature.svelte'
  import { buttonVariants } from '$lib/components/ui/button/button.svelte'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import * as Drawer from '$lib/components/ui/drawer/index'
  import { cn } from '$lib/utils'
  import { getUIContext } from '$lib/utils/context'

  let ui = getUIContext()
</script>

<div
  class="absolute -top-11 left-0 flex w-full items-center justify-between gap-2 px-2"
>
  <div class="bg-background flex items-center justify-start">
    <Drawer.Root direction="left">
      <Drawer.Trigger>
        <ButtonWithTooltip
          content="Groove Settings"
          tooltipContentProps={{ align: 'start' }}
          class={cn(
            buttonVariants({ variant: 'outline' }),
            'group flex h-9 w-auto justify-start gap-2 pr-2 pl-2.5 font-sans text-xs',
            'data-[state=open]:bg-red!',
          )}
        >
          <SlidersHorizontal class="size-5" />
          <span class="sr-only">Groove Settings</span>
        </ButtonWithTooltip>
      </Drawer.Trigger>

      <Drawer.Content class={cn('min-w-80 overflow-y-auto font-sans text-sm ')}>
        {@render GrooveSettingsMain()}
      </Drawer.Content>
    </Drawer.Root>
  </div>

  {#if !$ui.previewMode && $ui.editorVisible}
    <GrooveEditorElements />
  {/if}
</div>

{#snippet GrooveSettingsMain()}
  <div class="flex flex-col items-stretch justify-start gap-4 divide-y p-3">
    <GrooveTimeSignature />
    <GrooveDivision />
    <GrooveLength />
    <GrooveSwingControl />
  </div>
{/snippet}
