<script lang="ts">
  import {
    BrushCleaning,
    ChevronDown,
    FileMusic,
    FileText,
    FolderOpen,
    Image,
    Pencil,
    Plus,
    Printer,
    Redo2,
    Save,
    Undo2,
  } from '@lucide/svelte'

  import {
    exportSvgElementAsPng,
    findNotationSvg,
  } from '$lib/components/groove-editor/components/svg-export'
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index'
  import { buttonVariants } from '$lib/components/ui/button'
  import Button from '$lib/components/ui/button/button.svelte'
  import * as Dialog from '$lib/components/ui/dialog/index'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index'
  import Input from '$lib/components/ui/input/input.svelte'
  import { cn } from '$lib/utils'
  import { downloadGrooveAsMidi } from '$lib/utils/audio/midi-export'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import * as db from '$lib/utils/storage/db'

  let ui = getUIContext()
  let data = getDataContext()
  let history = data.history

  let savedTimer: ReturnType<typeof setTimeout> | null = null
  let isSaving = $state(false)
  let justSaved = $state(false)
  let openRename = $state(false)
  let hasHistory = $derived($history.canUndo || $history.canRedo)

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

  function handleNewGroove() {
    if (
      $data.dirty &&
      !confirm(
        'Start a new groove? Unsaved changes will be lost unless you save first.',
      )
    )
      return
    data.newGroove()
  }

  function handleNameInput(e: Event) {
    data.setName((e.target as HTMLInputElement).value)
  }

  async function handleSave() {
    if (isSaving) return
    isSaving = true
    try {
      const name = $data.groove.name.trim() ?? 'Untitled Groove'
      const record = await db.saveGroove(name, $data.groove, $data.groove.id)
      data.applySavedRecord(record)
      ui.syncQueueGroove(record.id, record.name, record.data)
      justSaved = true
      if (savedTimer) clearTimeout(savedTimer)
      savedTimer = setTimeout(() => {
        justSaved = false
      }, 1800)
    } catch (err) {
      console.error('Failed to save groove', err)
      alert('Could not save this groove. Please try again.')
    } finally {
      isSaving = false
      if (openRename) {
        openRename = false
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      void handleSave()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<Button
  variant="outline"
  size="icon-sm"
  class="text-muted-foreground hover:text-foreground size-9"
  onclick={() => ui.showDrawer('mine')}
>
  <FolderOpen class="size-5" />
  <span class="sr-only">New</span>
</Button>

<Button
  variant="outline"
  size="icon-sm"
  class="text-muted-foreground hover:text-foreground size-9"
  onclick={handleNewGroove}
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
      <DropdownMenu.Label class="text-muted-foreground/50 cursor-default">
        Current File
      </DropdownMenu.Label>

      <DropdownMenu.Item
        disabled={isSaving || justSaved}
        onclick={handleSave}
        class={cn(
          'text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs',
        )}
      >
        <Save class="size-5" />
        <span>Save</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        onSelect={() => (openRename = !openRename)}
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <Pencil class="size-4" />
        <span>Rename</span>
      </DropdownMenu.Item>

      <DropdownMenu.Separator />
      <DropdownMenu.Label class="text-muted-foreground/50 cursor-default">
        History
      </DropdownMenu.Label>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
        onSelect={() => data.undo()}
        disabled={!$history.canUndo}
      >
        <Undo2 class="size-5" />
        <span>Undo</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
        onSelect={() => data.redo()}
        disabled={!$history.canRedo}
      >
        <Redo2 class="size-5" />
        <span>Redo</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
        onSelect={() => data.clearHistory()}
        disabled={!hasHistory}
      >
        <BrushCleaning class="size-5" />
        <span>Clear Lanes</span>
      </DropdownMenu.Item>

      <DropdownMenu.Separator />
      <DropdownMenu.Label class="text-muted-foreground/50 cursor-default">
        Export Document
      </DropdownMenu.Label>

      <DropdownMenu.Item
        onSelect={handleExportPng}
        disabled={exportingPng}
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <Image class="size-5" />
        <span>Save as PNG</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        onSelect={handleExportMidi}
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <FileMusic class="size-5" />
        <span>Save as MIDI</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item
        onSelect={handlePrint}
        class="text-muted-foreground hover:text-foreground flex items-center justify-start gap-3 px-3 py-2  text-xs"
      >
        <Printer class="size-5" />
        <span>Print Notation</span>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root open={openRename}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Rename Groove File</Dialog.Title>
    </Dialog.Header>

    <div class="space-y-4">
      <Input
        type="text"
        value={$data.groove.name}
        oninput={handleNameInput}
        placeholder="Untitled Groove"
        class="text-foreground hover:border-border focus-visible:border-border focus-visible:bg-background h-8 rounded-lg text-lg font-bold"
      />

      <Button class="h-9" onclick={handleSave}>Rename</Button>
    </div>
  </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root open={Boolean(errorMessage)}>
  <AlertDialog.Content>
    {errorMessage}
  </AlertDialog.Content>
</AlertDialog.Root>
