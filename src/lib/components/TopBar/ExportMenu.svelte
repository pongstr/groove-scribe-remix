<script lang="ts">
  import { FileUp } from '@lucide/svelte'

  import {
    exportSvgElementAsPng,
    findNotationSvg,
  } from '$lib/components/TopBar/svg-export'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { cn } from '$lib/utils'
  import { downloadGrooveAsMidi } from '$lib/utils/audio/midi-export'
  import { getDataContext } from '$lib/utils/context'

  const data = getDataContext()

  let exportingPng = $state(false)
  let errorMessage = $state<string | null>(null)

  function handlePrint() {
    errorMessage = null
    setTimeout(() => window.print(), 30)
  }

  async function handleExportPng() {
    const svg = findNotationSvg()
    if (!svg) {
      errorMessage = 'Could not find the notation staff to export.'
      return
    }
    exportingPng = true
    errorMessage = null
    try {
      const safeName =
        ($data.groove.name || 'groove').replace(/[^a-z0-9-_ ]/gi, '_').trim() ||
        'groove'
      await exportSvgElementAsPng(svg, `${safeName}.png`)
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : 'Could not export PNG.'
    } finally {
      exportingPng = false
    }
  }

  function handleExportMidi() {
    errorMessage = null
    downloadGrooveAsMidi($data.groove)
  }
</script>

<DropdownMenu.Root
  onOpenChange={(open) => {
    if (open) errorMessage = null
  }}
>
  <DropdownMenu.Trigger
    class={cn(
      buttonVariants({ variant: 'secondary', size: 'sm' }),
      'h-9 gap-2.5 text-xs font-bold',
    )}
  >
    <FileUp class="size-4" />
    <span>Export Groove&nbsp;</span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end" class="w-55">
    <DropdownMenu.Item onclick={handlePrint} class="items-start gap-2 py-2">
      <span class="text-base" aria-hidden="true">🖨️</span>
      <span class="flex flex-col gap-0.5">
        <span class="text-popover-foreground text-sm font-bold">Print</span>
        <span class="text-muted-foreground text-xs"
          >Notation-only page layout</span
        >
      </span>
    </DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={handleExportPng}
      disabled={exportingPng}
      class="items-start gap-2 py-2"
    >
      <span class="text-base" aria-hidden="true">🖼️</span>
      <span class="flex flex-col gap-0.5">
        <span class="text-popover-foreground text-sm font-bold"
          >Save as PNG</span
        >
        <span class="text-muted-foreground text-xs">Notation staff image</span>
      </span>
    </DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={handleExportMidi}
      class="items-start gap-2 py-2"
    >
      <span class="text-base" aria-hidden="true">🎹</span>
      <span class="flex flex-col gap-0.5">
        <span class="text-popover-foreground text-sm font-bold"
          >Save as MIDI</span
        >
        <span class="text-muted-foreground text-xs">Import into your DAW</span>
      </span>
    </DropdownMenu.Item>
    {#if errorMessage}
      <p class="text-destructive px-2 py-1 text-xs">{errorMessage}</p>
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
