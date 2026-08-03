<script lang="ts">
  import {
    ChevronDown,
    CircleX,
    FileMusic,
    FileText,
    Image,
    Plus,
    Printer,
    Redo2,
    Save,
    SavePen,
    Trash2,
    Undo2,
  } from '@lucide/svelte'

  import { buttonVariants } from '$lib/components/ui/button'
  import Button from '$lib/components/ui/button/button.svelte'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index'
  import { cn } from '$lib/utils'
  import { getDataContext } from '$lib/utils/context'

  const data = getDataContext()
</script>

<Button
  variant="outline"
  size="icon-sm"
  class="text-muted-foreground hover:text-foreground size-9"
>
  <Plus class="size-5" />
  <span class="sr-only">New</span>
</Button>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={cn(
      buttonVariants({ variant: 'outline', size: 'sm' }),
      'group text-muted-foreground h-9 gap-2 font-sans  text-sm ',
    )}
  >
    <FileText class="size-4" />
    {#if $data.groove.name.length}
      <span>{$data.groove.name}</span>
    {:else}
      <span>Untitled</span>
    {/if}

    <ChevronDown
      class="size-4 transition-transform group-data-[state=open]:rotate-180"
    />
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="min-w-64  text-sm">
    <DropdownMenu.Group class="gap-2">
      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <Plus class="size-5" />
        <span>New File</span>
      </DropdownMenu.Item>

      <DropdownMenu.Separator />
      <DropdownMenu.Label class="text-muted-foreground/50 cursor-default">
        Current File
      </DropdownMenu.Label>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <Save class="size-5" />
        <span>Save</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <SavePen class="size-5" />
        <span>Rename</span>
      </DropdownMenu.Item>

      <DropdownMenu.Separator />

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <CircleX class="size-5" />
        <span>Clear Lanes</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <Undo2 class="size-5" />
        <span>Undo</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <Redo2 class="size-5" />
        <span>Redo</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <Trash2 class="size-5" />
        <span>Clear History</span>
      </DropdownMenu.Item>

      <DropdownMenu.Separator />
      <DropdownMenu.Label class="text-muted-foreground/50 cursor-default">
        Export Document
      </DropdownMenu.Label>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <Image class="size-5" />
        <span>Save as PNG</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <FileMusic class="size-5" />
        <span>Save as MIDI</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
        ><Printer class="size-5" />
        <span>Print Notation</span>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
