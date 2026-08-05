<script lang="ts">
  import { ChevronDown, SlidersHorizontal } from '@lucide/svelte'

  import GrooveDivision from '$lib/components/groove-editor/components/GrooveDivision.svelte'
  import GrooveEditorElements from '$lib/components/groove-editor/components/GrooveEditorElements.svelte'
  import GrooveLength from '$lib/components/groove-editor/components/GrooveLength.svelte'
  import GrooveSwingControl from '$lib/components/groove-editor/components/GrooveSwingControl.svelte'
  import GrooveTimeSignature from '$lib/components/groove-editor/components/GrooveTimeSignature.svelte'
  import { buttonVariants } from '$lib/components/ui/button/button.svelte'
  import * as Popover from '$lib/components/ui/popover/index'
  import { cn } from '$lib/utils'
</script>

<div
  class="absolute -top-11 left-0 flex w-full items-center justify-start gap-2 px-2"
>
  <Popover.Root>
    <Popover.Trigger
      class={cn(
        buttonVariants({ variant: 'outline' }),
        'group flex h-9 w-auto justify-start gap-2 pr-2 pl-2.5 font-sans text-xs',
        'data-[state=open]:bg-red!',
      )}
    >
      <SlidersHorizontal class="size-5" />
      <span class="hidden md:inline-block">Groove Settings</span>
      <ChevronDown
        class="size-4 transition-transform group-data-[state=open]:rotate-180"
      />
    </Popover.Trigger>
    <Popover.Content
      align="start"
      side="top"
      class={cn('min-w-80 overflow-y-auto font-sans text-sm ')}
    >
      {@render GrooveSettingsMain()}
    </Popover.Content>
  </Popover.Root>

  <GrooveEditorElements />
</div>

{#snippet GrooveSettingsMain()}
  <div class="flex flex-col items-stretch justify-start gap-4 divide-y p-3">
    <GrooveTimeSignature />
    <GrooveDivision />
    <GrooveLength />
    <GrooveSwingControl />
  </div>
{/snippet}
